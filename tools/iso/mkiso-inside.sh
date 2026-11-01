#!/bin/bash
set -euE
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin
VERSION=${1:-1.4}
KVER=${2:-6.18.10}
NAME=${3:-cloudos-live-amd64-$VERSION.iso}
S=/var/tmp/isosrc
F=/var/tmp/isofiles
B=/var/tmp/isobuild
D=/var/tmp/isoinitramfs
R=/var/tmp/isoroot
O=/var/tmp/isoout
J=$(nproc)

say() { printf '==> %s\n' "$*"; }
die() { printf '::error::%s\n' "$*" >&2; exit 1; }
trap 'rc=$?; printf "::error::упал шаг, строка %s, код %s\n" "$LINENO" "$rc" >&2' ERR

for c in gcc make bc flex bison perl cpio zstd ldd bash mount switch_root mknod mksquashfs xorriso limine depmod openssl useradd usermod; do
  command -v "$c" >/dev/null || die "в stage 3 нет команды $c"
done
[ -e /usr/include/openssl/bio.h ] || die "нет заголовков openssl"
[ -e /usr/include/gelf.h ] || die "нет заголовков libelf"
for f in limine-bios.sys limine-bios-cd.bin limine-uefi-cd.bin BOOTX64.EFI BOOTIA32.EFI; do
  [ -f "/usr/share/limine/$f" ] || die "нет /usr/share/limine/$f"
done

