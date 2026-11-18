#!/bin/bash
set -eu

HERE=$(cd "$(dirname "$0")" && pwd)
REPO=$(dirname "$(dirname "$HERE")")
KVER=${1:-}
KEY=${MINISIGN_KEY:-}
PIN=${PIN:-$HERE/kernel-pin.txt}
WORK=${WORK:-/var/tmp/cloudk-pin}

say() { printf '==> %s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }
for c in curl tar xz sha256sum awk sort; do
  command -v "$c" >/dev/null || die "missing command: $c"
done
mkdir -p "$WORK"
fetch() { curl -fL --proto =https --retry 5 --retry-delay 10 --connect-timeout 20 -sS -o "$2" "$1"; }

if [ -z "$KVER" ]; then
  fetch "https://cdn.kernel.org/pub/linux/kernel/v6.x/" "$WORK/index.html" || die "cannot read the kernel.org index"
  KVER=$(grep -oE 'linux-6\.[0-9]+(\.[0-9]+)?\.tar\.xz' "$WORK/index.html" | sed -E 's/^linux-//; s/\.tar\.xz$//' | sort -V | tail -1)
  [ -n "$KVER" ] || die "cannot detect the kernel version"
fi
MAJOR=${KVER%%.*}
TARBALL=$WORK/linux-$KVER.tar.xz
say "kernel $KVER"
fetch "https://cdn.kernel.org/pub/linux/kernel/v$MAJOR.x/linux-$KVER.tar.xz" "$TARBALL" || die "download failed"
SUM=$(sha256sum "$TARBALL" | awk '{print $1}')

touch "$PIN"
grep -v "^$KVER " "$PIN" > "$PIN.new" || true
printf '%s %s\n' "$KVER" "$SUM" >> "$PIN.new"
sort -V "$PIN.new" -o "$PIN"
rm -f "$PIN.new"
say "pinned: $KVER $SUM"

if [ -n "$KEY" ]; then
  command -v minisign >/dev/null 2>&1 || die "minisign is missing"
  minisign -Sm "$PIN" -s "$KEY" -x "$PIN.minisig"
  say "pin signed with the CloudOS key"
else
  say "MINISIGN_KEY is not set, the pin is unsigned"
fi
say "commit $PIN and $PIN.minisig, public key: $REPO/docs/cloudos.pub"
