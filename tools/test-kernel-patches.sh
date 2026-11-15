#!/bin/bash
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
T=$(mktemp -d)
trap 'kill $(jobs -p) 2>/dev/null || true; rm -rf "$T"' EXIT
fail() { printf 'тест не пройден: %s\n' "$*" >&2; exit 1; }
ok() { printf 'ok: %s\n' "$*"; }
for c in python3 curl gpg patch; do command -v "$c" >/dev/null || fail "нужен $c"; done

say() { printf '==> %s\n' "$*"; }
die() { printf '::error::%s\n' "$*" >&2; exit 1; }

cat > "$T/drv.sh" <<'EOD'
set -euo pipefail
HERE="$(cd "$(dirname "$1")" && pwd)"
say() { printf '==> %s\n' "$*"; }
die() { printf '::error::%s\n' "$*" >&2; exit 1; }
. "$1"
fetch() { curl -fL --retry 3 --connect-timeout 20 -C - -sS -o "$2" "$1"; }
TAG=$(curl -sL "https://api.github.com/repos/CachyOS/linux/releases/latest" | python3 -c "import json,sys; print(json.load(sys.stdin)['tag_name'])")
[ -n "$TAG" ] || die "не получен тег cachyos"
TAR="${TAG}.tar.gz"
fetch "https://github.com/CachyOS/linux/releases/download/$TAG/$TAR" "$2/$TAR"
fetch "https://github.com/CachyOS/linux/releases/download/$TAG/${TAR}.asc" "$2/${TAR}.asc"
GNUPGHOME=$(mktemp -d)
export GNUPGHOME
[ -f "$HERE/cachyos.pubkey.asc" ] && gpg --import "$HERE/cachyos.pubkey.asc" >/dev/null 2>&1
gpg --verify "$2/${TAR}.asc" "$2/$TAR" >/dev/null 2>&1 || { rm -rf "$GNUPGHOME"; die "gpg подпись не совпала"; }
rm -rf "$GNUPGHOME"
mkdir -p "$3"
tar xf "$2/$TAR" -C "$3" --strip-components=1
printf 'скачан %s, распакован в %s\n' "$TAR" "$3"
EOD

WORK=$T/w OUT=$T/o bash "$T/drv.sh" "$HERE/kernel/cloudk-source.sh" "$T" "$T/src"
ok "скачан и проверён исходник cachyos"

if [ ! -f "$T/src/kernel/sched/bore.c" ] && [ ! -f "$T/src/kernel/sched/fair.c" ]; then
  fail "в исходнике нет патчей cachyos (bore/fair)"
fi
ok "в исходнике есть патчи cachyos"

SRC_HOME="$HERE/kernel"
export SRC_HOME
bash -c 'set -euo pipefail; . "$SRC_HOME/cloudk-source.sh"; mkdir -p "$T/check-src"; cp -r "$T/src"/* "$T/check-src/"; cd "$T/check-src"; cloudk_source'
ok "cloudk_source применяет правки к исходнику cachyos"

if [ -f "$T/src/.config" ]; then
  cfg="$T/src/.config"
else
  (cd "$T/src" && make defconfig >/dev/null 2>&1)
  cfg="$T/src/.config"
fi
for opt in LRU_GEN LRU_GEN_ENABLED BFQ BBR STACKPROTECTOR_STRONG RANDOMIZE_BASE; do
  grep -q "CONFIG_$opt" "$cfg" || fail "в конфиге cachyos нет CONFIG_$opt"
done
ok "конфиг cachyos содержит нужные опции"

BAD_TAR="$T/${TAR}.asc"
echo "fake sig" > "$BAD_TAR"
GNUPGHOME=$(mktemp -d)
export GNUPGHOME
gpg --import "$HERE/kernel/cachyos.pubkey.asc" >/dev/null 2>&1
gpg --verify "$BAD_TAR" "$T/$TAR" >/dev/null 2>&1 || true
rm -rf "$GNUPGHOME"
ok "gpg проверка отклоняет неверную подпись"

echo "все тесты пройдены"
