#!/bin/bash
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
R=$(dirname "$HERE")
T=$(mktemp -d)
trap 'rm -rf "$T"' EXIT
die() { echo "ошибка: $*" >&2; exit 1; }
command -v minisign >/dev/null || { echo "нет minisign, тест пропущен"; exit 0; }

printf '\n' | minisign -G -f -W -p "$T/k.pub" -s "$T/k.key" >/dev/null
printf '\n' | minisign -G -f -W -p "$T/o.pub" -s "$T/o.key" >/dev/null
echo data > "$T/a.tgz"
echo data2 > "$T/b.tgz"
minisign -S -s "$T/k.key" -m "$T/a.tgz" -x "$T/a.tgz.minisig" </dev/null >/dev/null

cat > "$T/t.c" <<'EOT'
#include "cloudpkg.h"
#undef main
int main(int c, char **v) { (void)c; return verify_sig(v[1], v[2]) ? 0 : 1; }
EOT

build() {
  gcc -std=gnu17 -Wall -Wextra -Werror -Dmain=cloudpkg_main -DPUBKEY="\"$1\"" -I"$R/cloudpkg" -o "$2" "$T/t.c" "$R"/cloudpkg/*.c
}

build "$T/k.pub" "$T/ok" || die "не собралось"
"$T/ok" "$T/a.tgz" "$T/a.tgz.minisig" || die "верная подпись отклонена"
if "$T/ok" "$T/b.tgz" "$T/a.tgz.minisig" 2>/dev/null; then die "изменённый файл принят"; fi
build "$T/o.pub" "$T/other" || die "не собралось"
if "$T/other" "$T/a.tgz" "$T/a.tgz.minisig" 2>/dev/null; then die "чужой ключ принят"; fi
echo "проверка подписи update: ок"
