#!/bin/bash
set -eu

HERE=$(cd "$(dirname "$0")" && pwd)
REPO=$(dirname "$(dirname "$HERE")")
KVER=${KVER:-}
CLOUDK_VER=${CLOUDK_VER:-0.6}
MARCH=${MARCH:-x86-64-v3}
WORK=${WORK:-/var/tmp/cloudk-build}
OUT=${OUT:-$PWD}
JOBS=${JOBS:-$(nproc)}
CACHY_REQUIRED=${CACHY_REQUIRED:-0}
CACHY_REF=${CACHY_REF:-master}
CACHY_SRC=${CACHY_SRC:-}
KERNEL_SRC=${KERNEL_SRC:-}
MINISIGN_KEY=${MINISIGN_KEY:-$REPO/docs/cloudos.pub}
PUB=${PUB:-$REPO/docs/cloudos.pub}
PIN=${PIN:-$HERE/kernel-pin.txt}
STRICT=${STRICT:-0}
CK=cloudk-$CLOUDK_VER-$MARCH

say() { printf '==> %s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }

case $MARCH in x86-64|x86-64-v2|x86-64-v3|x86-64-v4) ;; *) die "MARCH: x86-64, x86-64-v2, x86-64-v3 or x86-64-v4" ;; esac
case $WORK in /|/usr*|/etc*|/home|/root|/var|/boot) die "unsafe work directory: $WORK" ;; esac
[ "$(uname -m)" = x86_64 ] || die "x86_64 is required"
for c in gcc make curl tar xz zstd patch git perl awk sha256sum flex bison bc find; do
  command -v "$c" >/dev/null || die "missing command: $c"
done
[ -f "$HERE/cloudk.config" ] || die "no $HERE/cloudk.config"

mkdir -p "$WORK" "$OUT"
fetch() { curl -fL --proto =https --retry 5 --retry-delay 10 --connect-timeout 20 -sS -o "$2" "$1"; }

if [ -n "$KERNEL_SRC" ]; then
  [ -e "$KERNEL_SRC" ] || die "no such source: $KERNEL_SRC"
  SRCDIR=$KERNEL_SRC
  TARBALL=$KERNEL_SRC
  say "local kernel source: $KERNEL_SRC"
else
  if [ -z "$KVER" ] && [ -f "$PIN" ]; then
    KVER=$(awk 'NR==1{print $1}' "$PIN")
  fi
  if [ -z "$KVER" ]; then
    say "detecting the latest kernel version"
    fetch "https://cdn.kernel.org/pub/linux/kernel/v6.x/" "$WORK/index.html" || die "cannot read the kernel.org index"
    KVER=$(grep -oE 'linux-6\.[0-9]+(\.[0-9]+)?\.tar\.xz' "$WORK/index.html" | sed -E 's/^linux-//; s/\.tar\.xz$//' | sort -V | tail -1)
    [ -n "$KVER" ] || die "cannot detect the kernel version, set KVER explicitly"
  fi
  MAJOR=${KVER%%.*}
  TARBALL=$WORK/linux-$KVER.tar.xz
  URL="https://cdn.kernel.org/pub/linux/kernel/v$MAJOR.x/linux-$KVER.tar.xz"
  say "kernel $KVER"
  fetch "$URL" "$TARBALL" || die "download failed: $URL"
  SUM=$(sha256sum "$TARBALL" | awk '{print $1}')
  if [ -f "$PIN" ]; then
    WANT=$(awk -v v="$KVER" '$1==v{print $2}' "$PIN")
    [ -n "$WANT" ] || die "kernel $KVER is not pinned in $PIN"
    [ "$SUM" = "$WANT" ] || die "sha256 mismatch for linux-$KVER"
    if [ -f "$PIN.minisig" ] && command -v minisign >/dev/null 2>&1 && [ -f "$PUB" ]; then
      minisign -V -q -p "$PUB" -m "$PIN" -x "$PIN.minisig" || die "kernel pin signature mismatch"
      say "kernel pin verified with the CloudOS key"
    elif [ "$STRICT" = 1 ]; then
      die "STRICT=1 requires a signed kernel pin"
    else
      say "kernel pin is unsigned, sha256 check only"
    fi
  else
    if [ "$STRICT" = 1 ]; then
      die "STRICT=1 requires $PIN"
    fi
    printf '%s %s\n' "$KVER" "$SUM" > "$PIN"
    say "recorded sha256 for $KVER, sign the pin with tools/kernel/pin-kernel.sh"
  fi
  SRCDIR=$WORK/src
fi

if [ ! -d "$SRCDIR" ]; then
  say "unpacking the source"
  rm -rf "$WORK/unpack"
  mkdir -p "$WORK/unpack"
  tar -xf "$TARBALL" -C "$WORK/unpack"
  SRCDIR=$(find "$WORK/unpack" -maxdepth 1 -mindepth 1 -type d | head -1)
  [ -n "$SRCDIR" ] || die "the archive has no source directory"
