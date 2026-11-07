#!/bin/bash
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
CP=$HERE/kernel/cloudk-patches.sh
T=$(mktemp -d)
trap 'kill $(jobs -p) 2>/dev/null || true; rm -rf "$T"' EXIT
fail() { printf 'тест не пройден: %s\n' "$*" >&2; exit 1; }
ok() { printf 'ok: %s\n' "$*"; }
for c in python3 curl patch sha256sum; do command -v "$c" >/dev/null || fail "нужен $c"; done

REF=0123456789abcdef0123456789abcdef01234567
BAD=89abcdef0123456789abcdef0123456789abcdef
PORT=18751
mkdir -p "$T/srv/p/$REF/6.18/sched" "$T/srv/p/$BAD/6.18/sched" "$T/srv/api" "$T/a" "$T/b" "$T/c" "$T/tree" "$T/kt" "$T/h"
printf 'line1\nline2\n' > "$T/a/f.txt"
printf 'line1\nline2\nline3\n' > "$T/b/f.txt"
printf 'xx\nyy\n' > "$T/c/f.txt"
printf 'xx\nyy\nzz\n' > "$T/c/g.txt"
cp "$T/a/f.txt" "$T/tree/f.txt"
cp "$T/a/f.txt" "$T/kt/f.txt"
GOOD=$T/srv/p/$REF/6.18/sched/0001-bore-cachy.patch
( cd "$T" && diff -u a/f.txt b/f.txt > "$GOOD" ) || true
( cd "$T" && mkdir -p d && printf 'q\nw\n' > d/f.txt && diff -u a/f.txt d/f.txt > "$T/srv/p/$BAD/6.18/sched/0001-bore-cachy.patch" ) || true
printf 'q\nw\ne\n' > "$T/e.txt"
cat > "$T/bad.py" <<'EOP'
import sys
open(sys.argv[1], "w").write("--- a/f.txt\n+++ b/f.txt\n@@ -1,4 +1,5 @@\n n1\n n2\n n3\n-n4\n+n5\n+n6\n")
EOP
python3 "$T/bad.py" "$T/srv/p/$BAD/6.18/sched/0001-bore-cachy.patch"
[ -s "$GOOD" ] || fail "не создался тестовый патч"
mk() {
  printf '[\n'
  local first=1 r
  for r in "$@"; do
    [ "$first" = 1 ] || printf ',\n'
    first=0
    printf '  {\n    "sha": "%s",\n    "commit": {\n      "tree": {\n        "sha": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"\n      }\n    }\n  }' "$r"
  done
  printf '\n]\n'
}
mk "$BAD" "$REF" > "$T/srv/api/commits"
python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$T/srv" >/dev/null 2>&1 &
for _ in 1 2 3 4 5 6 7 8 9 10; do curl -fsS -o /dev/null "http://127.0.0.1:$PORT/api/commits" 2>/dev/null && break; sleep 0.5; done

cat > "$T/drv.sh" <<'EOD'
set -euo pipefail
say() { printf '==> %s\n' "$*"; }
die() { printf '::error::%s\n' "$*" >&2; exit 1; }
. "$CP"
cloudk_fetch_patches
printf '%s\n' "$CLOUDK_PATCHES"
EOD

drive() {
  rm -rf "$T/w" "$T/o"
  ( cd "$T/kt" && env CP="$CP" HERE="$T/h" WORK="$T/w" OUT="$T/o" KVER=6.18.10 CLOUDK_PIN="$1" CLOUDK_PATCH_UNTIL="${2:-}" \
    CLOUDK_PATCH_LIST="http://127.0.0.1:$PORT/api/commits" CLOUDK_PATCH_URL="http://127.0.0.1:$PORT/p" \
    CLOUDK_PATCH_PROTO='=http' bash "$T/drv.sh" )
}

printf 'ref\n- @KMM@/sched/0001-bore-cachy.patch\n' > "$T/h/patches.lock"
if drive 0 > "$T/out.txt" 2>&1; then fail "сборка пошла без закреплённого коммита"; fi
ok "без закрепления сборка останавливается"

drive 1 > "$T/out.txt" 2>&1 || { cat "$T/out.txt" >&2; fail "закрепление не прошло"; }
SUM=$(sha256sum "$GOOD" | cut -d' ' -f1)
[ "$(cat "$T/o/patches.lock")" = "$(printf 'ref %s\n%s @KMM@/sched/0001-bore-cachy.patch' "$REF" "$SUM")" ] || fail "patches.lock собран неверно"
grep -q "^ref $REF$" "$T/out.txt" || fail "patches.lock не выведен в лог"
cp "$T/o/patches.lock" "$T/pinned.lock"
ok "закрепление пропускает не ложащийся коммит и берёт тот, что ложится на ядро"

if drive 1 "2026-02-13;rm" > "$T/out.txt" 2>&1; then fail "принята неверная дата"; fi
drive 1 2026-02-13 > "$T/out.txt" 2>&1 || { cat "$T/out.txt" >&2; fail "закрепление с датой не прошло"; }
ok "дата ограничивает поиск, неверная дата отвергнута"

mk "$BAD" > "$T/srv/api/commits"
if drive 1 > "$T/out.txt" 2>&1; then fail "закрепили коммит, который не ложится"; fi
grep -q 'ни один' "$T/out.txt" || fail "нет сообщения, что подходящего коммита нет"
mk "$BAD" "$REF" > "$T/srv/api/commits"
ok "если ни один коммит не ложится, сборка останавливается"

cp "$T/pinned.lock" "$T/h/patches.lock"
FILES=$(drive 0 2>"$T/err.txt" | tail -n 1) || { cat "$T/err.txt" >&2; fail "строгая сборка не прошла"; }
patch -p1 --dry-run -s -d "$T/tree" < $FILES || fail "скачанный патч не накладывается"
patch -p1 -s -d "$T/tree" < $FILES
[ "$(tail -n 1 "$T/tree/f.txt")" = line3 ] || fail "патч не изменил файл"
ok "строгая сборка: патч скачан, проверен и наложен"

sed -i "s/^$(printf '%s' "$SUM" | cut -c1)/$([ "$(printf '%s' "$SUM" | cut -c1)" = 0 ] && echo 1 || echo 0)/" "$T/h/patches.lock"
if drive 0 > "$T/out.txt" 2>&1; then fail "принят патч с чужим sha256"; fi
ok "неверный sha256 патча останавливает сборку"

printf 'ref %s\n%s ../x.patch\n' "$REF" "$SUM" > "$T/h/patches.lock"
if drive 0 > "$T/out.txt" 2>&1; then fail "принят путь с .."; fi
grep -q 'неверный путь' "$T/out.txt" || fail "нет сообщения о неверном пути"
ok "путь с .. отвергнут"

echo "все тесты пройдены"
