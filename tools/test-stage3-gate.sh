#!/bin/bash
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
SRC=$HERE/stage3/build-inside.sh
T=$(mktemp -d)
trap 'rm -rf "$T"' EXIT
fail() { printf 'тест не пройден: %s\n' "$*" >&2; exit 1; }
ok() { printf 'ok: %s\n' "$*"; }

a=$(grep -n '^partial_gate() {' "$SRC" | cut -d: -f1)
b=$(grep -n '^keep_logs() {' "$SRC" | cut -d: -f1)
[ -n "$a" ] && [ -n "$b" ] || fail "нет partial_gate в build-inside.sh"
sed -n "${a},$((b - 1))p" "$SRC" > "$T/gate.sh"
grep -q '^partial_gate$' "$SRC" || fail "partial_gate не вызывается в build-inside.sh"
awk '/^step verify do_verify$/ { v = NR } /^partial_gate$/ { g = NR } /^say "уборка"$/ { u = NR } END { exit !(v && g && u && v < g && g < u) }' "$SRC" || fail "partial_gate не между verify и уборкой"
ok "partial_gate вызывается после verify и до уборки"

cat > "$T/drv.sh" <<'EOD'
set -euo pipefail
say() { printf '==> %s\n' "$*"; }
ST=$(mktemp -d -p "$TD")
. "$TD/gate.sh"
STRICT=${STRICT_MODE}
[ "${MARK:-0}" = 1 ] && touch "$ST/lazyvim.partial" "$ST/cloudos-extra.partial"
partial_gate
echo PASSED
EOD
run() { TD=$T STRICT_MODE=$1 MARK=$2 bash "$T/drv.sh" 2>&1; }
run 1 0 | grep -q PASSED || fail "чистая сборка остановлена при strict"
run 0 1 | grep -q PASSED || fail "strict=0 остановил сборку с partial"
if run 1 1 | grep -q PASSED; then fail "strict=1 пропустил partial"; fi
OUT=$(run 1 1 || true)
printf '%s\n' "$OUT" | grep -q 'неполные шаги: cloudos-extra lazyvim' || fail "нет списка неполных шагов"
ok "strict=1 останавливает на partial, strict=0 пропускает, чистая сборка проходит"

echo "все тесты пройдены"
