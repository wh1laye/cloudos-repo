#!/bin/bash
set -eu -o pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
MIRROR=${GENTOO_MIRROR:-https://distfiles.gentoo.org}
OUT=${1:-$HERE/gentoo-stage3.list}
BASE=$MIRROR/releases/amd64/autobuilds
WK=13EBBDBEDE7A12775DFDB1BABB572E0E2D182910
GK=${GENTOO_KEYS:-/usr/share/openpgp-keys/gentoo-release.asc}
KS=${GENTOO_KEYSERVER:-hkps://keys.gentoo.org}
TMP=$(mktemp)
GH=$(mktemp -d)
trap 'gpgconf --homedir "$GH" --kill all 2>/dev/null; rm -rf "$GH" "$TMP" "$TMP.raw"' EXIT
command -v gpg >/dev/null || { echo "ошибка: нужен gpg, подпись stage 3 gentoo не проверить" >&2; exit 1; }

gverify() {
  rm -f "$GH/status"
  gpg --homedir "$GH" --batch --no-tty -q --status-file "$GH/status" --verify "$2" "$1" 2>/dev/null || return 1
  ! grep -qE '^\[GNUPG:\] (BADSIG|ERRSIG|EXPKEYSIG|REVKEYSIG|EXPSIG) ' "$GH/status" || return 1
  grep '^\[GNUPG:\] VALIDSIG ' "$GH/status" | awk '{print $NF}' | grep -qix "$WK"
}

path=$(curl -fsSL --retry 3 --connect-timeout 20 "$BASE/latest-stage3-amd64-openrc.txt" \
  | grep -oE '^[0-9]{8}T[0-9]{6}Z/stage3-amd64-openrc-[0-9]{8}T[0-9]{6}Z\.tar\.xz' | head -1) || true
[ -n "$path" ] || { echo "ошибка: не нашёл последний stage 3 gentoo на $MIRROR" >&2; exit 1; }
echo "==> $path" >&2

curl -fL --retry 3 --connect-timeout 20 -sS -o "$GH/stage3.tar.xz" "$BASE/$path" \
  && curl -fL --retry 3 --connect-timeout 20 -sS -o "$GH/stage3.tar.xz.asc" "$BASE/$path.asc" \
  || { echo "ошибка: не скачался stage 3 gentoo или его подпись" >&2; exit 1; }
[ -r "$GK" ] && gpg --homedir "$GH" --batch --no-tty -q --import "$GK" 2>/dev/null || true
if ! gverify "$GH/stage3.tar.xz" "$GH/stage3.tar.xz.asc"; then
  gpg --homedir "$GH" --batch --no-tty -q --keyserver "$KS" --recv-keys "$WK" 2>/dev/null || true
  gverify "$GH/stage3.tar.xz" "$GH/stage3.tar.xz.asc" || { echo "ошибка: подпись stage 3 gentoo не подошла (ключ $WK)" >&2; exit 1; }
fi
echo "==> подпись stage 3 gentoo проверена" >&2

xz -dc "$GH/stage3.tar.xz" | tar -t \
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
