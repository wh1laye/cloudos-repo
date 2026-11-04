#!/bin/bash
set -euE
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin
VERSION=${1:-2.2}
KVER=${2:-6.18.10}
NAME=${3:-cloudos-live-amd64-$VERSION.iso}
MARCH=${4:-x86-64}
CLOUDK_VER=${5:-0.1}
S=/var/tmp/isosrc
F=/var/tmp/isofiles
B=/var/tmp/isobuild
D=/var/tmp/isoinitramfs
R=/var/tmp/isoroot
O=/var/tmp/isoout
J=$(nproc)
HARDEN='slab_nomerge init_on_alloc=1 page_alloc.shuffle=1 randomize_kstack_offset=on vsyscall=none debugfs=off pti=on module.sig_enforce=1 efi=disable_early_pci_dma iommu.strict=1'

say() { printf '==> %s\n' "$*"; }
die() { printf '::error::%s\n' "$*" >&2; exit 1; }
on_err() { printf '::error::упал шаг, строка %s, код %s\n' "$1" "$2" >&2; }
trap 'on_err "$LINENO" "$?"' ERR

for c in gcc make bc flex bison perl cpio zstd ldd bash mount switch_root mknod mksquashfs xorriso limine depmod openssl useradd usermod; do
  command -v "$c" >/dev/null || die "в stage 3 нет команды $c"
done
[ -e /usr/include/openssl/bio.h ] || die "нет заголовков openssl"
[ -e /usr/include/gelf.h ] || die "нет заголовков libelf"
for f in limine-bios.sys limine-bios-cd.bin limine-uefi-cd.bin BOOTX64.EFI BOOTIA32.EFI; do
  [ -f "/usr/share/limine/$f" ] || die "нет /usr/share/limine/$f"
done

install_cloudk() {
  local ck=cloudk-$CLOUDK_VER-$MARCH krel=$KVER-cloudk-$CLOUDK_VER
  [ -s "$S/$ck-vmlinuz" ] || die "нет $S/$ck-vmlinuz"
  [ -s "$S/$ck-modules.tar.zst" ] || die "нет $S/$ck-modules.tar.zst"
  mkdir -p "$R/boot" /lib/modules
  install -m644 "$S/$ck-vmlinuz" "$R/boot/vmlinuz"
  rm -rf "/lib/modules/$krel"
  zstd -dc "$S/$ck-modules.tar.zst" | tar -xf - -C /lib
  [ -d "/lib/modules/$krel" ] || die "в архиве модулей нет $krel, версия ядра $KVER не совпала с релизом cloudk"
  depmod -a "$krel"
  [ -s "/lib/modules/$krel/modules.dep" ] || die "depmod не создал modules.dep"
  say "ядро cloudk $CLOUDK_VER ($krel): vmlinuz $(du -h "$R/boot/vmlinuz" | cut -f1), модули $(du -sh "/lib/modules/$krel" | cut -f1)"
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
  [ -e /etc/doas.conf ] || : > /etc/doas.conf
  if [ -s /etc/doas.conf ] && [ -n "$(tail -c1 /etc/doas.conf)" ]; then echo >> /etc/doas.conf; fi
  for rule in 'permit persist :wheel' 'permit nopass root'; do
    grep -qxF "$rule" /etc/doas.conf || printf '%s\n' "$rule" >> /etc/doas.conf
  done
  chmod 600 /etc/doas.conf
  grep -qxF 'permit persist :wheel' /etc/doas.conf || die "в doas.conf нет правила для wheel"
  if [ -d /etc/ssh/sshd_config.d ]; then
    printf '%s\n' 'DenyUsers root cloudos' > /etc/ssh/sshd_config.d/05-cloudos-live.conf
  fi
  rc-update del sshd default >/dev/null 2>&1 || true
  rc-update del sshd boot >/dev/null 2>&1 || true
  say "live: пользователь cloudos и root, пароль cloudos, по ssh вход им закрыт"
}

kcfg_stub() {
  local d=/var/tmp/cloudos-kcfg
  rm -rf "$d"
  mkdir -p "$d"
  printf 'VERSION = %s\nPATCHLEVEL = %s\nSUBLEVEL = %s\nEXTRAVERSION =\n' "${KVER%%.*}" "$(echo "$KVER" | cut -d. -f2)" "$(echo "$KVER" | cut -d. -f3)" > "$d/Makefile"
  printf 'CONFIG_NET=y\nCONFIG_SECURITY=y\nCONFIG_SECURITYFS=y\nCONFIG_SECURITY_NETWORK=y\nCONFIG_AUDIT=y\nCONFIG_SECURITY_APPARMOR=y\nCONFIG_SECURITY_APPARMOR_HASH=y\nCONFIG_DEFAULT_SECURITY_APPARMOR=y\nCONFIG_CRYPTO_SHA256=y\n' > "$d/.config"
  export KERNEL_DIR=$d
}

