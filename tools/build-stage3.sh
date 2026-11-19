#!/bin/bash
set -eu

HERE=$(cd "$(dirname "$0")" && pwd)
REPO=$(dirname "$HERE")
VERSION=${VERSION:-2.4}
BASE_TAG=${BASE_TAG:-1.6}
BASE_VERSION=${BASE_VERSION:-1.6}
BASE_VERIFY=${BASE_VERIFY:-1}
PUB=${PUB:-$REPO/docs/cloudos.pub}
BASE=${BASE:-https://github.com/wh1laye/cloudos-repo/releases/download/$BASE_TAG/cloudos-stage3-amd64-$BASE_VERSION.tar.xz}
WORK=${WORK:-/var/tmp/cloudos-stage3-build}
OUT=${OUT:-$PWD}
ROOT=$WORK/root

say() { printf '==> %s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }
[ "$(id -u)" = 0 ] || die "root is required: sudo $0"
[ "$(uname -m)" = x86_64 ] || die "x86_64 is required"
for c in curl tar xz sha256sum unshare mount chroot; do command -v "$c" >/dev/null || die "missing command: $c"; done
case $WORK in /|/usr*|/etc*|/home|/root|/var|/boot) die "unsafe work directory: $WORK" ;; esac

mkdir -p "$WORK/src" "$OUT"

fetch() { curl -fL --proto =https --retry 8 --retry-delay 15 --connect-timeout 20 -C - -sS -o "$2" "$1"; }

base_sig() {
  case $BASE_VERIFY in
    1)
      command -v minisign >/dev/null || die "minisign is missing (BASE_VERIFY=0 disables it)"
      [ -f "$PUB" ] || die "public key not found: $PUB"
      [ -f "$2" ] || die "signature not found: $2"
      minisign -V -p "$PUB" -m "$1" -x "$2" >/dev/null || die "base signature does not match $PUB"
      say "base minisign signature verified" ;;
    0) printf 'warning: base signature is not verified\n' >&2 ;;
    *) die "BASE_VERIFY: 1 or 0" ;;
  esac
}

say "base: $BASE"
case $BASE in
  http*://*)
    fetch "$BASE" "$WORK/base.tar.xz" || die "download failed: $BASE"
    fetch "$BASE.sha256" "$WORK/base.sha256" || die "download failed: $BASE.sha256"
    [ "$(cut -d' ' -f1 "$WORK/base.sha256")" = "$(sha256sum "$WORK/base.tar.xz" | cut -d' ' -f1)" ] || die "base sha256 mismatch"
    rm -f "$WORK/base.minisig"
    if [ "$BASE_VERIFY" = 1 ]; then fetch "$BASE.minisig" "$WORK/base.minisig" || die "download failed: $BASE.minisig"; fi
    base_sig "$WORK/base.tar.xz" "$WORK/base.minisig"
    BASEFILE=$WORK/base.tar.xz ;;
  *)
    [ -f "$BASE" ] || die "no such file: $BASE"
    base_sig "$BASE" "$BASE.minisig"
    BASEFILE=$BASE ;;
esac

if [ "${RESUME:-0}" = 1 ] && [ -d "$ROOT/var/tmp/s3stamp" ]; then
  say "RESUME=1: continuing in $ROOT"
else
  say "unpacking the base into $ROOT"
  rm -rf "$ROOT"; mkdir -p "$ROOT"
  xz -dc "$BASEFILE" | tar -xpf - -C "$ROOT" --numeric-owner --xattrs --xattrs-include='*'
fi
grep -q '^ID=.\?cloudos' "$ROOT/etc/os-release" || die "the base does not look like CloudOS stage 3"

say "sources (sha256 verified)"
while IFS='|' read -r name sum url; do
  [ -n "$name" ] || continue
  [ -f "$WORK/src/$name" ] || fetch "$url" "$WORK/src/$name" || die "download failed: $url"
  [ "$(sha256sum "$WORK/src/$name" | cut -d' ' -f1)" = "$sum" ] || { rm -f "$WORK/src/$name"; die "sha256 mismatch: $name"; }
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

say "building packages with cloudpkg"
enter bash /var/tmp/s3files/build-inside.sh "$VERSION" "${STRICT:-0}" \
  || {
    if [ -s "$ROOT/var/tmp/cloudos-report.txt" ]; then cp "$ROOT/var/tmp/cloudos-report.txt" "$OUT/cloudos-stage3-amd64-$VERSION.failed.txt"; fi
    die "the chroot build stopped, see the reason above; fix it and rerun with RESUME=1"
  }

rm -f "$ROOT/etc/resolv.conf"
NAME=cloudos-stage3-amd64-$VERSION.tar.xz

if [ -s "$ROOT/var/tmp/cloudos-report.txt" ]; then
  cp "$ROOT/var/tmp/cloudos-report.txt" "$OUT/cloudos-stage3-amd64-$VERSION.failed.txt"
  printf 'warning: some packages failed, list in %s\n' "$OUT/cloudos-stage3-amd64-$VERSION.failed.txt" >&2
  cat "$ROOT/var/tmp/cloudos-report.txt" >&2
  if [ "${STRICT:-0}" = 1 ]; then die "STRICT=1: the report has problems, the base is not released"; fi
fi
rm -f "$ROOT/var/tmp/cloudos-report.txt"

{
  echo "# cloudos $VERSION stage 3: composition"
  echo "# built from source, tracked by cloudpkg"
  ( cd "$ROOT/var/db/cloudpkg/installed" 2>/dev/null && for d in */*/*/; do echo "${d%/}"; done | sort )
} > "$OUT/cloudos-stage3-amd64-$VERSION.packages.txt"

say "packing: $OUT/$NAME"
tar -C "$ROOT" --numeric-owner --xattrs --xattrs-include='*' \
  --exclude=./var/tmp/s3stamp --exclude=./var/tmp/s3log \
  --exclude=./var/tmp/cloudpkg-build/* --exclude=./var/tmp/cloudpkg-src/* \
  --exclude=./var/cache/cloudpkg/distfiles/* -cpf - . | xz -T0 -9 > "$OUT/$NAME"

say "checking the archive"
LIST=$(mktemp); trap 'rm -f "$LIST"' EXIT
tar -tf "$OUT/$NAME" > "$LIST"
miss=0
for f in sbin/init sbin/openrc-init etc/os-release etc/init.d/syslog-ng etc/runlevels/default/syslog-ng \
         etc/syslog-ng/syslog-ng.conf usr/bin/fastfetch usr/bin/cloudpkg etc/cloudpkg/cloudpkg.conf \
         usr/share/cloudos/logo.txt usr/share/cloudos/logo.ansi usr/share/cloudos/logo.png \
         etc/xdg/fastfetch/config.jsonc usr/bin/neofetch usr/sbin/cloudos-users usr/sbin/cloudos-adduser usr/sbin/cloudos-fix \
         etc/login.defs etc/doas.conf; do
  grep -qxE "(\./)?(usr/)?$f" "$LIST" || { printf 'the archive has no %s\n' "$f" >&2; miss=1; }
done
[ "$miss" = 0 ] || die "the archive is incomplete"

( cd "$OUT" && sha256sum "$NAME" > "$NAME.sha256" )
say "done: $OUT/$NAME ($(du -h "$OUT/$NAME" | cut -f1))"
cat "$OUT/$NAME.sha256"
