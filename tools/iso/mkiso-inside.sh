#!/bin/bash
set -eu

VERSION=${1:-2.4}
KVER=${2:-6.18.10}
NAME=${3:-cloudos-live-amd64-$VERSION.iso}
MARCH=${4:-x86-64-v3}
CLOUDK_VER=${5:-0.6}

say() { printf '==> %s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }

ISOSRC=/var/tmp/isosrc
ISOFILES=/var/tmp/isofiles
ISOOUT=/var/tmp/isoout

[ -f "$ISOSRC/cloudk-$CLOUDK_VER-$MARCH-vmlinuz" ] || die "no kernel"
[ -f "$ISOSRC/cloudk-$CLOUDK_VER-$MARCH-modules.tar.zst" ] || die "no modules"
[ -f "$ISOFILES/init" ] || die "no init"

mkdir -p "$ISOOUT"

say "установка модулей ядра"
zstd -dc "$ISOSRC/cloudk-$CLOUDK_VER-$MARCH-modules.tar.zst" | tar -xpf - -C /

say "создание squashfs"
mkdir -p /run/live
mksquashfs / /run/live/filesystem.squashfs -comp zstd -Xcompression-level 19 -noappend -wildcards -e \
  var/tmp/isosrc var/tmp/isofiles var/tmp/isoout var/cache/cloudpkg var/tmp/cloudpkg-build \
  var/db/cloudpkg var/log var/run var/lock tmp

say "создание ISO"
mkdir -p "$ISOOUT/efi/boot"
cp "$ISOSRC/cloudk-$CLOUDK_VER-$MARCH-vmlinuz" "$ISOOUT/vmlinuz"
cp /run/live/filesystem.squashfs "$ISOOUT/"
cp "$ISOFILES/init" "$ISOOUT/init"

cat > "$ISOOUT/limine.conf" <<CONF
timeout: 5
default_entry: 1

/CloudOS Live
    protocol: linux
    kernel_path: boot:///vmlinuz
    cmdline: root=live:CDLABEL=CLOUDOS_LIVE rd.live.image quiet init=/init
    module_path: boot:///filesystem.squashfs
CONF

cp "$ISOFILES/limine/limine-bios-cd.bin" "$ISOOUT/"
cp "$ISOFILES/limine/limine-uefi-cd.bin" "$ISOOUT/efi/boot/"
cp "$ISOFILES/limine/BOOTX64.EFI" "$ISOOUT/efi/boot/bootx64.efi"

xorriso -as mkisofs -o "$ISOOUT/$NAME" \
  -isohybrid-mbr "$ISOFILES/limine/limine-bios.sys" \
  -c boot.cat -b limine-bios-cd.bin -no-emul-boot -boot-load-size 4 -boot-info-table \
  -eltorito-alt-boot -e efi/boot/limine-uefi-cd.bin -no-emul-boot \
  -isohybrid-gpt-basdat -V CLOUDOS_LIVE "$ISOOUT"

say "ISO готов: $ISOOUT/$NAME ($(du -h "$ISOOUT/$NAME" | cut -f1))"
