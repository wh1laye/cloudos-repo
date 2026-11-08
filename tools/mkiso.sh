#!/bin/bash
set -eu

HERE=$(cd "$(dirname "$0")" && pwd)
VERSION=${VERSION:-2.3}
KVER=${KVER:-6.18.10}
MARCH=${MARCH:-x86-64}
BASE_TAG=${BASE_TAG:-1.6}
CLOUDK_VER=${CLOUDK_VER:-0.4}
CLOUDK_TAG=${CLOUDK_TAG:-cloudk-$CLOUDK_VER}
CLOUDK=${CLOUDK:-https://github.com/wh1laye/cloudos-repo/releases/download/$CLOUDK_TAG}
CLOUDK_VERIFY=${CLOUDK_VERIFY:-1}
PUB=${PUB:-$(dirname "$HERE")/docs/cloudos.pub}
BASE_VERSION=${BASE_VERSION:-1.6}
BASE_VERIFY=${BASE_VERIFY:-1}
BASE=${BASE:-https://github.com/wh1laye/cloudos-repo/releases/download/$BASE_TAG/cloudos-stage3-amd64-$BASE_VERSION.tar.xz}
WORK=${WORK:-/var/tmp/cloudos-iso-build}
OUT=${OUT:-$PWD}
ROOT=$WORK/root
NAME=cloudos-live-amd64-$VERSION.iso

say() { printf '==> %s\n' "$*"; }
die() { printf 'ошибка: %s\n' "$*" >&2; exit 1; }
case "$MARCH" in x86-64|x86-64-v3) ;; *) die "MARCH: x86-64 или x86-64-v3" ;; esac
[ "$(id -u)" = 0 ] || die "нужен root: sudo $0"
[ "$(uname -m)" = x86_64 ] || die "нужен x86_64"
for c in curl tar xz sha256sum unshare mount chroot awk; do command -v "$c" >/dev/null || die "нет команды $c"; done
case $WORK in /|/usr*|/etc*|/home|/root|/var|/boot) die "небезопасная рабочая папка: $WORK" ;; esac
for f in iso/init iso/mkiso-inside.sh iso/cloudos-install iso/cloudos-secureboot iso/cloudos-uki iso/cloudos-tpm2 iso/dracut-tpm2/module-setup.sh iso/dracut-tpm2/cloudos-tpm2-unlock.sh iso/sysctl-perf.conf stage3/cloudos-audit; do [ -f "$HERE/$f" ] || die "нет $HERE/$f"; done

mkdir -p "$WORK/src" "$OUT"

fetch() { curl -fL --retry 3 --connect-timeout 20 -C - -sS -o "$2" "$1"; }

base_sig() {
  case $BASE_VERIFY in
    1)
      command -v minisign >/dev/null || die "нет minisign, подпись базы не проверить (BASE_VERIFY=0 отключает проверку)"
      [ -f "$PUB" ] || die "нет публичного ключа $PUB"
      [ -f "$2" ] || die "нет подписи $2 (BASE_VERIFY=0 отключает проверку)"
      minisign -V -p "$PUB" -m "$1" -x "$2" >/dev/null || die "подпись базы не сходится с $PUB"
      say "подпись базы minisign проверена" ;;
    0) printf '!! подпись базы не проверяется\n' >&2 ;;
    *) die "BASE_VERIFY: 1 или 0" ;;
  esac
}

say "база: $BASE"
case $BASE in
  http*://*)
    rm -f "$WORK/base.tar.xz" "$WORK/base.sha256"
    fetch "$BASE" "$WORK/base.tar.xz" || die "не скачался $BASE"
    fetch "$BASE.sha256" "$WORK/base.sha256" || die "не скачался $BASE.sha256"
    [ "$(cut -d' ' -f1 "$WORK/base.sha256")" = "$(sha256sum "$WORK/base.tar.xz" | cut -d' ' -f1)" ] || die "sha256 базы не совпал"
    rm -f "$WORK/base.minisig"
    if [ "$BASE_VERIFY" = 1 ]; then fetch "$BASE.minisig" "$WORK/base.minisig" || die "не скачалась подпись $BASE.minisig (BASE_VERIFY=0 отключает проверку)"; fi
    base_sig "$WORK/base.tar.xz" "$WORK/base.minisig"
    BASEFILE=$WORK/base.tar.xz ;;
  *)
    [ -f "$BASE" ] || die "нет файла $BASE"
    if [ -f "$BASE.sha256" ]; then
      [ "$(cut -d' ' -f1 "$BASE.sha256")" = "$(sha256sum "$BASE" | cut -d' ' -f1)" ] || die "sha256 базы не совпал"
    fi
    base_sig "$BASE" "$BASE.minisig"
    BASEFILE=$BASE ;;
