#!/bin/bash
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
OUT=${1:-$HERE/forum-schema.sql}
command -v pg_dump >/dev/null || { echo "ошибка: нет pg_dump" >&2; exit 1; }
for v in PGHOST PGUSER PGPASSWORD PGDATABASE; do
  [ -n "${!v:-}" ] || { echo "ошибка: не задана переменная $v" >&2; exit 1; }
done
export PGSSLMODE=${PGSSLMODE:-require}
TMP=$(mktemp "$OUT.XXXXXX")
trap 'rm -f "$TMP"' EXIT
pg_dump --schema-only --no-owner -n public -f "$TMP"
grep -q 'CREATE POLICY' "$TMP" || { echo "ошибка: в дампе нет политик, проверь права пользователя" >&2; exit 1; }
chmod 644 "$TMP"
mv "$TMP" "$OUT"
trap - EXIT
printf 'готово: %s\n' "$OUT"
