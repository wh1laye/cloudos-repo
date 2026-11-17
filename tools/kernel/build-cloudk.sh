#!/bin/bash
set -eu

HERE=$(cd "$(dirname "$0")" && pwd)
REPO=$(dirname "$(dirname "$HERE")")
KVER=${KVER:-6.18.10}
CLOUDK_VER=${CLOUDK_VER:-0.6}
MARCH=${MARCH:-x86-64-v3}
WORK=${WORK:-/var/tmp/cloudk-build}
OUT=${OUT:-$PWD}
JOBS=${JOBS:-$(nproc)}
CACHY_REQUIRED=${CACHY_REQUIRED:-1}
CACHY_REF=${CACHY_REF:-master}
CACHY_SRC=${CACHY_SRC:-}
KERNEL_SRC=${KERNEL_SRC:-}
MINISIGN_KEY=${MINISIGN_KEY:-}
GPG_KEYS=${GPG_KEYS:-ABAF11C65A2970B130ABE3C479BE3E4300411886 647F28654894E3BD457199BE38DBBDC86092693E}
KEYSERVER=${KEYSERVER:-hkps://keyserver.ubuntu.com}
CK=cloudk-$CLOUDK_VER-$MARCH

say() { printf '==> %s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }

case $MARCH in x86-64|x86-64-v2|x86-64-v3|x86-64-v4) ;; *) die "MARCH: x86-64, x86-64-v2, x86-64-v3 or x86-64-v4" ;; esac
case $WORK in /|/usr*|/etc*|/home|/root|/var|/boot) die "unsafe work directory: $WORK" ;; esac
[ "$(uname -m)" = x86_64 ] || die "x86_64 is required"
for c in gcc make curl tar xz zstd patch git gpg flex bison bc perl awk sha256sum; do
  command -v "$c" >/dev/null || die "missing command: $c"
done
[ -f "$HERE/cloudk.config" ] || die "no $HERE/cloudk.config"

mkdir -p "$WORK" "$OUT"
SRCDIR=$WORK/linux-$KVER
TARBALL=$WORK/linux-$KVER.tar.xz

fetch() { curl -fL --proto =https --retry 5 --retry-delay 10 --connect-timeout 20 -C - -sS -o "$2" "$1"; }

if [ -n "$KERNEL_SRC" ]; then
  say "kernel source: $KERNEL_SRC"
  [ -e "$KERNEL_SRC" ] || die "no such source: $KERNEL_SRC"
  case $KERNEL_SRC in
    *.tar.xz|*.tar.gz|*.tar.zst) TARBALL=$KERNEL_SRC ;;
    *) SRCDIR=$KERNEL_SRC ;;
  esac
elif [ -n "$CACHY_SRC" ]; then
  say "pre-patched CachyOS source: $CACHY_SRC"
  TARBALL=$WORK/cachy-linux.tar.gz
  fetch "$CACHY_SRC" "$TARBALL" || die "download failed: $CACHY_SRC"
  if fetch "$CACHY_SRC.sign" "$TARBALL.sign" 2>/dev/null || fetch "$CACHY_SRC.sig" "$TARBALL.sign" 2>/dev/null; then
    [ -f "$HERE/cachyos.pubkey.asc" ] || die "signature downloaded but $HERE/cachyos.pubkey.asc is missing"
    GNUPGHOME=$WORK/gnupg-cachy; export GNUPGHOME; mkdir -p "$GNUPGHOME"; chmod 700 "$GNUPGHOME"
    gpg --batch --quiet --import "$HERE/cachyos.pubkey.asc"
    gpg --batch --verify "$TARBALL.sign" "$TARBALL" || die "CachyOS source signature mismatch"
    say "CachyOS source signature verified"
    unset GNUPGHOME
  else
    [ "$CACHY_REQUIRED" = 0 ] || die "no signature for the CachyOS source, set CACHY_REQUIRED=0 to accept it"
    printf 'warning: CachyOS source signature is not verified\n' >&2
  fi
else
  say "kernel.org source: linux-$KVER"
  MAJOR=${KVER%%.*}
  fetch "https://cdn.kernel.org/pub/linux/kernel/v$MAJOR.x/linux-$KVER.tar.xz" "$TARBALL" || die "download failed: linux-$KVER.tar.xz"
  fetch "https://cdn.kernel.org/pub/linux/kernel/v$MAJOR.x/linux-$KVER.tar.sign" "$TARBALL.sign" || die "download failed: linux-$KVER.tar.sign"
  GNUPGHOME=$WORK/gnupg; export GNUPGHOME; mkdir -p "$GNUPGHOME"; chmod 700 "$GNUPGHOME"
  for k in $GPG_KEYS; do gpg --batch --quiet --keyserver "$KEYSERVER" --recv-keys "$k" || die "cannot import key $k"; done
  xz -dc "$TARBALL" > "$WORK/linux-$KVER.tar"
  gpg --batch --verify "$TARBALL.sign" "$WORK/linux-$KVER.tar" || die "kernel source signature mismatch"
  rm -f "$WORK/linux-$KVER.tar"
  say "kernel.org signature verified"
  unset GNUPGHOME
