#!/bin/bash
set -uo pipefail

K=${1:-}
KREL=${2:-}
die() { printf '::error::%s\n' "$*" >&2; exit 1; }

[ -s "$K" ] || die "использование: $0 vmlinuz [версия ядра]"
command -v qemu-system-x86_64 >/dev/null || die "нет qemu-system-x86_64"

L=$(mktemp)
trap 'rm -f "$L"' EXIT
modes="tcg"
[ -w /dev/kvm ] && modes="tcg kvm"
fail=0

for m in $modes; do
  : > "$L"
  case $m in kvm) acc="-enable-kvm" ;; *) acc="-accel tcg" ;; esac
  echo "==> загрузка ядра, режим $m"
  timeout 120 qemu-system-x86_64 $acc -m 1024 -smp 2 -display none -serial stdio -no-reboot \
    -kernel "$K" -append "console=ttyS0 earlycon=uart8250,io,0x3f8,115200n8 ignore_loglevel panic=-1 rdinit=/none" > "$L" 2>&1
  echo "qemu завершился с кодом $?"
  tr -d '\033' < "$L" | tail -n 40
  if ! grep -aq 'Linux version' "$L"; then
    echo "::error::режим $m: ядро ничего не вывело в serial"; fail=1; continue
  fi
  if [ -n "$KREL" ] && ! grep -aq "Linux version $KREL" "$L"; then
    echo "::error::режим $m: версия в логе не $KREL"; fail=1; continue
  fi
  if ! grep -aqE 'Unable to mount root fs|Cannot open root device|No working init|Run /' "$L"; then
    echo "::error::режим $m: ядро не дошло до запуска init"; fail=1; continue
  fi
  echo "==> режим $m: ядро дошло до запуска init"
done

exit $fail
