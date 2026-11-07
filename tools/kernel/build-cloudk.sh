#!/bin/bash
set -euo pipefail

HERE=$(cd "$(dirname "$0")" && pwd)
KVER=${KVER:-6.18.10}
CLOUDK_VER=${CLOUDK_VER:-0.3}
MARCH=${MARCH:-x86-64}
LTO=${LTO:-none}
WORK=${WORK:-/var/tmp/cloudk-build}
OUT=${OUT:-$PWD/out}
KGPG=${KERNEL_GPG:-1}
J=${JOBS:-$(nproc)}
CLOUDK_REGDIR=${CLOUDK_REGDIR:-/lib/firmware}
CK=cloudk-$CLOUDK_VER-$MARCH
KREL=$KVER-cloudk-$CLOUDK_VER
KTAR=linux-$KVER.tar.xz
KURL=https://cdn.kernel.org/pub/linux/kernel/v${KVER%%.*}.x
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
for c in gcc make bc flex bison perl cpio zstd xz tar curl sha256sum awk openssl patch; do
  command -v "$c" >/dev/null || die "нет команды $c"
done
[ -e /usr/include/openssl/bio.h ] || die "нет заголовков openssl"
[ -e /usr/include/gelf.h ] || die "нет заголовков libelf"
[ -f "$HERE/cloudk-config.sh" ] || die "нет $HERE/cloudk-config.sh"
[ -f "$HERE/cloudk-source.sh" ] || die "нет $HERE/cloudk-source.sh"
[ -f "$HERE/cloudk-patches.sh" ] || die "нет $HERE/cloudk-patches.sh"

. "$HERE/cloudk-config.sh"
. "$HERE/cloudk-source.sh"
. "$HERE/cloudk-patches.sh"
CLOUDK_MISSING=$WORK/$CK-missing.txt

fetch() { curl -fL --retry 3 --connect-timeout 20 -C - -sS -o "$2" "$1"; }

mkdir -p "$WORK" "$OUT"
rm -rf "$SRC" "$STAGE"
mkdir -p "$SRC" "$STAGE"

say "ядро $KVER"
rm -f "$WORK/sha256sums.asc"
fetch "$KURL/sha256sums.asc" "$WORK/sha256sums.asc" || die "не скачался $KURL/sha256sums.asc"
KSUM=$(awk -v f="$KTAR" '$2 == f { print $1 }' "$WORK/sha256sums.asc")
[ -n "$KSUM" ] || die "в sha256sums.asc нет $KTAR"
[ -f "$WORK/$KTAR" ] || fetch "$KURL/$KTAR" "$WORK/$KTAR" || die "не скачался $KURL/$KTAR"
[ "$(sha256sum "$WORK/$KTAR" | cut -d' ' -f1)" = "$KSUM" ] || { rm -f "$WORK/$KTAR"; die "sha256 $KTAR не совпал"; }

if [ "$KGPG" != 0 ]; then
  command -v gpg >/dev/null || die "нет gpg, подпись ядра не проверена (KERNEL_GPG=0 отключает проверку)"
  GH=$WORK/gnupg
  rm -rf "$GH"; mkdir -p "$GH"; chmod 700 "$GH"
  fetch "$KURL/linux-$KVER.tar.sign" "$WORK/$KTAR.sign" || die "не скачалась подпись ядра"
  gpg --homedir "$GH" --batch -q --auto-key-locate clear,nodefault,wkd --locate-keys torvalds@kernel.org gregkh@kernel.org >/dev/null 2>&1 || die "не получены ключи ядра"
  KOUT=$(xz -dc "$WORK/$KTAR" | gpg --homedir "$GH" --batch --trust-model always --status-fd 1 --verify "$WORK/$KTAR.sign" - 2>/dev/null) || true
  printf '%s\n' "$KOUT" | grep -q '^\[GNUPG:\] GOODSIG' || { rm -f "$WORK/$KTAR"; die "подпись ядра $KTAR не подтвердилась"; }
  say "подпись ядра проверена"
fi

tar xf "$WORK/$KTAR" -C "$SRC" --strip-components=1
cd "$SRC"

cloudk_fetch_patches
for p in "$HERE"/patches/*.patch; do
  if [ -f "$p" ]; then CLOUDK_PATCHES="$CLOUDK_PATCHES $p"; fi
done
CLOUDK_BORE=0
case "$CLOUDK_PATCHES" in *bore*) CLOUDK_BORE=1 ;; esac
CLOUDK_CACHY=0
case "$CLOUDK_PATCHES" in *cachyos-base*) CLOUDK_CACHY=1 ;; esac
for p in $CLOUDK_PATCHES; do
  if ! patch -p1 --dry-run -s < "$p" >/dev/null 2>&1; then
    patch -p1 --dry-run < "$p" 2>&1 | awk '/^(patching|checking) file/ { f = $3 } /FAILED/ { print "не легло: " f ": " $0 }' >&2 || true
    die "патч $(basename "$p") не накладывается на $KVER, возьми версию ядра, под которую сделан патч"
  fi
  patch -p1 -s < "$p"
  say "патч $(basename "$p")"
done

cloudk_source
make defconfig
cloudk_config
if [ "$CLOUDK_CACHY" = 1 ]; then scripts/config -e CACHY; fi
if [ "$CLOUDK_BORE" = 1 ]; then scripts/config -e SCHED_BORE; fi
if [ "$LTO" = thin ]; then scripts/config -d LTO_NONE -e LTO_CLANG_THIN; fi
make olddefconfig
[ "$LTO" != thin ] || grep -q "^CONFIG_LTO_CLANG_THIN=y$" .config || die "thinlto не включился"
if [ "$CLOUDK_BORE" = 1 ]; then grep -q "^CONFIG_SCHED_BORE=y$" .config || die "SCHED_BORE не включился"; fi
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