fi
[ -f "$SRCDIR/Makefile" ] || die "no kernel Makefile in $SRCDIR"
cd "$SRCDIR"
(
  HERE=$(dirname "$HERE")
  . "$HERE/kernel/cloudk-source.sh"
  cloudk_source
)

if [ -z "$CACHY_SRC" ]; then
  say "CachyOS patch series"
  if [ ! -d "$WORK/kernel-patches" ]; then
    if ! git clone --depth 1 --branch "$CACHY_REF" https://github.com/CachyOS/kernel-patches.git "$WORK/kernel-patches"; then
      if [ "$CACHY_REQUIRED" = 1 ]; then
        die "cannot clone the patch series"
      fi
      say "patch series unavailable, building without it"
    fi
  fi
  applied=0
  if [ -d "$WORK/kernel-patches" ]; then
    SERIES=${KVER%.*}
    PDIR=""
    for cand in "$WORK/kernel-patches/$SERIES/all" "$WORK/kernel-patches/$SERIES"; do
      if [ -d "$cand" ]; then
        PDIR=$cand
        break
      fi
    done
    if [ -n "$PDIR" ]; then
      for p in "$PDIR"/*.patch; do
        [ -f "$p" ] || continue
        if patch -p1 --forward --batch -N < "$p" > "$WORK/patch.log" 2>&1; then
          applied=$((applied+1))
        else
          tail -20 "$WORK/patch.log" >&2
          die "patch failed: $(basename "$p")"
        fi
      done
    fi
  fi
  if [ "$applied" = 0 ] && [ "$CACHY_REQUIRED" = 1 ]; then
    die "no patches applied for $KVER"
  fi
  say "patches applied: $applied"
fi

ours=0
for p in "$HERE"/patches/*.patch; do
  [ -f "$p" ] || continue
  patch -p1 --forward --batch -N < "$p" > "$WORK/ours.log" 2>&1 || { tail -20 "$WORK/ours.log" >&2; die "CloudOS patch failed: $(basename "$p")"; }
  ours=$((ours+1))
done
say "CloudOS patches applied: $ours"

say "config: x86_64_defconfig + cloudk.config ($MARCH)"
make x86_64_defconfig
FRAG=$WORK/cloudk-frag.config
cat "$HERE/cloudk.config" > "$FRAG"
printf 'CONFIG_MODULES=y\nCONFIG_MODULE_UNLOAD=y\n' >> "$FRAG"
case $MARCH in
  x86-64-v2) printf 'CONFIG_GENERIC_CPU2=y\n' >> "$FRAG" ;;
  x86-64-v3) printf 'CONFIG_GENERIC_CPU3=y\n' >> "$FRAG" ;;
  x86-64-v4) printf 'CONFIG_GENERIC_CPU4=y\n' >> "$FRAG" ;;
esac
./scripts/kconfig/merge_config.sh -m .config "$FRAG"
make olddefconfig
scripts/config --set-str CONFIG_LOCALVERSION "-cloudk-$CLOUDK_VER"
make olddefconfig
grep -q '^CONFIG_MODULES=y' .config || die "CONFIG_MODULES is not enabled after olddefconfig"
grep -E '^(CONFIG_LOCALVERSION|CONFIG_MODULES)=' .config || true
KREL=$(make -s kernelrelease)
say "kernel release: $KREL"

say "building with $JOBS jobs"
make -j"$JOBS" bzImage modules

say "staging modules"
rm -rf "$WORK/modules"
mkdir -p "$WORK/modules"
make modules_install INSTALL_MOD_PATH="$WORK/modules" INSTALL_MOD_STRIP=1
MODDIR=$(find "$WORK/modules" -maxdepth 3 -mindepth 1 -type d -path '*/lib/modules/*' | head -1)
if [ -z "$MODDIR" ]; then
  find "$WORK/modules" -maxdepth 4 >&2 || true
  die "modules_install produced no module directory"
fi
MODREL=$(basename "$MODDIR")
say "modules staged: $MODREL"

say "artifacts"
cp arch/x86/boot/bzImage "$OUT/$CK-vmlinuz"
tar -C "$(dirname "$MODDIR")" -cf - "$MODREL" | zstd -T0 -19 -q -o "$OUT/$CK-modules.tar.zst"
cp .config "$OUT/$CK-config"
printf '%s\n' "$MODREL" > "$OUT/$CK-krel.txt"
( cd "$OUT" && sha256sum "$CK-vmlinuz" "$CK-modules.tar.zst" "$CK-config" "$CK-krel.txt" > "$CK.sha256" )

if [ -n "$MINISIGN_KEY" ]; then
  command -v minisign >/dev/null 2>&1 || die "minisign is missing, cannot sign"
  ( cd "$OUT" && minisign -Sm "$CK.sha256" -s "$MINISIGN_KEY" -x "$CK.sha256.minisig" )
  say "signed with the CloudOS key: $CK.sha256.minisig"
else
  say "MINISIGN_KEY is not set, artifacts are unsigned"
fi

say "done: $OUT/$CK-vmlinuz"
( cd "$OUT" && cat "$CK.sha256" )
