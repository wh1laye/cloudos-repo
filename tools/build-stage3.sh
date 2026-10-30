#!/bin/bash
set -eu

HERE=$(cd "$(dirname "$0")" && pwd)
REPO=$(dirname "$HERE")
VERSION=${VERSION:-1.1}
BASE=${BASE:-https://github.com/wh1laye/cloudos-repo/releases/download/cloudos/cloudos-stage3-amd64-1.0.tar.xz}
WORK=${WORK:-/var/tmp/cloudos-stage3-build}
OUT=${OUT:-$PWD}
ROOT=$WORK/root

say() { printf '==> %s\n' "$*"; }
die() { printf 'ошибка: %s\n' "$*" >&2; exit 1; }
[ "$(id -u)" = 0 ] || die "нужен root: sudo $0"
[ "$(uname -m)" = x86_64 ] || die "нужен x86_64"
for c in curl tar xz sha256sum unshare mount chroot; do command -v "$c" >/dev/null || die "нет команды $c"; done
case $WORK in /|/usr*|/etc*|/home|/root|/var|/boot) die "небезопасная рабочая папка: $WORK" ;; esac

mkdir -p "$WORK/src" "$OUT"

fetch() { curl -fL --retry 3 --connect-timeout 20 -C - -sS -o "$2" "$1"; }

say "база: $BASE"
case $BASE in
  http*://*)
    fetch "$BASE" "$WORK/base.tar.xz" || die "не скачался $BASE"
    fetch "$BASE.sha256" "$WORK/base.sha256" || die "не скачался $BASE.sha256"
    [ "$(cut -d' ' -f1 "$WORK/base.sha256")" = "$(sha256sum "$WORK/base.tar.xz" | cut -d' ' -f1)" ] || die "sha256 базы не совпал"
    BASEFILE=$WORK/base.tar.xz ;;
  *) BASEFILE=$BASE ;;
esac

if [ "${RESUME:-0}" = 1 ] && [ -d "$ROOT/var/tmp/s3stamp" ]; then
  say "RESUME=1: продолжаю в $ROOT, готовые шаги не повторяются"
else
  say "распаковка базы в $ROOT"
  rm -rf "$ROOT"; mkdir -p "$ROOT"
  xz -dc "$BASEFILE" | tar -xpf - -C "$ROOT" --numeric-owner --xattrs --xattrs-include='*'
fi
grep -q '^ID=.\?cloudos' "$ROOT/etc/os-release" || die "база не похожа на stage 3 cloudos"

if [ "${REFRESH_LIST:-0}" = 1 ]; then
  say "список пакетов из настоящего stage 3 gentoo"
  "$HERE/stage3/refresh-list.sh" "$WORK/gentoo-stage3.list" && cp "$WORK/gentoo-stage3.list" "$HERE/stage3/gentoo-stage3.list" \
    || printf 'предупреждение: список не обновился, беру тот, что лежит в репозитории\n' >&2
fi

say "исходники (sha256 сверяются)"
while IFS='|' read -r name sum url; do
  [ -n "$name" ] || continue
  [ -f "$WORK/src/$name" ] || fetch "$url" "$WORK/src/$name" || die "не скачался $url"
  [ "$(sha256sum "$WORK/src/$name" | cut -d' ' -f1)" = "$sum" ] || { rm -f "$WORK/src/$name"; die "sha256 $name не совпал"; }
done < "$HERE/stage3/SOURCES.txt"