fi

if [ ! -d "$SRCDIR" ]; then
  say "unpacking the source"
  rm -rf "$WORK/unpack"; mkdir -p "$WORK/unpack"
  tar -xf "$TARBALL" -C "$WORK/unpack"
  SRCDIR=$(find "$WORK/unpack" -maxdepth 1 -mindepth 1 -type d | head -1)
  [ -n "$SRCDIR" ] || die "the archive has no source directory"
fi
[ -f "$SRCDIR/Makefile" ] || die "no kernel Makefile in $SRCDIR"

cd "$SRCDIR"
if [ -n "${RESET_TREE:-}" ]; then git reset --hard >/dev/null 2>&1 || true; fi

if [ -z "$CACHY_SRC" ]; then
  say "CachyOS patch series"
  if [ ! -d "$WORK/kernel-patches" ]; then
    git clone --depth 1 --branch "$CACHY_REF" https://github.com/CachyOS/kernel-patches.git "$WORK/kernel-patches" \
      || die "cannot clone CachyOS kernel-patches, set CACHY_REF to a valid branch"
  fi
  SERIES=${KVER%.*}
  PDIR=""
  for cand in "$WORK/kernel-patches/$SERIES/all" "$WORK/kernel-patches/$SERIES" "$WORK/kernel-patches/${SERIES%%.*}.x/all"; do
    [ -d "$cand" ] && PDIR=$cand && break
  done
  applied=0
  if [ -n "$PDIR" ]; then
    for p in $(find "$PDIR" -maxdepth 1 -name '*.patch' | sort); do
      if patch -p1 --forward --batch -N -r "$WORK/rejects.txt" < "$p" > "$WORK/patch.log" 2>&1; then
        applied=$((applied+1))
      else
        tail -20 "$WORK/patch.log" >&2
        die "CachyOS patch failed: $(basename "$p"), pin CACHY_REF to a matching commit or set CACHY_REQUIRED=0"
      fi
    done
  fi
  if [ "$applied" = 0 ]; then
    [ "$CACHY_REQUIRED" = 0 ] || die "no CachyOS patches found for $SERIES, pin CACHY_REF or set CACHY_REQUIRED=0"
    printf 'warning: building without CachyOS patches\n' >&2
  else
    say "CachyOS patches applied: $applied"
  fi
fi

ours=0
for p in "$HERE"/patches/*.patch; do
  [ -f "$p" ] || continue
  patch -p1 --forward --batch -N < "$p" > "$WORK/ours.log" 2>&1 || { tail -20 "$WORK/ours.log" >&2; die "CloudOS patch failed: $(basename "$p")"; }
  ours=$((ours+1))
done
say "CloudOS patches applied: $ours"

say "config: x86_64_defconfig + cloudk.config ($MARCH)"
make x86_64_defconfig >/dev/null
FRAG=$WORK/cloudk-frag.config
cat "$HERE/cloudk.config" > "$FRAG"
case $MARCH in
  x86-64-v2) printf 'CONFIG_GENERIC_CPU2=y\n' >> "$FRAG" ;;
  x86-64-v3) printf 'CONFIG_GENERIC_CPU3=y\n' >> "$FRAG" ;;
  x86-64-v4) printf 'CONFIG_GENERIC_CPU4=y\n' >> "$FRAG" ;;
esac
./scripts/kconfig/merge_config.sh -m .config "$FRAG" >/dev/null
make olddefconfig >/dev/null
KREL=$(make -s kernelrelease)
say "kernel release: $KREL"

say "building with $JOBS jobs"
make -j"$JOBS" bzImage modules

say "installing modules into a staging directory"
rm -rf "$WORK/modules"
make modules_install INSTALL_MOD_PATH="$WORK/modules" INSTALL_MOD_STRIP=1 >/dev/null
[ -d "$WORK/modules/lib/modules/$KREL" ] || die "modules were not installed for $KREL"

say "artifacts"
cp arch/x86/boot/bzImage "$OUT/$CK-vmlinuz"
tar -C "$WORK/modules/lib/modules" -cf - "$KREL" | zstd -T0 -19 -q -o "$OUT/$CK-modules.tar.zst"
cp .config "$OUT/$CK-config"
( cd "$OUT" && sha256sum "$CK-vmlinuz" "$CK-modules.tar.zst" "$CK-config" > "$CK.sha256" )

if [ -n "$MINISIGN_KEY" ]; then
  command -v minisign >/dev/null || die "minisign is missing, cannot sign"
  ( cd "$OUT" && minisign -Sm "$CK.sha256" -s "$MINISIGN_KEY" -x "$CK.sha256.minisig" )
  say "signed: $CK.sha256.minisig"
else
  printf 'warning: MINISIGN_KEY is not set, %s.sha256 is unsigned; mkiso needs CLOUDK_VERIFY=0 or a signature\n' "$CK" >&2
fi

say "done: $OUT/$CK-vmlinuz"
( cd "$OUT" && cat "$CK.sha256" )