build_kernel() {
  local s need
  rm -rf "$B"
  mkdir -p "$B"
  tar xf "$S/linux-$KVER.tar.xz" -C "$B" --strip-components=1
  cd "$B"
  make defconfig
  scripts/config --set-str LOCALVERSION -cloudos -d LOCALVERSION_AUTO
  scripts/config -d DEBUG_INFO_BTF -d DEBUG_INFO_DWARF4 -d DEBUG_INFO_DWARF5 -e DEBUG_INFO_NONE
  for s in MODULES BLK_DEV_INITRD RD_GZIP RD_XZ RD_ZSTD DEVTMPFS DEVTMPFS_MOUNT TMPFS \
    BLK_DEV_LOOP BLK_DEV_SD BLK_DEV_SR SCSI ATA ATA_SFF ATA_BMDMA ATA_PIIX ATA_GENERIC SATA_AHCI \
    BLK_DEV_NVME USB USB_XHCI_HCD USB_XHCI_PCI USB_EHCI_HCD USB_EHCI_PCI USB_OHCI_HCD USB_UHCI_HCD \
    USB_STORAGE USB_HID HID HID_GENERIC VIRTIO VIRTIO_PCI VIRTIO_BLK VIRTIO_NET VIRTIO_CONSOLE SCSI_VIRTIO \
    SCSI_VMW_PVSCSI VMXNET3 E1000 E1000E IGB R8169 \
    ISO9660_FS JOLIET ZISOFS UDF_FS SQUASHFS SQUASHFS_XZ SQUASHFS_ZLIB OVERLAY_FS \
    EXT4_FS BTRFS_FS VFAT_FS FAT_FS MSDOS_FS NLS_CODEPAGE_437 NLS_ISO8859_1 NLS_UTF8 \
    EFI EFI_STUB EFIVAR_FS FB_EFI SYSFB_SIMPLEFB EXFAT_FS NTFS3_FS DRM DRM_SIMPLEDRM DRM_FBDEV_EMULATION FRAMEBUFFER_CONSOLE VT; do
    scripts/config -e "$s"
  done
  for s in NETFILTER NETFILTER_ADVANCED NF_CONNTRACK NF_TABLES NF_TABLES_INET NF_TABLES_IPV4 NF_TABLES_IPV6 NFT_CT NFT_LIMIT NFT_LOG NFT_REJECT NFT_REJECT_INET NFT_NAT NFT_MASQ NFT_COUNTER NFT_CONNLIMIT NFT_QUOTA \
    NETFILTER_NETLINK NETFILTER_NETLINK_LOG NF_LOG_SYSLOG NF_DEFRAG_IPV4 NF_DEFRAG_IPV6 NF_REJECT_IPV4 NF_REJECT_IPV6 INET IPV6 \
    STACKPROTECTOR STACKPROTECTOR_STRONG STRICT_KERNEL_RWX STRICT_MODULE_RWX RANDOMIZE_BASE RANDOMIZE_MEMORY HARDENED_USERCOPY FORTIFY_SOURCE \
    INIT_ON_ALLOC_DEFAULT_ON SLAB_FREELIST_RANDOM SLAB_FREELIST_HARDENED SHUFFLE_PAGE_ALLOCATOR VMAP_STACK RANDOMIZE_KSTACK_OFFSET_DEFAULT \
    SECURITY SECURITY_YAMA SECURITY_DMESG_RESTRICT STRICT_DEVMEM IO_STRICT_DEVMEM LEGACY_VSYSCALL_NONE BUG_ON_DATA_CORRUPTION \
    SCHED_STACK_END_CHECK DEBUG_WX SECCOMP SECCOMP_FILTER SECURITY_LANDLOCK INIT_STACK_ALL_ZERO ZERO_CALL_USED_REGS LIST_HARDENED LIST_HARDENING RANDOM_KMALLOC_CACHES PAGE_TABLE_ISOLATION; do
    scripts/config -e "$s"
  done
  scripts/config -d LEGACY_VSYSCALL_XONLY -d LEGACY_VSYSCALL_EMULATE -d DEVKMEM -d KEXEC_FILE -d LEGACY_PTYS -d ACPI_CUSTOM_METHOD -d PROC_KCORE -d COMPAT_BRK -d X86_X32_ABI
  make olddefconfig
  need="NF_TABLES NFT_CT NFT_LIMIT NFT_LOG NFT_REJECT NF_CONNTRACK STACKPROTECTOR_STRONG STRICT_KERNEL_RWX RANDOMIZE_BASE HARDENED_USERCOPY SECURITY_YAMA LEGACY_VSYSCALL_NONE INIT_ON_ALLOC_DEFAULT_ON MODULES BLK_DEV_INITRD RD_ZSTD DEVTMPFS BLK_DEV_LOOP BLK_DEV_SR SATA_AHCI BLK_DEV_NVME USB_STORAGE ISO9660_FS SQUASHFS SQUASHFS_XZ OVERLAY_FS EXT4_FS VFAT_FS EFI_STUB"
  for s in $need; do
    grep -q "^CONFIG_$s=y" .config || die "в .config нет CONFIG_$s=y"
  done
  say "ядро $KVER, сборка на $J ядрах"
  make -j"$J" bzImage modules || { echo "!! make -j$J упал, повтор -j1 V=1"; make -j1 V=1 bzImage modules; }
  KREL=$(make -s kernelrelease)
  mkdir -p "$R/boot"
  install -m644 arch/x86/boot/bzImage "$R/boot/vmlinuz"
  make modules_install INSTALL_MOD_STRIP=1
  rm -f "/lib/modules/$KREL/build" "/lib/modules/$KREL/source"
  depmod -a "$KREL"
  cd /
  rm -rf "$B"
  say "ядро $KREL готово: $(du -h "$R/boot/vmlinuz" | cut -f1), модули $(du -sh "/lib/modules/$KREL" | cut -f1)"
}

