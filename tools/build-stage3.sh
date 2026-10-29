#!/bin/bash
# собирает stage 3 cloudos из предыдущего stage 3 (нужен root, x86_64 linux)
#   sudo tools/build-stage3.sh
# переменные: BASE (ссылка или путь к прошлому stage 3), VERSION (по умолчанию 1.1),
#             WORK (рабочая папка, нужно ~6 гб), OUT (куда положить результат)
# что внутри: cloudpkg + portage, limine, syslog-ng вместо sysklogd, xorriso, squashfs-tools, mtools, fastfetch с логотипом
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

say "распаковка базы в $ROOT"
rm -rf "$ROOT"; mkdir -p "$ROOT"
xz -dc "$BASEFILE" | tar -xpf - -C "$ROOT" --numeric-owner
grep -q '^ID=.\?cloudos' "$ROOT/etc/os-release" || die "база не похожа на stage 3 cloudos"

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

# вход в chroot: монтирования живут в отдельном пространстве имён и исчезают сами
enter() {
  # shellcheck disable=SC2016
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
enter bash /var/tmp/cloudpkg-src/cloudpkg-setup.sh --no-sync
say "сборка пакетов (1-2 часа на одном ядре, на 8 ядрах около 15 минут)"
enter bash /var/tmp/s3files/build-inside.sh "$VERSION"

rm -f "$ROOT/etc/resolv.conf"
NAME=cloudos-stage3-amd64-$VERSION.tar.xz
say "упаковка: $OUT/$NAME"
tar -C "$ROOT" --numeric-owner -cpf - . | xz -T0 -9 > "$OUT/$NAME"
( cd "$OUT" && sha256sum "$NAME" > "$NAME.sha256" )
say "готово: $OUT/$NAME ($(du -h "$OUT/$NAME" | cut -f1))"
cat "$OUT/$NAME.sha256"
