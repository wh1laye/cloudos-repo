#!/bin/bash
set -euo pipefail

HERE=$(cd "$(dirname "$0")" && pwd)
REPO=$(dirname "$HERE")
SRC_HOME="$HERE/kernel"
T=$(mktemp -d)
GNUPGHOME=$(mktemp -d)
WORK="$T/w"
OUT="$T/o"
CLOUDK_VER=${CLOUDK_VER:-0.5}
export T SRC_HOME REPO GNUPGHOME WORK OUT CLOUDK_VER
mkdir -p "$WORK" "$OUT"
trap 'rm -rf "$T" "$GNUPGHOME"' EXIT

fail() { printf 'fail: %s\n' "$*" >&2; exit 1; }
ok() { printf 'ok: %s\n' "$*"; }
say() { printf '==> %s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }
fetch() { curl -fL --retry 3 --retry-delay 5 --connect-timeout 20 -sS -o "$2" "$1"; }
export -f say die fetch

for c in python3 curl gpg tar patch find; do
  command -v "$c" >/dev/null || fail "нужен $c"
done
[ -f "$SRC_HOME/cloudk-source.sh" ] || fail "нет $SRC_HOME/cloudk-source.sh"
[ -f "$SRC_HOME/cachyos.pubkey.asc" ] || fail "нет $SRC_HOME/cachyos.pubkey.asc"

api() { curl -fsSL --retry 3 --retry-delay 5 --connect-timeout 20 -H 'Accept: application/vnd.github+json' "$1" 2>/dev/null || true; }
pick() { python3 -c 'import json,sys
raw=sys.stdin.read()
try:
    d=json.loads(raw)
except Exception:
    d=None
if isinstance(d,list):
    d=d[0] if d else {}
if not isinstance(d,dict):
    d={}
print(d.get("tag_name") or d.get("name") or "")'; }

TAG=${CACHY_TAG:-}
[ -n "$TAG" ] || TAG=$(api "https://api.github.com/repos/CachyOS/linux/releases/latest" | pick)
[ -n "$TAG" ] || TAG=$(api "https://api.github.com/repos/CachyOS/linux/releases?per_page=1" | pick)
[ -n "$TAG" ] || TAG=$(api "https://api.github.com/repos/CachyOS/linux/tags?per_page=1" | pick)
[ -n "$TAG" ] || TAG=$(cat "$SRC_HOME/cachyos-tag.txt" 2>/dev/null || true)
[ -n "$TAG" ] || fail "не получен тег cachyos, задай CACHY_TAG вручную"
export TAG
say "тег cachyos: $TAG"

TAR="$TAG.tar.gz"
export TAR
mkdir -p "$T/dl" "$T/src" "$T/check-src"
BASE="https://github.com/CachyOS/linux/releases/download/$TAG"
fetch "$BASE/$TAR" "$T/dl/$TAR" || fail "не скачался $TAR"
fetch "$BASE/$TAR.asc" "$T/dl/$TAR.asc" || fail "не скачалась подпись $TAR.asc"

gpg --batch --quiet --import "$SRC_HOME/cachyos.pubkey.asc" >/dev/null 2>&1 || fail "ключ cachyos не импортируется"
gpg --batch --verify "$T/dl/$TAR.asc" "$T/dl/$TAR" >/dev/null 2>&1 || fail "gpg подпись исходника не совпала"
ok "скачан и проверён исходник cachyos"

tar xf "$T/dl/$TAR" -C "$T/src" --strip-components=1
[ -f "$T/src/Makefile" ] && [ -d "$T/src/kernel" ] || fail "архив не похож на дерево ядра"
ok "архив содержит дерево исходников ядра"

cp -a "$T/src/." "$T/check-src/"
(
  cd "$T/check-src"
  say() { printf '==> %s\n' "$*"; }
  die() { printf 'error: %s\n' "$*" >&2; exit 1; }
  fetch() { curl -fL --retry 3 --retry-delay 5 --connect-timeout 20 -sS -o "$2" "$1"; }
  . "$SRC_HOME/cloudk-source.sh"
  cloudk_source
) || fail "cloudk_source не отработал на исходнике cachyos"
ok "cloudk_source применяет наши правки"

printf 'fake sig\n' > "$T/dl/bad.asc"
if gpg --batch --verify "$T/dl/bad.asc" "$T/dl/$TAR" >/dev/null 2>&1; then
  fail "gpg принял поддельную подпись"
fi
ok "gpg отвергает поддельную подпись"

echo "все тесты пройдены"
