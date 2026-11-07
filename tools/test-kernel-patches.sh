#!/bin/bash
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
CP=$HERE/kernel/cloudk-patches.sh
T=$(mktemp -d)
trap 'kill $(jobs -p) 2>/dev/null || true; rm -rf "$T"' EXIT
fail() { printf 'тест не пройден: %s\n' "$*" >&2; exit 1; }
ok() { printf 'ok: %s\n' "$*"; }
for c in python3 curl patch sha256sum seq; do command -v "$c" >/dev/null || fail "нужен $c"; done

REF=0123456789abcdef0123456789abcdef01234567
BAD=89abcdef0123456789abcdef0123456789abcdef
PORT=18751
for r in "$REF" "$BAD"; do mkdir -p "$T/srv/p/$r/6.18/all" "$T/srv/p/$r/6.18/sched"; done
mkdir -p "$T/srv/api" "$T/a" "$T/m" "$T/z" "$T/tree" "$T/kt" "$T/h"
printf 'line1\nline2\nline3\nline4\nline5\n' > "$T/a/f.txt"
printf 'line1\nline2b\nline3\nline4\nline5\n' > "$T/m/f.txt"
printf 'line1\nline2c\nline3\nline4\nline5\n' > "$T/z/f.txt"
cp "$T/a/f.txt" "$T/tree/f.txt"
cp "$T/a/f.txt" "$T/kt/f.txt"
BASE=$T/srv/p/$REF/6.18/all/0001-cachyos-base-all.patch
BORE=$T/srv/p/$REF/6.18/sched/0001-bore-cachy.patch
( cd "$T" && diff -u a/f.txt m/f.txt > "$BASE" ) || true
( cd "$T" && diff -u m/f.txt z/f.txt | sed 's#^--- m/#--- a/#;s#^+++ z/#+++ b/#' > "$BORE" ) || true
sed -i 's#^--- a/f.txt#--- a/f.txt#;s#^+++ b/f.txt#+++ b/f.txt#' "$BASE"
sed -i 's#^--- a/f.txt\t.*#--- a/f.txt#;s#^+++ b/f.txt\t.*#+++ b/f.txt#' "$BORE"
cp "$BASE" "$T/srv/p/$BAD/6.18/all/0001-cachyos-base-all.patch"
cat > "$T/bad.py" <<'EOP'
import sys
open(sys.argv[1], "w").write("--- a/f.txt\n+++ b/f.txt\n@@ -1,4 +1,5 @@\n n1\n n2\n n3\n-n4\n+n5\n+n6\n")
EOP
python3 "$T/bad.py" "$T/srv/p/$BAD/6.18/sched/0001-bore-cachy.patch"
[ -s "$BASE" ] && [ -s "$BORE" ] || fail "не созданы тестовые патчи"
if patch -p1 --dry-run -s -d "$T/tree" < "$BORE" >/dev/null 2>&1; then fail "bore не должен ложиться на чистое дерево"; fi

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

LOCK='ref\n- @KMM@/all/0001-cachyos-base-all.patch\n- @KMM@/sched/0001-bore-cachy.patch\n'
printf "$LOCK" > "$T/h/patches.lock"
if drive 0 > "$T/out.txt" 2>&1; then fail "сборка пошла без закреплённого коммита"; fi
ok "без закрепления сборка останавливается"

drive 1 > "$T/out.txt" 2>&1 || { cat "$T/out.txt" >&2; fail "закрепление не прошло"; }
SB=$(sha256sum "$BASE" | cut -d' ' -f1)
SO=$(sha256sum "$BORE" | cut -d' ' -f1)
[ "$(cat "$T/o/patches.lock")" = "$(printf 'ref %s\n%s @KMM@/all/0001-cachyos-base-all.patch\n%s @KMM@/sched/0001-bore-cachy.patch' "$REF" "$SB" "$SO")" ] || { cat "$T/out.txt" >&2; fail "patches.lock собран неверно"; }
grep -q "^ref $REF$" "$T/out.txt" || fail "patches.lock не выведен в лог"
cp "$T/o/patches.lock" "$T/pinned.lock"
ok "закрепление проверяет патчи подряд, пропускает неподходящий коммит и берёт подходящий"

if drive 1 "2026-02-13;rm" > "$T/out.txt" 2>&1; then fail "принята неверная дата"; fi
drive 1 2026-02-13 > "$T/out.txt" 2>&1 || { cat "$T/out.txt" >&2; fail "закрепление с датой не прошло"; }
ok "дата ограничивает поиск, неверная дата отвергнута"

mk "$BAD" > "$T/srv/api/commits"
if drive 1 > "$T/out.txt" 2>&1; then fail "закрепили коммит, который не ложится"; fi
grep -q 'ни один' "$T/out.txt" || fail "нет сообщения, что подходящего коммита нет"
mk "$BAD" "$REF" > "$T/srv/api/commits"
ok "если ни один коммит не подходит, сборка останавливается"

cp "$T/pinned.lock" "$T/h/patches.lock"
FILES=$(drive 0 2>"$T/err.txt" | tail -n 1) || { cat "$T/err.txt" >&2; fail "строгая сборка не прошла"; }
for p in $FILES; do
  patch -p1 --dry-run -s -d "$T/tree" < "$p" || fail "скачанный патч не накладывается"
  patch -p1 -s -d "$T/tree" < "$p"
done
grep -qx line2c "$T/tree/f.txt" || fail "патчи не изменили файл"
ok "строгая сборка: оба патча скачаны, проверены и наложены по порядку"

sed -i '2s/^./g/' "$T/h/patches.lock"
if drive 0 > "$T/out.txt" 2>&1; then fail "принят патч с чужим sha256"; fi
ok "неверный sha256 патча останавливает сборку"

printf 'ref %s\n%s ../x.patch\n' "$REF" "$SB" > "$T/h/patches.lock"
if drive 0 > "$T/out.txt" 2>&1; then fail "принят путь с .."; fi
grep -q 'неверный путь' "$T/out.txt" || fail "нет сообщения о неверном пути"
ok "путь с .. отвергнут"

echo "все тесты пройдены"
