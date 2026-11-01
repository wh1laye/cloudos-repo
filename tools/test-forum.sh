#!/bin/bash
set -eu
HERE=$(cd "$(dirname "$0")" && pwd)
F=$(dirname "$HERE")/docs/forum
die() { printf 'ошибка: %s\n' "$*" >&2; exit 1; }
n=0
pass() { n=$((n + 1)); printf 'ok: %s\n' "$*"; }
H=$F/index.html
grep -q 'http-equiv="Content-Security-Policy"' "$H" || die "нет csp в index.html"
pass "csp есть"
grep -o 'script-src[^;]*' "$H" | grep -qE "unsafe-inline|unsafe-eval" && die "в script-src разрешён unsafe-inline или unsafe-eval"
pass "script-src без unsafe"
grep -q "object-src 'none'" "$H" && grep -q "base-uri 'none'" "$H" || die "в csp нет object-src и base-uri none"
pass "object-src и base-uri закрыты"
awk 'BEGIN{b=0} /<script>/{b=1} END{exit b}' "$H" || die "в index.html остался inline-скрипт"
pass "нет inline-скриптов"
grep -qiE ' on[a-z]+="' "$H" && die "в index.html есть inline-обработчики"
pass "нет inline-обработчиков"
for f in "$F"/*.js; do node --check "$f" 2>/dev/null || die "$f не проходит node --check"; done
pass "js проходит проверку синтаксиса"
grep -q "(https?:" "$F/app.js" || die "ссылки в сообщениях не ограничены http и https"
pass "ссылки только http и https"
grep -q 'zz_dm_block_guard' "$HERE/forum-dm-block.sql" && grep -q "dm_blocks" "$F/app.js" || die "блокировка в сообщениях не связана с sql"
pass "блокировка: клиент и sql на месте"
echo "всё прошло: $n проверок"
