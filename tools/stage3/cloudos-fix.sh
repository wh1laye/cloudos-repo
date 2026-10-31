#!/bin/bash
set -eu
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
REPO=${CLOUDPKG_REPO:-wh1laye/cloudos-repo}
BRANCH=${CLOUDPKG_BRANCH:-main}
PD=${CLOUDOS_PORTAGE:-/etc/portage}
FILES_ONLY=0
for a in "$@"; do
  case $a in
    --files) FILES_ONLY=1 ;;
    *) echo "использование: cloudos-fix [--files]" >&2; exit 1 ;;
  esac
done
say() { printf '==> %s\n' "$*"; }
[ "$FILES_ONLY" = 1 ] || [ "$(id -u)" = 0 ] || { echo "нужен root" >&2; exit 1; }

purge_env() {
  local f n=0
  for f in "$PD/env/cloudos-noreconf" "$PD"/env/*/*; do
    [ -f "$f" ] || continue
    case $f in *.bak) continue ;; esac
    if [ "${f##*/}" = cloudos-noreconf ] || grep -qF 'eautoreconf() { :; }' "$f" 2>/dev/null; then
      mv "$f" "$f.bak"
      echo "   $f -> $f.bak"
      n=$((n + 1))
    fi
  done
  say "убрано хуков: $n"
}

purge_penv() {
  local f n=0
  for f in "$PD/package.env" "$PD"/package.env/*; do
    [ -f "$f" ] || continue
    if grep -qF cloudos-noreconf "$f"; then
      sed -i '/cloudos-noreconf/d' "$f"
      echo "   почистил $f"
      n=$((n + 1))
    fi
  done
  say "почищено файлов package.env: $n"
}

purge_env
purge_penv
[ "$FILES_ONLY" = 0 ] || exit 0

say "обновляю cloudpkg"
curl -fsSL --retry 3 --connect-timeout 20 "https://raw.githubusercontent.com/$REPO/$BRANCH/cloudpkg/cloudpkg-setup.sh" | bash -s -- --no-sync
say "записываю autotools в базу установленных"
cloudpkg vdb
say "обновляю дерево рецептов"
cloudpkg sync
cloudpkg doctor || true