build_wifi() {
  say "wifi: iwd, wireless-regdb, iw, linux-firmware"
  if [ -d /etc/portage/package.use ]; then
    echo 'sys-kernel/linux-firmware -initramfs' > /etc/portage/package.use/cloudos-wifi
  elif [ -f /etc/portage/package.use ]; then
    echo 'sys-kernel/linux-firmware -initramfs' >> /etc/portage/package.use
  else
    mkdir -p /etc/portage/package.use
    echo 'sys-kernel/linux-firmware -initramfs' > /etc/portage/package.use/cloudos-wifi
  fi
  [ -e /etc/fstab ] || : > /etc/fstab
  if [ ! -e /usr/bin/yacc.bison ] && command -v bison >/dev/null; then
    printf '#!/bin/sh\nexec bison -y "$@"\n' > /usr/bin/yacc.bison
    chmod 755 /usr/bin/yacc.bison
  fi
  cloudpkg sync
  DONT_MOUNT_BOOT=1 cloudpkg install net-wireless/iwd net-wireless/wireless-regdb net-wireless/iw sys-kernel/linux-firmware || die "wifi пакеты не поставились, причина выше"
  command -v iwctl >/dev/null || die "после установки нет iwctl"
  [ -d /lib/firmware ] && [ -n "$(ls -A /lib/firmware)" ] || die "в /lib/firmware пусто, linux-firmware не встал"
  [ -f /lib/firmware/regulatory.db ] || echo "!! нет /lib/firmware/regulatory.db" >&2
  command -v mkfs.vfat >/dev/null || DONT_MOUNT_BOOT=1 cloudpkg install sys-fs/dosfstools || die "dosfstools не поставился, установщику нужен mkfs.vfat"
  command -v mkfs.vfat >/dev/null || die "после установки нет mkfs.vfat"
  command -v mkfs.btrfs >/dev/null || DONT_MOUNT_BOOT=1 cloudpkg install sys-fs/btrfs-progs || echo "!! btrfs-progs не поставился, установщик будет без btrfs" >&2
  for c in sfdisk wipefs lsblk findmnt blkid unsquashfs limine; do command -v "$c" >/dev/null || die "установщику нужна команда $c"; done
  command -v cryptsetup >/dev/null || DONT_MOUNT_BOOT=1 cloudpkg install sys-fs/cryptsetup || echo "!! cryptsetup не поставился, установщик будет без luks" >&2
  command -v sbsign >/dev/null || DONT_MOUNT_BOOT=1 cloudpkg install app-crypt/sbsigntools || echo "!! sbsigntools не поставился, secure boot в установщике недоступен" >&2
  command -v cert-to-efi-sig-list >/dev/null || DONT_MOUNT_BOOT=1 cloudpkg install app-crypt/efitools || echo "!! efitools не поставился, secure boot в установщике недоступен" >&2
  command -v minisign >/dev/null || DONT_MOUNT_BOOT=1 cloudpkg install app-crypt/minisign || die "minisign не поставился, cloudpkg update без него не проверит подпись"
  command -v minisign >/dev/null || die "после установки нет minisign"
  kcfg_stub
  command -v apparmor_parser >/dev/null || DONT_MOUNT_BOOT=1 cloudpkg install sys-apps/apparmor || die "apparmor не поставился"
  command -v apparmor_parser >/dev/null || die "после установки нет apparmor_parser"
  [ -d /etc/apparmor.d ] && ls /etc/apparmor.d/* >/dev/null 2>&1 || DONT_MOUNT_BOOT=1 cloudpkg install sec-policy/apparmor-profiles || echo "!! apparmor-profiles не поставился, профилей не будет" >&2
  unset KERNEL_DIR
  rm -rf /var/tmp/cloudos-kcfg
  command -v tpm2_unseal >/dev/null || DONT_MOUNT_BOOT=1 cloudpkg install app-crypt/tpm2-tools || echo "!! tpm2-tools не поставился, cloudos-tpm2 недоступен" >&2
  if [ -d /etc/portage/package.use ]; then echo "sys-apps/systemd-utils boot" > /etc/portage/package.use/cloudos-uki; else echo "sys-apps/systemd-utils boot" >> /etc/portage/package.use; fi
  [ -f /usr/lib/systemd/boot/efi/linuxx64.efi.stub ] || DONT_MOUNT_BOOT=1 cloudpkg install sys-apps/systemd-utils || echo "!! systemd-utils (efi stub) не поставился, cloudos-uki недоступен" >&2
  command -v dracut >/dev/null || echo "!! нет dracut, luks в установщике не заработает" >&2
  rm -rf /var/db/repos/gentoo /var/cache/distfiles/* /var/tmp/portage/*
  say "wifi пакеты готовы, прошивки $(du -sh /lib/firmware | cut -f1)"
}

live_wifi() {
  local bin
  getent group netdev >/dev/null || groupadd netdev
  usermod -aG netdev cloudos
  install -d -m755 /etc/iwd
  install -d -m700 /var/lib/iwd
  printf '[General]\nEnableNetworkConfiguration=false\n' > /etc/iwd/main.conf
  if [ ! -e /etc/init.d/iwd ]; then
    for bin in /usr/libexec/iwd /usr/lib/iwd/iwd /usr/sbin/iwd /usr/bin/iwd; do
      [ -x "$bin" ] && break
      bin=
    done
    [ -n "$bin" ] || die "нет бинарника iwd"
    cat > /etc/init.d/iwd <<EOS
#!/sbin/openrc-run
description="iwd wireless daemon"
command=$bin
command_background=true
pidfile=/run/iwd.pid

depend() {
	need dbus
	after bootmisc modules
	before dhcpcd
}
EOS
    chmod 755 /etc/init.d/iwd
  fi
  say "live: wifi через iwctl, dhcp делает dhcpcd, пользователь cloudos в группе netdev"
}

live_smoke() {
  cat > /etc/init.d/cloudos-smoke <<'EOS'
#!/sbin/openrc-run
description="cloudos live smoke test"

depend() {
	after nftables dhcpcd iwd syslog-ng local
}

out() { printf 'cloudos-smoke: %s\n' "$*" > /dev/console; }

start() {
	grep -qw cloudos.smoke /proc/cmdline || return 0
	local f=0
	id -nG cloudos 2>/dev/null | tr ' ' '\n' | grep -qx wheel || { out "FAIL cloudos не в wheel"; f=1; }
	grep -qxF 'permit persist :wheel' /etc/doas.conf || { out "FAIL в doas.conf нет правила wheel"; f=1; }
	doas -C /etc/doas.conf >/dev/null 2>&1 || { out "FAIL doas.conf не разбирается"; f=1; }
	su -s /bin/bash cloudos -c 'id -u' 2>/dev/null | grep -qx '[1-9][0-9]*' || { out "FAIL su cloudos не работает"; f=1; }
	awk '$4 == "0A" && $2 ~ /:0016$/ { f = 1 } END { exit !f }' /proc/net/tcp && { out "FAIL порт 22 слушается"; f=1; }
	nft list ruleset 2>/dev/null | grep -q drop || { out "FAIL в nftables нет drop"; f=1; }
	[ "$(cat /proc/sys/kernel/kptr_restrict)" = 2 ] || { out "FAIL kptr_restrict"; f=1; }
	[ "$(cat /proc/sys/kernel/yama/ptrace_scope)" = 2 ] || { out "FAIL ptrace_scope"; f=1; }
	[ "$(cat /proc/sys/kernel/unprivileged_bpf_disabled)" != 0 ] || { out "FAIL unprivileged_bpf"; f=1; }
	[ -e /etc/init.d/iwd ] && command -v iwctl >/dev/null || { out "FAIL нет iwd или iwctl"; f=1; }
	rc-service -q iwd status >/dev/null 2>&1 || { out "FAIL iwd не запущен"; f=1; }
	[ "$f" = 0 ] && out ok
	if grep -qw cloudos.itest /proc/cmdline; then
		local d= x fs=ext4
		for x in /dev/vda /dev/vdb /dev/sdb; do [ -b "$x" ] && { d=$x; break; }; done
		if grep -qw cloudos.itest.fs=btrfs /proc/cmdline; then fs=btrfs; fi
		if [ -z "$d" ]; then
			out "itest FAIL нет диска для установки"
		elif CLOUDOS_YES=1 CLOUDOS_DISK=$d CLOUDOS_FS=$fs CLOUDOS_FW=bios CLOUDOS_HOST=itest CLOUDOS_USER=tester CLOUDOS_PASS=tester-pass CLOUDOS_ROOTPASS=root-pass CLOUDOS_CMDLINE_EXTRA="console=ttyS0,115200" /usr/sbin/cloudos-install > /dev/console 2>&1; then
			out "itest ok"
		else
			out "itest FAIL установщик завершился с ошибкой"
		fi
	fi
	sync
	echo o > /proc/sysrq-trigger
	return 0
}
EOS
  chmod 755 /etc/init.d/cloudos-smoke
  rc-update add cloudos-smoke default >/dev/null 2>&1 || die "cloudos-smoke не встал в default"
}

live_installer() {
  install -m755 "$F/cloudos-install" /usr/sbin/cloudos-install
  bash -n /usr/sbin/cloudos-install || die "cloudos-install с ошибкой синтаксиса"
  install -m755 "$F/cloudos-secureboot" /usr/sbin/cloudos-secureboot
  bash -n /usr/sbin/cloudos-secureboot || die "cloudos-secureboot с ошибкой синтаксиса"
  install -m755 "$F/cloudos-uki" /usr/sbin/cloudos-uki
  bash -n /usr/sbin/cloudos-uki || die "cloudos-uki с ошибкой синтаксиса"
  install -m755 "$F/cloudos-tpm2" /usr/sbin/cloudos-tpm2
  bash -n /usr/sbin/cloudos-tpm2 || die "cloudos-tpm2 с ошибкой синтаксиса"
  install -d /usr/lib/dracut/modules.d/91cloudos-tpm2
  install -m755 "$F/dracut-tpm2/module-setup.sh" "$F/dracut-tpm2/cloudos-tpm2-unlock.sh" /usr/lib/dracut/modules.d/91cloudos-tpm2/
  install -m755 "$F/cloudos-audit" /usr/sbin/cloudos-audit
  install -d /etc/sysctl.d
  install -m644 "$F/sysctl-perf.conf" /etc/sysctl.d/91-cloudos-perf.conf
  say "установщик cloudos-install на месте"
}

live_tune() {
  live_users
  live_installer
  live_wifi
  live_smoke
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
  for s in udev:sysinit udev-trigger:sysinit sysctl:boot dbus:default iwd:default dhcpcd:default syslog-ng:default nftables:default apparmor:boot; do
    if [ -e "/etc/init.d/${s%%:*}" ]; then
      rc-update add "${s%%:*}" "${s##*:}" >/dev/null 2>&1 || true
    else
      echo "!! нет службы ${s%%:*}" >&2
    fi
  done
  cat > /etc/motd <<EOM

CloudOS $VERSION live. вход выполнен как cloudos, пароль cloudos (root тоже cloudos, root-права: doas -s). только для live, ssh для них закрыт, фаервол включён: cloudos-firewall status
wifi: iwctl, затем station wlan0 scan, station wlan0 get-networks, station wlan0 connect имя_сети
install: doas cloudos-install, one command does it all (auto: whole disk, manual: your own partitions). by hand: handbook, section manual install
editor: nvim with lazyvim. keyboard layout, language and time zone are chosen in cloudos-install
https://wh1laye.github.io/cloudos-repo/

EOM
  rc-update show -v || true
}

check_extras() {
  local c
  for c in nvim git rg fd tmux htop; do
    command -v "$c" >/dev/null || echo "!! в stage 3 нет $c" >&2
  done
  [ -d /etc/skel/.config/nvim ] || echo "!! в stage 3 нет конфига lazyvim" >&2
}

apply_march() {
  printf '%s\n' "$MARCH" > /etc/cloudos-march
  if [ "$MARCH" != x86-64 ] && [ -f /etc/portage/make.conf ]; then
    sed -i "s/-march=x86-64\b/-march=$MARCH/" /etc/portage/make.conf
  fi
  say "микроархитектура: $MARCH"
}

build_squashfs() {
  mkdir -p "$R/cloudos"
  say "squashfs (xz), это самый долгий шаг после ядра"
  mksquashfs / "$R/cloudos/rootfs.squashfs" -comp xz -Xbcj x86 -b 1M -Xdict-size 100% -processors "$J" -noappend \
    -e proc sys dev run tmp var/tmp etc/resolv.conf usr/share/doc usr/share/gtk-doc
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
    cmdline: console=tty0 $HARDEN

/CloudOS $VERSION live (serial console)
    protocol: linux
    path: boot():/boot/vmlinuz
    module_path: boot():/boot/initramfs.img
    cmdline: console=tty0 console=ttyS0,115200 $HARDEN

/CloudOS $VERSION live (rescue shell in initramfs)
    protocol: linux
    path: boot():/boot/vmlinuz
    module_path: boot():/boot/initramfs.img
    cmdline: console=tty0 cloudos.shell $HARDEN

/CloudOS $VERSION live (проверка sha256 образа при загрузке)
    protocol: linux
    path: boot():/boot/vmlinuz
    module_path: boot():/boot/initramfs.img
    cmdline: console=tty0 cloudos.verify $HARDEN
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
build_wifi
install_cloudk
build_initramfs
live_tune
check_extras
apply_march
build_squashfs
build_iso
verify_iso
say "готово: $O/$NAME"