mkdir -p "$ROOT/var/tmp/s3src" "$ROOT/var/tmp/s3files" "$ROOT/var/tmp/cloudpkg-src"
cp "$WORK"/src/* "$ROOT/var/tmp/s3src/"
cp -R "$HERE"/stage3/. "$ROOT/var/tmp/s3files/"
cp -R "$REPO"/cloudpkg/. "$ROOT/var/tmp/cloudpkg-src/"

enter() {
  unshare -m sh -c '
R=$1; shift
mount --make-rprivate / || exit 1
mount --rbind /dev "$R/dev" && mount -t proc proc "$R/proc" && mount --rbind /sys "$R/sys" && mount -t tmpfs tmpfs "$R/run" || exit 1
rm -f "$R/etc/resolv.conf"; cat /etc/resolv.conf > "$R/etc/resolv.conf" 2>/dev/null || echo "nameserver 1.1.1.1" > "$R/etc/resolv.conf"
for ca in /etc/ssl/certs/ca-certificates.crt /etc/pki/tls/certs/ca-bundle.crt /etc/ssl/ca-bundle.pem; do
  if [ -s "$ca" ] && [ -f "$R/etc/ssl/certs/ca-certificates.crt" ]; then mount --bind "$ca" "$R/etc/ssl/certs/ca-certificates.crt"; break; fi
done
exec chroot "$R" /usr/bin/env -i PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin HOME=/root TERM="${TERM:-xterm}" LANG=C.UTF-8 "$@"
' sh "$ROOT" "$@"
}

say "cloudpkg и portage"
if [ ! -e "$ROOT/var/tmp/s3stamp/cloudpkg-setup" ]; then
  enter bash /var/tmp/cloudpkg-src/cloudpkg-setup.sh --no-sync
  mkdir -p "$ROOT/var/tmp/s3stamp"; touch "$ROOT/var/tmp/s3stamp/cloudpkg-setup"
fi
say "сборка пакетов (1-2 часа на одном ядре, на 8 ядрах около 15 минут)"
enter bash /var/tmp/s3files/build-inside.sh "$VERSION" "${STRICT:-0}"

rm -f "$ROOT/etc/resolv.conf"
NAME=cloudos-stage3-amd64-$VERSION.tar.xz

if [ -s "$ROOT/var/tmp/cloudos-report.txt" ]; then
  cp "$ROOT/var/tmp/cloudos-report.txt" "$OUT/cloudos-stage3-amd64-$VERSION.failed.txt"
  printf 'внимание: не собрались пакеты (список в %s):\n' "$OUT/cloudos-stage3-amd64-$VERSION.failed.txt" >&2
  cat "$ROOT/var/tmp/cloudos-report.txt" >&2
fi
rm -f "$ROOT/var/tmp/cloudos-report.txt"

{
  echo "# cloudos $VERSION stage 3: состав"
  echo "# собрано вручную (lfs, stage 3), portage их не трогает"
  grep -v '^#' "$ROOT/etc/portage/profile/package.provided" | sort -u
  echo "# установлено через cloudpkg (portage)"
  ( cd "$ROOT/var/db/pkg" 2>/dev/null && for d in */*/; do echo "${d%/}"; done | sort )
} > "$OUT/cloudos-stage3-amd64-$VERSION.packages.txt"

say "упаковка: $OUT/$NAME"
tar -C "$ROOT" --numeric-owner --xattrs --xattrs-include='*' -cpf - . | xz -T0 -9 > "$OUT/$NAME"

say "проверка архива"
LIST=$(mktemp); trap 'rm -f "$LIST"' EXIT
tar -tf "$OUT/$NAME" > "$LIST"
miss=0
for f in sbin/init sbin/openrc-init etc/os-release etc/init.d/syslog-ng etc/runlevels/default/syslog-ng \
         etc/syslog-ng/syslog-ng.conf usr/bin/fastfetch usr/bin/cloudpkg usr/bin/emerge \
         usr/share/cloudos/logo.txt usr/share/cloudos/logo.ansi usr/share/cloudos/logo.png \
         etc/xdg/fastfetch/config.jsonc; do
  grep -qxE "(\./)?$f" "$LIST" || { printf 'в архиве нет %s\n' "$f" >&2; miss=1; }
done
[ "$miss" = 0 ] || die "архив неполный"

( cd "$OUT" && sha256sum "$NAME" > "$NAME.sha256" )
say "готово: $OUT/$NAME ($(du -h "$OUT/$NAME" | cut -f1))"
cat "$OUT/$NAME.sha256"
