#!/bin/bash
set -eu
HERE=$(cd "$(dirname "$0")" && pwd)
SRC=$(dirname "$HERE")/cloudpkg/cloudpkg.c
[ "$(id -u)" = 0 ] || { echo "нужен root" >&2; exit 1; }
T=$(mktemp -d)
trap 'rm -rf "$T"' EXIT
fail() { printf 'тест не пройден: %s\n' "$*" >&2; exit 1; }
ok() { printf 'ok: %s\n' "$*"; }

mkdir -p "$T/bin" "$T/env/dev-libs" "$T/vdb" "$T/vdb2/dev-build/automake-1.17" "$T/proot"
printf '#!/bin/sh\necho "automake (GNU automake) 1.18.1"\n' > "$T/bin/automake"
printf '#!/bin/sh\necho "autoconf (GNU Autoconf) 2.72"\n' > "$T/bin/autoconf"
printf '#!/bin/sh\necho "libtoolize (GNU libtool) 2.5.4"\n' > "$T/bin/libtoolize"
printf '#!/bin/sh\nexit 0\n' > "$T/bin/emerge"
chmod +x "$T"/bin/*

printf 'pre_src_prepare() {\neautoreconf() { :; }\neaclocal() { :; }\n}\n' > "$T/env/cloudos-noreconf"
cp "$T/env/cloudos-noreconf" "$T/env/dev-libs/libuv"
printf 'MAKEOPTS="-j2"\n' > "$T/env/good.conf"
printf 'dev-libs/libuv cloudos-noreconf\napp-misc/x good.conf\n' > "$T/package.env"

build() {
  gcc -std=gnu17 -Wall -Wextra -Werror -O2 -DENVDIR="\"$T/env\"" -DPENV="\"$T/package.env\"" -DVDB="\"$1\"" -o "$2" "$SRC"
}
build "$T/vdb" "$T/cloudpkg"
build "$T/vdb2" "$T/cloudpkg2"
export PATH="$T/bin:$PATH" CLOUDPKG_FORCE=1

"$T/cloudpkg" clean -p 2>/dev/null
[ ! -e "$T/env/cloudos-noreconf" ] && [ -e "$T/env/cloudos-noreconf.bak" ] || fail "cloudos-noreconf не убран"
[ ! -e "$T/env/dev-libs/libuv" ] && [ -e "$T/env/dev-libs/libuv.bak" ] || fail "копия хука для пакета не убрана"
[ -e "$T/env/good.conf" ] || fail "обычный env-файл пользователя тронут"
ok "старые хуки убраны, чужие файлы целы"

! grep -q cloudos-noreconf "$T/package.env" || fail "строка noreconf осталась в package.env"
grep -qx 'app-misc/x good.conf' "$T/package.env" || fail "чужая строка package.env пропала"
ok "package.env почищен"

[ "$(cat "$T/vdb/dev-build/automake-1.18.1/SLOT")" = 1.18 ] || fail "слот automake"
[ "$(cat "$T/vdb/dev-build/autoconf-2.72/SLOT")" = 2.72 ] || fail "слот autoconf"
[ "$(cat "$T/vdb/dev-build/libtool-2.5.4/SLOT")" = 2 ] || fail "слот libtool"
[ "$(cat "$T/vdb/dev-build/automake-1.18.1/CATEGORY")" = dev-build ] || fail "категория"
ok "autotools записаны со слотами 1.18, 2.72, 2"

"$T/cloudpkg" vdb >/dev/null || fail "cloudpkg vdb вернул ошибку"
[ "$(ls "$T/vdb/dev-build" | wc -l)" = 3 ] || fail "повторный запуск изменил базу"
ok "повторный запуск ничего не меняет"

"$T/cloudpkg2" vdb >/dev/null || fail "cloudpkg vdb вернул ошибку при чужом automake"
[ ! -e "$T/vdb2/dev-build/automake-1.18.1" ] || fail "поверх настоящего automake создана запись"
[ -e "$T/vdb2/dev-build/autoconf-2.72" ] || fail "autoconf не записан"
ok "настоящий пакет из portage не затирается"

mkdir -p "$T/proot/env/dev-libs"
cp "$T/env/cloudos-noreconf.bak" "$T/proot/env/cloudos-noreconf"
cp "$T/env/cloudos-noreconf.bak" "$T/proot/env/dev-libs/libuv"
printf 'dev-libs/libuv cloudos-noreconf\n' > "$T/proot/package.env"
CLOUDOS_PORTAGE="$T/proot" bash "$HERE/stage3/cloudos-fix.sh" --files >/dev/null
[ ! -e "$T/proot/env/cloudos-noreconf" ] && [ ! -e "$T/proot/env/dev-libs/libuv" ] || fail "cloudos-fix оставил хуки"
[ ! -s "$T/proot/package.env" ] || fail "cloudos-fix оставил строки package.env"
ok "cloudos-fix --files"
echo "все тесты пройдены"
