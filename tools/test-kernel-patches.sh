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
PORT=18751
P=$T/srv/p/$REF/6.18/sched
mkdir -p "$P" "$T/srv/api" "$T/a" "$T/b" "$T/tree" "$T/h"
printf '%s' "$REF" > "$T/srv/api/sha"
printf '[\n  {\n    "sha": "%s",\n    "commit": {\n      "tree": {\n        "sha": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"\n      }\n    }\n  }\n]\n' "$REF" > "$T/srv/api/commits"
printf 'line1\nline2\n' > "$T/a/f.txt"
printf 'line1\nline2\nline3\n' > "$T/b/f.txt"
cp "$T/a/f.txt" "$T/tree/f.txt"
( cd "$T" && diff -u a/f.txt b/f.txt > "$P/0001-bore-cachy.patch" ) || true
[ -s "$P/0001-bore-cachy.patch" ] || fail "не создался тестовый патч"
python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$T/srv" >/dev/null 2>&1 &
for _ in 1 2 3 4 5 6 7 8 9 10; do curl -fsS -o /dev/null "http://127.0.0.1:$PORT/api/sha" 2>/dev/null && break; sleep 0.5; done

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
  env CP="$CP" HERE="$T/h" WORK="$T/w" OUT="$T/o" KVER=6.18.10 CLOUDK_PIN="$1" CLOUDK_PATCH_UNTIL="${2:-}" CLOUDK_PATCH_LIST="http://127.0.0.1:$PORT/api/commits" \
    CLOUDK_PATCH_URL="http://127.0.0.1:$PORT/p" CLOUDK_PATCH_API="http://127.0.0.1:$PORT/api/sha" \
    CLOUDK_PATCH_PROTO='=http' bash "$T/drv.sh"
}

printf 'ref\n- @KMM@/sched/0001-bore-cachy.patch\n' > "$T/h/patches.lock"
if drive 0 > "$T/out.txt" 2>&1; then fail "сборка пошла без закреплённого коммита"; fi
ok "без закрепления сборка останавливается"

drive 1 > "$T/out.txt" 2>&1 || { cat "$T/out.txt" >&2; fail "закрепление не прошло"; }
SUM=$(sha256sum "$P/0001-bore-cachy.patch" | cut -d' ' -f1)
[ "$(cat "$T/o/patches.lock")" = "$(printf 'ref %s\n%s @KMM@/sched/0001-bore-cachy.patch' "$REF" "$SUM")" ] || fail "patches.lock собран неверно"
grep -q "^ref $REF$" "$T/out.txt" || fail "patches.lock не выведен в лог"
ok "закрепление записывает коммит и sha256 и выводит их в лог"

printf 'ref\n- @KMM@/sched/0001-bore-cachy.patch\n' > "$T/h/patches.lock"
drive 1 2026-02-13 > "$T/out.txt" 2>&1 || { cat "$T/out.txt" >&2; fail "закрепление по дате не прошло"; }
grep -q "^ref $REF$" "$T/o/patches.lock" || fail "коммит по дате выбран неверно"
cp "$T/o/patches.lock" "$T/pinned.lock"
if drive 1 "2026-02-13;rm" > "$T/out.txt" 2>&1; then fail "принята неверная дата"; fi
ok "закрепление по дате берёт первый коммит патча, неверная дата отвергнута"

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
