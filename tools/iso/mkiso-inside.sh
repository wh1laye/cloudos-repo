#!/bin/bash
set -eu

VERSION=${1:-2.4}
KVER=${2:-6.18.10}
NAME=${3:-cloudos-live-amd64-$VERSION.iso}
MARCH=${4:-x86-64-v3}
CLOUDK_VER=${5:-0.6}

ISOSRC=/var/tmp/isosrc
ISOFILES=/var/tmp/isofiles
ISOOUT=/var/tmp/isoout
CK=cloudk-$CLOUDK_VER-$MARCH
CMDLINE="root=live:CDLABEL=CLOUDOS_LIVE rd.live.image apparmor=1 security=apparmor quiet init=/init"

say() { printf '==> %s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }

[ -f "$ISOSRC/$CK-vmlinuz" ] || die "no kernel: $CK-vmlinuz"
[ -f "$ISOSRC/$CK-modules.tar.zst" ] || die "no modules: $CK-modules.tar.zst"
[ -f "$ISOSRC/$CK-config" ] || die "no kernel config: $CK-config"
[ -f "$ISOFILES/init" ] || die "no init"
for c in zstd tar mksquashfs xorriso awk grep; do
  command -v "$c" >/dev/null || die "missing command: $c"
done

mkdir -p "$ISOOUT"

kernel_hardening() {
  cfg=$ISOSRC/$CK-config
  for sym in \
    CONFIG_SECURITY_APPARMOR \
    CONFIG_SECURITY_APPARMOR_BOOTPARAM_VALUE \
    CONFIG_SECURITY_YAMA \
    CONFIG_SECURITY_DMESG_RESTRICT \
    CONFIG_HARDENED_USERCOPY \
    CONFIG_FORTIFY_SOURCE \
    CONFIG_STACKPROTECTOR_STRONG \
    CONFIG_VMAP_STACK \
    CONFIG_STRICT_KERNEL_RWX \
    CONFIG_STRICT_MODULE_RWX \
    CONFIG_RANDOMIZE_BASE \
    CONFIG_INIT_ON_ALLOC_DEFAULT_ON \
    CONFIG_INIT_ON_FREE_DEFAULT_ON \
    CONFIG_SLAB_FREELIST_HARDENED \
    CONFIG_SLAB_FREELIST_RANDOM \
    CONFIG_RANDOMIZE_KSTACK_OFFSET_DEFAULT \
    CONFIG_PAGE_TABLE_ISOLATION \
    CONFIG_MODULE_SIG; do
    grep -q "^$sym=" "$cfg" || die "kernel config has no $sym"
  done
  grep -q '^CONFIG_SECURITY_APPARMOR=y' "$cfg" || die "apparmor is not built into the kernel"
  grep -q '^CONFIG_LSM=.*apparmor' "$cfg" || die "apparmor is not in CONFIG_LSM"
  grep -q '^CONFIG_MODULE_SIG=y' "$cfg" || die "module signing is off"
  say "kernel hardening ok: apparmor, kspp, module signing"
}

modules_install() {
  zstd -dc "$ISOSRC/$CK-modules.tar.zst" | tar -xpf - -C /lib/modules
  depmod -a "$KVER" 2>/dev/null || true
}

squashfs_build() {
  mkdir -p /run/live
  mksquashfs / /run/live/filesystem.squashfs -comp zstd -Xcompression-level 19 -noappend -wildcards -e \
    var/tmp/isosrc var/tmp/isofiles var/tmp/isoout var/cache/cloudpkg var/tmp/cloudpkg-build \
    var/log var/run var/lock run/live tmp
}

iso_build() {
  mkdir -p "$ISOOUT/efi/boot"
  cp "$ISOSRC/$CK-vmlinuz" "$ISOOUT/vmlinuz"
  cp /run/live/filesystem.squashfs "$ISOOUT/filesystem.squashfs"
  cp "$ISOFILES/init" "$ISOOUT/init"
  cat > "$ISOOUT/limine.conf" <<CONF
timeout: 5
default_entry: 1

/CloudOS Live
    protocol: linux
    kernel_path: boot:///vmlinuz
    cmdline: $CMDLINE
    module_path: boot:///filesystem.squashfs
CONF
  for f in limine-bios-cd.bin limine-uefi-cd.bin limine-bios.sys BOOTX64.EFI; do
    [ -f "$ISOFILES/limine/$f" ] || die "no limine file: $f"
  done
  cp "$ISOFILES/limine/limine-bios-cd.bin" "$ISOOUT/"
  cp "$ISOFILES/limine/limine-uefi-cd.bin" "$ISOOUT/efi/boot/"
  cp "$ISOFILES/limine/BOOTX64.EFI" "$ISOOUT/efi/boot/bootx64.efi"
  xorriso -as mkisofs -o "$ISOOUT/$NAME" \
    -isohybrid-mbr "$ISOFILES/limine/limine-bios.sys" \
    -c boot.cat -b limine-bios-cd.bin -no-emul-boot -boot-load-size 4 -boot-info-table \
    -eltorito-alt-boot -e efi/boot/limine-uefi-cd.bin -no-emul-boot \
    -isohybrid-gpt-basdat -V CLOUDOS_LIVE "$ISOOUT"
}

kernel_hardening
say "installing kernel modules"
modules_install
say "building squashfs"
squashfs_build
say "building iso"
iso_build
say "iso ready: $ISOOUT/$NAME ($(du -h "$ISOOUT/$NAME" | cut -f1))"
