#!/bin/bash
set -uo pipefail

K=${1:-}
KREL=${2:-}
die() { printf '::error::%s\n' "$*" >&2; exit 1; }

[ -s "$K" ] || die "использование: $0 vmlinuz [версия ядра]"
command -v qemu-system-x86_64 >/dev/null || die "нет qemu-system-x86_64"

T=$(mktemp -d)
trap 'rm -rf "$T"' EXIT
S=$T/serial.log
Q=$T/qemu.log
D=$T/debug.log
modes="tcg:max"
[ -w /dev/kvm ] && modes="$modes kvm:host"
case $(basename "$K") in *v3*) ;; *) modes="$modes tcg:qemu64" ;; esac
fail=0

for e in $modes; do
  m=${e%%:*}
  cpu=${e#*:}
  : > "$S"; : > "$Q"; : > "$D"
  dbg=""
  case $m in kvm) acc="-enable-kvm" ;; *) acc="-accel tcg"; dbg="-d int,cpu_reset,guest_errors -D $D" ;; esac
  m="$m/$cpu"
  echo "==> загрузка ядра, режим $m"
  t0=$(date +%s)
  timeout 90 qemu-system-x86_64 $acc -cpu "$cpu" $dbg -m 1024 -smp 2 -display none -monitor none -no-reboot \
    -serial "file:$S" -kernel "$K" \
    -append "console=ttyS0 earlyprintk=serial,ttyS0,115200 earlycon=uart8250,io,0x3f8,115200n8 ignore_loglevel panic=-1 rdinit=/none" \
    < /dev/null > "$Q" 2>&1
  rc=$?
  echo "qemu завершился с кодом $rc за $(( $(date +%s) - t0 )) с"
  echo "--- stderr qemu ---"; tail -n 20 "$Q"
  echo "--- serial ($(wc -c < "$S") байт) ---"; tr -d '\033' < "$S" | tail -n 40
  if [ -s "$D" ]; then
    echo "--- первые исключения и сброс cpu (qemu -d) ---"
    grep -aE 'CPU Reset|check_exception|^ *[0-9]+: v=|RIP=|CR2=|CR0=|CR3=|CR4=|EFER=' "$D" | head -n 40
  fi
  {
    echo "### cloudk: режим $m"
    echo "- qemu: код $rc, работал $(( $(date +%s) - t0 )) с"
    echo "- serial: $(wc -c < "$S") байт"
    if [ -s "$D" ]; then
      echo "- исключения и сброс cpu:"
      grep -aE 'CPU Reset|check_exception|^ *[0-9]+: v=|RIP=|CR2=' "$D" | head -n 12 | sed 's/^/    /'
    fi
    echo "- serial, конец:"
    tr -d '\033' < "$S" | tail -n 15 | sed 's/^/    /'
    echo "- stderr qemu, конец:"
    tail -n 5 "$Q" | sed 's/^/    /'
  } >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
  if ! grep -aq 'Linux version' "$S"; then
    echo "::error::режим $m: ядро ничего не вывело в serial"; fail=1; continue
  fi
  if [ -n "$KREL" ] && ! grep -aq "Linux version $KREL" "$S"; then
    echo "::error::режим $m: версия в логе не $KREL"; fail=1; continue
  fi
  if ! grep -aqE 'Unable to mount root fs|Cannot open root device|No working init|Run /' "$S"; then
    echo "::error::режим $m: ядро не дошло до запуска init"; fail=1; continue
  fi
  echo "==> режим $m: ядро дошло до запуска init"
done

exit $fail
