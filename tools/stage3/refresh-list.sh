#!/bin/bash
# собирает gentoo-stage3.list из настоящего stage 3 gentoo (amd64 openrc): читает список
# установленных пакетов (var/db/pkg) прямо из архива, убирает версии и то, что в gentoo-exclude.txt.
# нужна сеть, скачивается около 250 мб (в файл не сохраняется). запуск:
#   tools/stage3/refresh-list.sh [файл-результат]
set -eu
HERE=$(cd "$(dirname "$0")" && pwd)
MIRROR=${GENTOO_MIRROR:-https://distfiles.gentoo.org}
OUT=${1:-$HERE/gentoo-stage3.list}
BASE=$MIRROR/releases/amd64/autobuilds
TMP=$(mktemp)
trap 'rm -f "$TMP" "$TMP.raw"' EXIT

path=$(curl -fsSL --retry 3 --connect-timeout 20 "$BASE/latest-stage3-amd64-openrc.txt" \
  | grep -oE '^[0-9]{8}T[0-9]{6}Z/stage3-amd64-openrc-[0-9]{8}T[0-9]{6}Z\.tar\.xz' | head -1) || true
[ -n "$path" ] || { echo "ошибка: не нашёл последний stage 3 gentoo на $MIRROR" >&2; exit 1; }
echo "==> $path" >&2

curl -fL --retry 3 --connect-timeout 20 -sS "$BASE/$path" | xz -dc | tar -t \
  | sed -n 's#^\(\./\)\{0,1\}var/db/pkg/\([^/]*\)/\([^/][^/]*\)/\{0,1\}$#\2/\3#p' > "$TMP.raw" \
  || { echo "ошибка: не удалось прочитать архив" >&2; exit 1; }
[ -s "$TMP.raw" ] || { echo "ошибка: в архиве нет var/db/pkg" >&2; exit 1; }

excluded() {
  local p
  while read -r p _; do
    case $p in ''|'#'*) continue ;; esac
    case $1 in $p) return 0 ;; esac
  done < "$HERE/gentoo-exclude.txt"
  return 1
}

{
  echo "# список пакетов из $path"
  echo "# получен $(date -u +%F) через refresh-list.sh, без исключений из gentoo-exclude.txt"
  sed -E 's/-[0-9]+(\.[0-9]+)*[a-z]?(_(alpha|beta|pre|rc|p)[0-9]*)*(-r[0-9]+)?$//' "$TMP.raw" | sort -u \
  | while read -r a; do excluded "$a" || echo "$a"; done
} > "$TMP"

mv "$TMP" "$OUT"
echo "==> готово: $OUT ($(grep -vc '^#' "$OUT") пакетов)" >&2
