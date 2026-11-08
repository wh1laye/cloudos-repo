#!/bin/bash
set -uo pipefail
K=${1:-}
KREL=${2:-}
CVER=${3:-}
HERE=$(cd "$(dirname "$0")" && pwd)
die() { printf '::error::%s\n' "$*" >&2; exit 1; }
[ -s "$K" ] || die "использование: $0 vmlinuz [версия ядра] [версия cloudk]"
command -v qemu-system-x86_64 >/dev/null || die "нет qemu-system-x86_64"
BB=$(command -v busybox) || die "нет busybox, поставь busybox-static"
if ldd "$BB" >/dev/null 2>&1; then die "busybox динамический, нужен busybox-static"; fi
T=$(mktemp -d)
trap 'rm -rf "$T"' EXIT
python3 "$HERE/mkcpio.py" "$T/initrd.gz" "$BB" "$HERE/userspace-init.sh" || die "не собран initramfs"
modes="tcg:max"
[ -w /dev/kvm ] && modes="$modes kvm:host"
fail=0
for e in $modes; do
  m=${e%%:*}
  cpu=${e#*:}
  case $m in kvm) acc="-enable-kvm" ;; *) acc="-accel tcg" ;; esac
  : > "$T/serial.log"
  echo "==> userspace, режим $m/$cpu"
  timeout 150 qemu-system-x86_64 $acc -cpu "$cpu" -m 1024 -smp 2 -display none -monitor none -no-reboot \
    -serial "file:$T/serial.log" -kernel "$K" -initrd "$T/initrd.gz" \
    -append "console=ttyS0 panic=-1 rdinit=/init" < /dev/null > "$T/qemu.log" 2>&1
  tr -d '\033' < "$T/serial.log" | tail -n 25
  if bash "$HERE/userspace-verdict.sh" "$T/serial.log" "$KREL" "$CVER"; then
    echo "==> режим $m/$cpu: userspace отработал, проверки ядра пройдены"
  else
    fail=1
  fi
done
exit $fail
