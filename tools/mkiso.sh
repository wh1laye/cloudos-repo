#!/bin/bash
set -eu

HERE=$(cd "$(dirname "$0")" && pwd)
VERSION=${VERSION:-1.3}
KVER=${KVER:-6.18.10}
BASE=${BASE:-https://github.com/wh1laye/cloudos-repo/releases/download/$VERSION/cloudos-stage3-amd64-$VERSION.tar.xz}
WORK=${WORK:-/var/tmp/cloudos-iso-build}
OUT=${OUT:-$PWD}
ROOT=$WORK/root
NAME=cloudos-live-amd64-$VERSION.iso

say() { printf '==> %s\n' "$*"; }
die() { printf 'ошибка: %s\n' "$*" >&2; exit 1; }
[ "$(id -u)" = 0 ] || die "нужен root: sudo $0"
[ "$(uname -m)" = x86_64 ] || die "нужен x86_64"
for c in curl tar xz sha256sum unshare mount chroot awk; do command -v "$c" >/dev/null || die "нет команды $c"; done
case $WORK in /|/usr*|/etc*|/home|/root|/var|/boot) die "небезопасная рабочая папка: $WORK" ;; esac
for f in iso/init iso/mkiso-inside.sh; do [ -f "$HERE/$f" ] || die "нет $HERE/$f"; done

mkdir -p "$WORK/src" "$OUT"

fetch() { curl -fL --retry 3 --connect-timeout 20 -C - -sS -o "$2" "$1"; }

say "база: $BASE"
case $BASE in
  http*://*)
    rm -f "$WORK/base.tar.xz" "$WORK/base.sha256"
    fetch "$BASE" "$WORK/base.tar.xz" || die "не скачался $BASE"
    fetch "$BASE.sha256" "$WORK/base.sha256" || die "не скачался $BASE.sha256"
    [ "$(cut -d' ' -f1 "$WORK/base.sha256")" = "$(sha256sum "$WORK/base.tar.xz" | cut -d' ' -f1)" ] || die "sha256 базы не совпал"
    BASEFILE=$WORK/base.tar.xz ;;
  *)
    [ -f "$BASE" ] || die "нет файла $BASE"
    if [ -f "$BASE.sha256" ]; then
      [ "$(cut -d' ' -f1 "$BASE.sha256")" = "$(sha256sum "$BASE" | cut -d' ' -f1)" ] || die "sha256 базы не совпал"
    fi
    BASEFILE=$BASE ;;
esac

KTAR=linux-$KVER.tar.xz
KURL=https://cdn.kernel.org/pub/linux/kernel/v${KVER%%.*}.x
say "ядро $KVER"
rm -f "$WORK/sha256sums.asc"
fetch "$KURL/sha256sums.asc" "$WORK/sha256sums.asc" || die "не скачался $KURL/sha256sums.asc"
KSUM=$(awk -v f="$KTAR" '$2 == f { print $1 }' "$WORK/sha256sums.asc")
[ -n "$KSUM" ] || die "в sha256sums.asc нет $KTAR"
[ -f "$WORK/src/$KTAR" ] || fetch "$KURL/$KTAR" "$WORK/src/$KTAR" || die "не скачался $KURL/$KTAR"
[ "$(sha256sum "$WORK/src/$KTAR" | cut -d' ' -f1)" = "$KSUM" ] || { rm -f "$WORK/src/$KTAR"; die "sha256 $KTAR не совпал"; }

KGPG=${KERNEL_GPG:-auto}
kgpg_fail() { if [ "$KGPG" = 1 ]; then die "$*"; else printf '!! %s\n' "$*" >&2; fi; }
if [ "$KGPG" != 0 ]; then
  if command -v gpg >/dev/null; then
    GH=$WORK/gnupg
    rm -rf "$GH"; mkdir -p "$GH"; chmod 700 "$GH"
    if fetch "$KURL/linux-$KVER.tar.sign" "$WORK/$KTAR.sign" \
      && gpg --homedir "$GH" --batch -q --auto-key-locate clear,nodefault,wkd --locate-keys torvalds@kernel.org gregkh@kernel.org >/dev/null 2>&1; then
      KOUT=$(xz -dc "$WORK/src/$KTAR" | gpg --homedir "$GH" --batch --trust-model always --status-fd 1 --verify "$WORK/$KTAR.sign" - 2>/dev/null) || true
      if printf '%s\n' "$KOUT" | grep -q '^\[GNUPG:\] GOODSIG'; then
        say "подпись ядра $KTAR проверена"
      elif printf '%s\n' "$KOUT" | grep -q '^\[GNUPG:\] BADSIG'; then
        rm -f "$WORK/src/$KTAR"; die "подпись ядра $KTAR неверна"
      else
        kgpg_fail "подпись ядра $KTAR не подтвердилась"
      fi
    else
      kgpg_fail "не удалось получить подпись или ключи ядра (KERNEL_GPG=0 отключает проверку)"
    fi
  else
    kgpg_fail "нет gpg, подпись ядра не проверена"
  fi
fi

say "распаковка базы в $ROOT"
rm -rf "$ROOT"
mkdir -p "$ROOT"
xz -dc "$BASEFILE" | tar -xpf - -C "$ROOT" --numeric-owner --xattrs --xattrs-include='*'
grep -q '^ID=.\?cloudos' "$ROOT/etc/os-release" || die "база не похожа на stage 3 cloudos"

mkdir -p "$ROOT/var/tmp/isosrc" "$ROOT/var/tmp/isofiles"
cp "$WORK/src/$KTAR" "$ROOT/var/tmp/isosrc/"
cp -R "$HERE"/iso/. "$ROOT/var/tmp/isofiles/"

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
enter bash /var/tmp/isofiles/mkiso-inside.sh "$VERSION" "$KVER" "$NAME" || die "сборка внутри chroot оборвалась, причина выше"

[ -s "$ROOT/var/tmp/isoout/$NAME" ] || die "iso не появился"
mv "$ROOT/var/tmp/isoout/$NAME" "$OUT/$NAME"
( cd "$OUT" && sha256sum "$NAME" > "$NAME.sha256" )
SIZE=$(stat -c %s "$OUT/$NAME")
[ "$SIZE" -lt 2147483648 ] || printf 'внимание: iso %s байт, а лимит файла в github releases 2 гб\n' "$SIZE" >&2
say "готово: $OUT/$NAME ($(du -h "$OUT/$NAME" | cut -f1))"
cat "$OUT/$NAME.sha256"