esac

CK=cloudk-$CLOUDK_VER-$MARCH
say "ядро cloudk $CLOUDK_VER ($MARCH) из $CLOUDK"
mkdir -p "$WORK/cloudk"
case $CLOUDK in
  http*://*)
    rm -f "$WORK/cloudk"/*
    for f in "$CK-vmlinuz" "$CK-modules.tar.zst" "$CK-config" "$CK.sha256" "$CK.sha256.minisig"; do
      fetch "$CLOUDK/$f" "$WORK/cloudk/$f" || die "не скачался $CLOUDK/$f"
    done ;;
  *)
    for f in "$CK-vmlinuz" "$CK-modules.tar.zst" "$CK-config" "$CK.sha256" "$CK.sha256.minisig"; do
      [ -f "$CLOUDK/$f" ] || die "нет файла $CLOUDK/$f"
      cp "$CLOUDK/$f" "$WORK/cloudk/$f"
    done ;;
esac
case $CLOUDK_VERIFY in
  1)
    command -v minisign >/dev/null || die "нет minisign, подпись ядра cloudk не проверить (CLOUDK_VERIFY=0 отключает проверку)"
    [ -f "$PUB" ] || die "нет публичного ключа $PUB"
    minisign -V -p "$PUB" -m "$WORK/cloudk/$CK.sha256" -x "$WORK/cloudk/$CK.sha256.minisig" >/dev/null || die "подпись ядра cloudk не сходится с $PUB" ;;
  0) printf '!! подпись ядра cloudk не проверяется\n' >&2 ;;
  *) die "CLOUDK_VERIFY: 1 или 0" ;;
esac
( cd "$WORK/cloudk" && sha256sum -c "$CK.sha256" >/dev/null ) || die "sha256 ядра cloudk не совпал"

say "распаковка базы в $ROOT"
rm -rf "$ROOT"
mkdir -p "$ROOT"
xz -dc "$BASEFILE" | tar -xpf - -C "$ROOT" --numeric-owner --xattrs --xattrs-include='*'
grep -q '^ID=.\?cloudos' "$ROOT/etc/os-release" || die "база не похожа на базу cloudos"

mkdir -p "$ROOT/var/tmp/isosrc" "$ROOT/var/tmp/isofiles"
cp "$WORK/cloudk/$CK-vmlinuz" "$WORK/cloudk/$CK-modules.tar.zst" "$ROOT/var/tmp/isosrc/"
cp -R "$HERE"/iso/. "$ROOT/var/tmp/isofiles/"
cp "$HERE/stage3/cloudos-audit" "$ROOT/var/tmp/isofiles/"

enter() {
  unshare -m sh -c '
R=$1; shift
mount --make-rprivate / || exit 1
mount --rbind /dev "$R/dev" && mount -t proc proc "$R/proc" && mount --rbind /sys "$R/sys" && mount -t tmpfs tmpfs "$R/run" || exit 1
rm -f "$R/etc/resolv.conf"; cat /etc/resolv.conf > "$R/etc/resolv.conf" 2>/dev/null || echo "nameserver 1.1.1.1" > "$R/etc/resolv.conf"
exec chroot "$R" /usr/bin/env -i PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin HOME=/root TERM="${TERM:-xterm}" LANG=C.UTF-8 "$@"
' sh "$ROOT" "$@"
}

say "сборка iso внутри chroot (ядро, initramfs, squashfs, limine)"
enter bash /var/tmp/isofiles/mkiso-inside.sh "$VERSION" "$KVER" "$NAME" "$MARCH" "$CLOUDK_VER" || die "сборка внутри chroot оборвалась, причина выше"

[ -s "$ROOT/var/tmp/isoout/$NAME" ] || die "iso не появился"
mv "$ROOT/var/tmp/isoout/$NAME" "$OUT/$NAME"
( cd "$OUT" && sha256sum "$NAME" > "$NAME.sha256" )
SIZE=$(stat -c %s "$OUT/$NAME")
[ "$SIZE" -lt 2147483648 ] || printf 'внимание: iso %s байт, а лимит файла в github releases 2 гб\n' "$SIZE" >&2
say "готово: $OUT/$NAME ($(du -h "$OUT/$NAME" | cut -f1))"
cat "$OUT/$NAME.sha256"
