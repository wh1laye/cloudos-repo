#!/bin/bash
set -uo pipefail
LOG=${1:-}
KREL=${2:-}
CVER=${3:-}
[ -s "$LOG" ] || { echo "::error::нет лога $LOG" >&2; exit 1; }
T=$(mktemp)
trap 'rm -f "$T"' EXIT
tr -d '\r\033' < "$LOG" > "$T"
f=0
err() { printf '::error::%s\n' "$*" >&2; f=1; }
grep -aq 'Kernel panic' "$T" && err "паника ядра"
grep -aqx 'CLOUDK-START' "$T" || err "userspace не запустился"
grep -aqx 'CLOUDK-DONE' "$T" || err "userspace не дошёл до конца проверок"
if [ -n "$KREL" ]; then
  grep -aqxF "CLOUDK-UNAME: $KREL" "$T" || err "uname -r не $KREL"
fi
if [ -n "$CVER" ]; then
  grep -aqF "CLOUDK-PROC: cloudk $CVER release" "$T" || err "/proc/cloudk не показывает cloudk $CVER"
fi
grep -aqx 'CLOUDK-LOCKDOWN: none' "$T" && err "lockdown недоступен в ядре"
grep -a '^CLOUDK-' "$T" | grep -aE 'BORE|LSM|LOCKDOWN|PROC' | sed 's/^/    /'
exit $f
