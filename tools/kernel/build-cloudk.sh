#!/bin/bash
set -euo pipefail

HERE=$(cd "$(dirname "$0")" && pwd)
KVER=${KVER:-7.3}
CLOUDK_VER=${CLOUDK_VER:-0.5}
MARCH=${MARCH:-x86-64}
LTO=${LTO:-none}
WORK=${WORK:-/var/tmp/cloudk-build}
OUT=${OUT:-$PWD/out}
KGPG=${KERNEL_GPG:-0}
J=${JOBS:-$(nproc)}
CLOUDK_REGDIR=${CLOUDK_REGDIR:-/lib/firmware}
CK=cloudk-$CLOUDK_VER-$MARCH
KREL=$KVER-cloudk-$CLOUDK_VER
KTAR=cachyos-$KVER-latest.tar.gz
KURL=https://github.com/CachyOS/linux/releases/latest
SRC=$WORK/linux
STAGE=$WORK/stage

say() { printf '==> %s\n' "$*"; }
die() { printf '::error::%s\n' "$*" >&2; exit 1; }
trap 'printf "::error::упал шаг, строка %s, код %s\n" "$LINENO" "$?" >&2' ERR

case "$LTO" in none|thin) ;; *) die "LTO: none или thin" ;; esac
if [ "$LTO" = thin ]; then
  for c in clang ld.lld llvm-ar llvm-nm llvm-objcopy llvm-strip; do command -v "$c" >/dev/null || die "нет команды $c для thinlto"; done
  export LLVM=1
fi
case "$MARCH" in x86-64|x86-64-v3) ;; *) die "MARCH: x86-64 или x86-64-v3" ;; esac
case "$KVER" in ''|*[!0-9.]*) die "неверная версия ядра" ;; esac
case "$CLOUDK_VER" in ''|*[!0-9A-Za-z._]*) die "неверная версия cloudk" ;; esac
case $WORK in /|/usr*|/etc*|/home|/root|/var|/boot) die "небезопасная рабочая папка: $WORK" ;; esac
[ "$(uname -m)" = x86_64 ] || die "нужен x86_64"
for c in gcc make bc flex bison perl cpio zstd xz tar curl sha256sum awk openssl patch gpg; do
  command -v "$c" >/dev/null || die "нет команды $c"
done
[ -e /usr/include/openssl/bio.h ] || die "нет заголовков openssl"
[ -e /usr/include/gelf.h ] || die "нет заголовков libelf"
[ -f "$HERE/cloudk-config.sh" ] || die "нет $HERE/cloudk-config.sh"
[ -f "$HERE/cloudk-source.sh" ] || die "нет $HERE/cloudk-source.sh"

. "$HERE/cloudk-config.sh"
. "$HERE/cloudk-source.sh"
CLOUDK_MISSING=$WORK/$CK-missing.txt

fetch() { curl -fL --retry 3 --connect-timeout 20 -C - -sS -o "$2" "$1"; }

mkdir -p "$WORK" "$OUT"
rm -rf "$SRC" "$STAGE"
mkdir -p "$SRC" "$STAGE"

say "ядро cachyos $KVER"
CACHY_TAG=$(curl -sL "https://api.github.com/repos/CachyOS/linux/releases/latest" | python3 -c "import json,sys; print(json.load(sys.stdin)['tag_name'])")
[ -n "$CACHY_TAG" ] || die "не получен тег cachyos"
CACHY_TAR="${CACHY_TAG}.tar.gz"
say "версия cachyos: $CACHY_TAG"

