#!/bin/bash
set -eu
HERE=$(cd "$(dirname "$0")" && pwd)
PUB=${PUB:-$(dirname "$HERE")/docs/cloudos.pub}

[ $# -ge 1 ] || { echo "использование: MINISIGN_KEY=... [MINISIGN_PASSWORD=...] $0 файл..." >&2; exit 1; }
if [ -z "${MINISIGN_KEY:-}" ]; then
  echo "::warning::MINISIGN_KEY не задан, подпись пропущена" >&2
  exit 0
fi
command -v minisign >/dev/null || { echo "нет minisign" >&2; exit 1; }

umask 077
K=$(mktemp)
trap 'rm -f "$K"' EXIT
printf '%s\n' "$MINISIGN_KEY" > "$K"

for f in "$@"; do
  [ -f "$f" ] || { echo "нет файла $f" >&2; exit 1; }
  rm -f "$f.minisig"
  printf '%s\n' "${MINISIGN_PASSWORD:-}" | minisign -S -s "$K" -m "$f" -x "$f.minisig" -t "cloudos $(basename "$f")" >/dev/null
  [ -s "$f.minisig" ] || { echo "подпись $f не создалась" >&2; exit 1; }
  if [ -f "$PUB" ]; then
    minisign -V -p "$PUB" -m "$f" -x "$f.minisig" >/dev/null || { echo "подпись $f не сходится с $PUB" >&2; exit 1; }
    echo "подписано и проверено: $f"
  else
    echo "подписано: $f (нет $PUB, проверка пропущена)"
  fi
done
