#!/bin/bash
set -euo pipefail

BASE=${1:-}
VERSION=${2:-}
OUT=${OUT:-$PWD/out}
[ -f "$BASE" ] && [ -n "$VERSION" ] || { echo "использование: $0 cloudos-stage3-amd64-<версия>.tar.xz <версия>" >&2; exit 1; }
case "$VERSION" in ''|*[!0-9A-Za-z._-]*) echo "неверная версия" >&2; exit 1 ;; esac
for c in xz tar sha256sum; do command -v "$c" >/dev/null || { echo "нет команды $c" >&2; exit 1; }; done

T=$(mktemp -d)
trap 'rm -rf "$T"' EXIT
N=cloudos-fetch-$VERSION
mkdir -p "$T/$N" "$OUT"

xz -dc "$BASE" | tar -xpf - -C "$T/$N" --wildcards \
  '*usr/bin/neofetch' \
  '*usr/share/cloudos/logo.txt' '*usr/share/cloudos/logo.ansi' '*usr/share/cloudos/logo.png' \
  '*usr/share/cloudos/fastfetch-truecolor.jsonc' '*usr/share/cloudos/fastfetch-image.jsonc' \
  '*etc/xdg/fastfetch/config.jsonc' '*etc/os-release' 2>/dev/null || true

( cd "$T/$N" && find . -type f -o -type l | sort | sed 's|^\./||' ) > "$T/list"
for f in usr/bin/neofetch usr/share/cloudos/logo.txt usr/share/cloudos/logo.ansi usr/share/cloudos/logo.png etc/xdg/fastfetch/config.jsonc etc/os-release; do
  grep -qxF "$f" "$T/list" || { echo "в stage 3 нет $f" >&2; exit 1; }
done

rm -f "$OUT/$N.tar.gz" "$OUT/$N.tar.gz.sha256"
tar --sort=name --owner=0 --group=0 --numeric-owner --mtime='2000-01-01 00:00:00' -C "$T" -cf - "$N" | gzip -9n > "$OUT/$N.tar.gz"
( cd "$OUT" && sha256sum "$N.tar.gz" > "$N.tar.gz.sha256" )
tar -tzf "$OUT/$N.tar.gz"
echo "готово: $OUT/$N.tar.gz"