build_initramfs() {
  local b p l libs
  rm -rf "$D"
  mkdir -p "$D"/{dev,proc,sys,run,tmp,etc,bin,mnt/iso,mnt/sq,mnt/rw,mnt/new}
  mknod -m 600 "$D/dev/console" c 5 1
  mknod -m 666 "$D/dev/null" c 1 3
  for b in bash mount umount switch_root blkid mkdir sleep cat ls dmesg sha256sum; do
    p=$(command -v "$b") || die "нет $b для initramfs"
    install -m755 "$p" "$D/bin/$b"
  done
  libs=$(for b in bash mount umount switch_root blkid mkdir sleep cat ls dmesg sha256sum; do
    ldd "$(command -v "$b")" 2>/dev/null || true
  done | awk '{ for (i = 1; i <= NF; i++) if ($i ~ /^\//) print $i }' | sort -u)
  for l in $libs; do
    cp -L --parents "$l" "$D"
  done
  install -m755 "$F/init" "$D/init"
  for b in bash mount switch_root; do
    chroot "$D" "/bin/$b" --version >/dev/null 2>&1 || die "initramfs: $b не запускается"
  done
  mkdir -p "$R/boot"
  ( cd "$D" && find . | cpio -o -H newc -R 0:0 --quiet ) | zstd -19 -T0 -q -f -o "$R/boot/initramfs.img"
  rm -rf "$D"
  say "initramfs: $(du -h "$R/boot/initramfs.img" | cut -f1)"
}

live_users() {
  local g h1 h2 salt
  for g in wheel users video audio; do getent group "$g" >/dev/null || groupadd "$g"; done
  id cloudos >/dev/null 2>&1 || useradd -m -G wheel,users,video,audio -s /bin/bash cloudos
  h1=$(openssl passwd -6 -salt "$(openssl rand -hex 8)" cloudos)
  h2=$(openssl passwd -6 -salt "$(openssl rand -hex 8)" cloudos)
  usermod -p "$h1" cloudos
  usermod -p "$h2" root
  for g in cloudos root; do
    h1=$(awk -F: -v u="$g" '$1 == u { print $2 }' /etc/shadow)
    salt=$(printf '%s' "$h1" | cut -d'$' -f3)
    [ "$(openssl passwd -6 -salt "$salt" cloudos)" = "$h1" ] || die "пароль $g в live не встал"
  done
  [ "$(id -nG cloudos | tr ' ' '\n' | grep -cx wheel)" = 1 ] || die "cloudos не в группе wheel"
  grep -q 'permit persist :wheel' /etc/doas.conf || die "в doas.conf нет правила для wheel"
  if [ -d /etc/ssh/sshd_config.d ]; then
    printf '%s\n' 'DenyUsers root cloudos' > /etc/ssh/sshd_config.d/05-cloudos-live.conf
  fi
  rc-update del sshd default >/dev/null 2>&1 || true
  rc-update del sshd boot >/dev/null 2>&1 || true
  say "live: пользователь cloudos и root, пароль cloudos, по ssh вход им закрыт"
}

live_tune() {
  live_users
  local n s
  if [ -e /etc/init.d/agetty ]; then
    for n in 1 2 3; do
      ln -sf agetty "/etc/init.d/agetty.tty$n"
      ln -sf "/etc/init.d/agetty.tty$n" "/etc/runlevels/default/agetty.tty$n"
    done
    printf 'agetty_options="--autologin cloudos --noclear"\n' > /etc/conf.d/agetty.tty1
  else
    echo "!! нет /etc/init.d/agetty, вход на tty1 не настроен" >&2
  fi
  for s in udev:sysinit udev-trigger:sysinit sysctl:boot dhcpcd:default syslog-ng:default nftables:default; do
    if [ -e "/etc/init.d/${s%%:*}" ]; then
      rc-update add "${s%%:*}" "${s##*:}" >/dev/null 2>&1 || true
    else
      echo "!! нет службы ${s%%:*}" >&2
    fi
  done
  cat > /etc/motd <<EOM

CloudOS $VERSION live. вход выполнен как cloudos, пароль cloudos (root тоже cloudos, root-права: doas -s). только для live, ssh для них закрыт, фаервол включён: cloudos-firewall status
установка: cfdisk, mkfs, распаковка stage 3 и настройка по handbook
https://wh1laye.github.io/cloudos-repo/

EOM
  rc-update show -v || true
}

