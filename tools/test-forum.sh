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
RL=$HERE/forum-ratelimit.sql
for t in posts threads dms reactions reports profile_comments likes helpful board_subs dm_pins; do
  grep -q "create trigger zz_rl_$t before insert on public.$t " "$RL" || die "нет лимита частоты для $t"
  grep -q "zz_rl_" "$HERE/forum-audit.sql" || die "аудит не проверяет лимиты"
done
pass "лимиты частоты: триггеры на всех таблицах записи"
grep -q "security definer set search_path = public, pg_temp" "$RL" && grep -q "revoke all on function public.rl_guard()" "$RL" || die "rl_guard без search_path или с открытым execute"
grep -q "alter table public.rl_log enable row level security" "$RL" && grep -q "revoke all on public.rl_log from anon, authenticated, public" "$RL" || die "rl_log не закрыта"
pass "rl_guard и rl_log закрыты"
grep -q "p.proname like 'admin" "$HERE/forum-audit.sql" || die "аудит не проверяет admin-функции"
pass "аудит проверяет admin-функции"
LK=$HERE/forum-lockdown.sql
grep -q "revoke all on all tables in schema public from anon" "$LK" || die "в lockdown нет закрытия прав anon"
grep -E "^grant .* to anon;" "$LK" | grep -qiE "insert|update|delete|truncate" && die "lockdown выдаёт anon запись"
grep -q "grant select on" "$LK" || die "lockdown не оставляет anon чтение"
pass "lockdown: anon только читает"
echo "всё прошло: $n проверок"
