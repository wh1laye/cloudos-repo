#!/bin/bash
set -eu
HERE=$(cd "$(dirname "$0")" && pwd)
SRC=$(dirname "$HERE")/cloudpkg
[ "$(id -u)" = 0 ] || { echo "нужен root" >&2; exit 1; }
T=$(mktemp -d)
trap 'kill $(jobs -p) 2>/dev/null; gpgconf --homedir "$T/gh" --kill all 2>/dev/null; rm -rf "$T"' EXIT
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
  gcc -std=gnu17 -Wall -Wextra -Werror -O2 ${CFLAGS_EXTRA:-} -DENVDIR="\"$T/env\"" -DPENV="\"$T/package.env\"" -DVDB="\"$1\"" -o "$2" "$SRC"/*.c
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
gcc -std=gnu17 -Wall -Wextra -Werror -O2 ${CFLAGS_EXTRA:-} -DCONF="\"$T/cp.conf\"" -DENVDIR="\"$T/env\"" -DPENV="\"$T/package.env\"" -DVDB="\"$T/vdb\"" -o "$T/cloudpkg3" "$SRC"/*.c
for r in / /var/lib /var/db /var/db/repos /home/user /usr/local /etc/portage; do
  printf 'repo=%s\n' "$r" > "$T/cp.conf"
  "$T/cloudpkg3" list 2>&1 | grep -q 'небезопасный путь' || fail "safe_dir пропустил repo=$r"
done
for r in /var/db/repos/gentoo /var/db/repos/gentoo/ /opt/portage/tree; do
  printf 'repo=%s\n' "$r" > "$T/cp.conf"
  if "$T/cloudpkg3" list 2>&1 | grep -q 'небезопасный путь'; then fail "safe_dir отверг repo=$r"; fi
done
ok "safe_dir: опасные пути отвергаются, нормальные проходят"

for c in gpg curl xz python3; do command -v "$c" >/dev/null || fail "для теста подписи снимка нужен $c"; done
GH=$T/gh
mkdir -p "$GH" "$T/src/gentoo-20260101/profiles" "$T/m1/snapshots" "$T/m2/snapshots" "$T/m3/snapshots"
chmod 700 "$GH"
gk() { gpg --homedir "$GH" --batch --pinentry-mode loopback --passphrase '' --quick-generate-key "$1" rsa2048 sign never >/dev/null 2>&1; }
gk 'snap test <snap@test.invalid>'
gk 'evil test <evil@test.invalid>'
fpr() { gpg --homedir "$GH" --list-keys --with-colons "$1" | awk -F: '/^fpr:/{print $10; exit}'; }
FPR=$(fpr 'snap test')
EFPR=$(fpr 'evil test')
[ -n "$FPR" ] && [ -n "$EFPR" ] && [ "$FPR" != "$EFPR" ] || fail "не создались тестовые ключи"
gpg --homedir "$GH" --batch --armor --export "$FPR" "$EFPR" > "$T/keys.asc"
echo good > "$T/src/gentoo-20260101/profiles/repo_name"
tar -C "$T/src" -cJf "$T/good.tar.xz" gentoo-20260101
echo evil > "$T/src/gentoo-20260101/profiles/repo_name"
tar -C "$T/src" -cJf "$T/bad.tar.xz" gentoo-20260101
sign() { gpg --homedir "$GH" --batch --pinentry-mode loopback --passphrase '' -u "$1" --detach-sign -o "$3" "$2" >/dev/null 2>&1; }
sign "$FPR" "$T/good.tar.xz" "$T/good.sig"
sign "$EFPR" "$T/bad.tar.xz" "$T/evil.sig"
cp "$T/bad.tar.xz" "$T/m1/snapshots/portage-latest.tar.xz"; cp "$T/good.sig" "$T/m1/snapshots/portage-latest.tar.xz.gpgsig"
cp "$T/good.tar.xz" "$T/m2/snapshots/portage-latest.tar.xz"; cp "$T/good.sig" "$T/m2/snapshots/portage-latest.tar.xz.gpgsig"
cp "$T/bad.tar.xz" "$T/m3/snapshots/portage-latest.tar.xz"; cp "$T/evil.sig" "$T/m3/snapshots/portage-latest.tar.xz.gpgsig"
P1=18741; P2=18742; P3=18743
for pair in "m1 $P1" "m2 $P2" "m3 $P3"; do
  set -- $pair
  python3 -m http.server "$2" --bind 127.0.0.1 --directory "$T/$1" >/dev/null 2>&1 &
done
for p in $P1 $P2 $P3; do
  for _ in 1 2 3 4 5 6 7 8 9 10; do curl -fsS -o /dev/null "http://127.0.0.1:$p/snapshots/portage-latest.tar.xz" 2>/dev/null && break; sleep 0.5; done
done
gcc -std=gnu17 -Wall -Wextra -Werror -O2 ${CFLAGS_EXTRA:-} -DCONF="\"$T/sync.conf\"" -DENVDIR="\"$T/env\"" -DPENV="\"$T/package.env\"" -DVDB="\"$T/vdb\"" -DSNAP_FPRS="\"$FPR\"" -DGENTOO_KEYS="\"$T/keys.asc\"" -DKEYSERVER='""' -o "$T/cps" "$SRC"/*.c
conf() { printf '%s\n' "$@" > "$T/sync.conf"; printf 'repo=%s/tree/gentoo\ndistdir=%s/dist/cache\n' "$T" "$T" >> "$T/sync.conf"; }
tree=$T/tree/gentoo

conf "mirror=http://127.0.0.1:$P1" "mirror=http://127.0.0.1:$P2"
"$T/cps" sync > "$T/out.txt" 2>&1 || { cat "$T/out.txt" >&2; fail "sync не прошёл через второе зеркало"; }
[ "$(cat "$tree/profiles/repo_name")" = good ] || fail "в дерево попал неподписанный снимок"
grep -q 'подпись снимка с' "$T/out.txt" || fail "подменённый снимок первого зеркала не отвергнут"
ok "sync: снимок с неверным содержимым отвергнут, подписанный со второго зеркала принят"

rm -rf "$T/tree" "$T/dist"
conf "mirror=http://127.0.0.1:$P1"
if "$T/cps" sync > "$T/out.txt" 2>&1; then fail "sync принял снимок, не совпавший с подписью"; fi
[ ! -e "$tree/profiles" ] || fail "дерево заменено после неудачной проверки"
ok "sync: единственное зеркало с подменой, дерево не тронуто"

conf "mirror=http://127.0.0.1:$P3"
if "$T/cps" sync > "$T/out.txt" 2>&1; then fail "sync принял подпись чужого ключа"; fi
[ ! -e "$tree/profiles" ] || fail "дерево заменено снимком с подписью не того ключа"
ok "sync: валидная подпись ключа, которого нет в списке, отвергнута"

conf "mirror=http://127.0.0.1:$P2"
"$T/cps" sync >/dev/null 2>&1 || fail "sync не прошёл с хорошим зеркалом"
conf "mirror=http://127.0.0.1:1"
"$T/cps" sync > "$T/out.txt" 2>&1 || { cat "$T/out.txt" >&2; fail "без сети не взят проверенный снимок"; }
grep -q 'проверенный снимок' "$T/out.txt" || fail "нет сообщения о старом проверенном снимке"
ok "sync: без сети берётся только ранее проверенный снимок"

cp "$T/bad.tar.xz" "$T/dist/cache/portage-latest.tar.xz"
rm -rf "$T/tree"
if "$T/cps" sync > "$T/out.txt" 2>&1; then fail "без сети принят испорченный локальный снимок"; fi
[ ! -e "$tree/profiles" ] || fail "дерево собрано из испорченного локального снимка"
ok "sync: испорченный локальный снимок не принимается"

conf "mirror=http://127.0.0.1:$P3" "fallback=http://127.0.0.1:$P3/snapshots/portage-latest.tar.xz"
rm -rf "$T/tree" "$T/dist"
if "$T/cps" sync > "$T/out.txt" 2>&1; then fail "запасной канал без подписи сработал без unsigned_fallback"; fi
ok "sync: запасной канал без подписи выключен по умолчанию"
echo "все тесты пройдены"