build_squashfs() {
  mkdir -p "$R/cloudos"
  say "squashfs (xz), это самый долгий шаг после ядра"
  mksquashfs / "$R/cloudos/rootfs.squashfs" -comp xz -Xbcj x86 -b 1M -Xdict-size 100% -processors "$J" -noappend \
    -e proc sys dev run tmp var/tmp etc/resolv.conf
  ( cd "$R/cloudos" && sha256sum rootfs.squashfs > rootfs.squashfs.sha256 )
  say "rootfs.squashfs: $(du -h "$R/cloudos/rootfs.squashfs" | cut -f1)"
}

build_iso() {
  mkdir -p "$R/boot/limine" "$R/EFI/BOOT" "$O"
  install -m644 /usr/share/limine/limine-bios.sys /usr/share/limine/limine-bios-cd.bin /usr/share/limine/limine-uefi-cd.bin "$R/boot/limine/"
  install -m644 /usr/share/limine/BOOTX64.EFI /usr/share/limine/BOOTIA32.EFI "$R/EFI/BOOT/"
  cat > "$R/boot/limine/limine.conf" <<EOC
timeout: 5

/CloudOS $VERSION live
    protocol: linux
    path: boot():/boot/vmlinuz
    module_path: boot():/boot/initramfs.img
    cmdline: console=tty0 slab_nomerge init_on_alloc=1 page_alloc.shuffle=1 randomize_kstack_offset=on vsyscall=none debugfs=off pti=on

/CloudOS $VERSION live (serial console)
    protocol: linux
    path: boot():/boot/vmlinuz
    module_path: boot():/boot/initramfs.img
    cmdline: console=tty0 console=ttyS0,115200 slab_nomerge init_on_alloc=1 page_alloc.shuffle=1 randomize_kstack_offset=on vsyscall=none debugfs=off pti=on

/CloudOS $VERSION live (rescue shell in initramfs)
    protocol: linux
    path: boot():/boot/vmlinuz
    module_path: boot():/boot/initramfs.img
    cmdline: console=tty0 cloudos.shell slab_nomerge init_on_alloc=1 page_alloc.shuffle=1 randomize_kstack_offset=on vsyscall=none debugfs=off pti=on

/CloudOS $VERSION live (проверка sha256 образа при загрузке)
    protocol: linux
    path: boot():/boot/vmlinuz
    module_path: boot():/boot/initramfs.img
    cmdline: console=tty0 cloudos.verify slab_nomerge init_on_alloc=1 page_alloc.shuffle=1 randomize_kstack_offset=on vsyscall=none debugfs=off pti=on
EOC
  rm -f "$O/$NAME"
  xorriso -as mkisofs -V CLOUDOS -R -r -J \
    -b boot/limine/limine-bios-cd.bin -no-emul-boot -boot-load-size 4 -boot-info-table \
    -hfsplus -apm-block-size 2048 \
    --efi-boot boot/limine/limine-uefi-cd.bin -efi-boot-part --efi-boot-image --protective-msdos-label \
    "$R" -o "$O/$NAME"
  limine bios-install "$O/$NAME"
}

verify_iso() {
  local rep
  rep=$(xorriso -indev "$O/$NAME" -report_el_torito plain 2>&1)
  printf '%s\n' "$rep" | grep -E 'El Torito|BIOS|UEFI' || true
  printf '%s\n' "$rep" | grep -q 'BIOS' || die "в iso нет загрузочной записи BIOS"
  printf '%s\n' "$rep" | grep -q 'UEFI' || die "в iso нет загрузочной записи UEFI"
  xorriso -indev "$O/$NAME" -find / -type f 2>/dev/null | grep -E 'vmlinuz|initramfs|rootfs.squashfs|rootfs.squashfs.sha256|BOOTX64.EFI|limine.conf|limine-bios.sys' || true
  say "iso: $(du -h "$O/$NAME" | cut -f1)"
}

rm -rf "$R" "$O"
mkdir -p "$R" "$O"
build_kernel
build_initramfs
live_tune
build_squashfs
build_iso
verify_iso
say "готово: $O/$NAME"