fetch "https://github.com/CachyOS/linux/releases/download/$CACHY_TAG/$CACHY_TAR" "$WORK/$CACHY_TAR" || die "не скачался $CACHY_TAR"
ASC="${CACHY_TAR}.asc"
fetch "https://github.com/CachyOS/linux/releases/download/$CACHY_TAG/$ASC" "$WORK/$ASC" || die "не скачалась $ASC"
gpg --import "$HERE/cachyos.pubkey.asc" 2>/dev/null
GNUPGHOME=$(mktemp -d)
export GNUPGHOME
gpg --import "$HERE/cachyos.pubkey.asc" >/dev/null 2>&1
gpg --verify "$WORK/$ASC" "$WORK/$CACHY_TAR" >/dev/null 2>&1 || { rm -rf "$GNUPGHOME"; die "gpg подпись $CACHY_TAR не совпала"; }
rm -rf "$GNUPGHOME"
gpg --verify "$WORK/$ASC" "$WORK/$CACHY_TAR" 2>/dev/null || die "gpg подпись $CACHY_TAR не совпала"
say "проверена подпись cachyos ключом 5CC324DC31D9D568"

tar xf "$WORK/$CACHY_TAR" -C "$SRC" --strip-components=1
cd "$SRC"

cloudk_source
if [ -f .config ]; then
  scripts/config --disable-oldconfig || true
else
  make defconfig
fi
cloudk_config
if [ "$LTO" = thin ]; then scripts/config -d LTO_NONE -e LTO_CLANG_THIN; fi
make olddefconfig
[ "$LTO" != thin ] || grep -q "^CONFIG_LTO_CLANG_THIN=y$" .config || die "thinlto не включился"
cloudk_verify
for s in $CLOUDK_SRC_MISS; do printf 'source:%s\n' "$s" >> "$CLOUDK_MISSING"; done
[ -z "$CLOUDK_SRC_MISS" ] || echo "!! правки исходников не применились:$CLOUDK_SRC_MISS" >&2

KC="-O2 -pipe"
[ "$MARCH" = x86-64 ] || KC="-O2 -pipe -march=$MARCH -mtune=generic"
export KBUILD_BUILD_USER=cloudk KBUILD_BUILD_HOST=cloudos
if [ -n "${SOURCE_DATE_EPOCH:-}" ]; then export KBUILD_BUILD_TIMESTAMP="$(date -u -d "@$SOURCE_DATE_EPOCH")"; fi

say "сборка cloudk $CLOUDK_VER ($MARCH) на $J ядрах"
make -j"$J" KCFLAGS="$KC" bzImage modules || { make -j1 V=1 KCFLAGS="$KC" bzImage modules 2>&1 | tail -n 60 >&2 || true; die "сборка ядра упала"; }
[ "$(make -s kernelrelease)" = "$KREL" ] || die "версия ядра $(make -s kernelrelease), ожидалась $KREL"

make modules_install INSTALL_MOD_PATH="$STAGE" INSTALL_MOD_STRIP=1
rm -f "$STAGE/lib/modules/$KREL/build" "$STAGE/lib/modules/$KREL/source"
[ -s "$STAGE/lib/modules/$KREL/modules.dep" ] || die "модули не установились"
[ -s arch/x86/boot/bzImage ] || die "нет bzImage"

rm -f "$OUT/$CK"-* "$OUT/$CK.sha256"
install -m644 arch/x86/boot/bzImage "$OUT/$CK-vmlinuz"
tar --sort=name --owner=0 --group=0 --numeric-owner --mtime='2000-01-01 00:00:00' -C "$STAGE/lib" -cf - "modules/$KREL" | zstd -19 -T0 -q -f -o "$OUT/$CK-modules.tar.zst"
install -m644 .config "$OUT/$CK-config"
[ ! -s "$CLOUDK_MISSING" ] || install -m644 "$CLOUDK_MISSING" "$OUT/$CK-missing.txt"
( cd "$OUT" && sha256sum "$CK-vmlinuz" "$CK-modules.tar.zst" "$CK-config" > "$CK.sha256" && sha256sum -c "$CK.sha256" >/dev/null )

say "готово: $KREL, vmlinuz $(du -h "$OUT/$CK-vmlinuz" | cut -f1), модули $(du -h "$OUT/$CK-modules.tar.zst" | cut -f1)"
