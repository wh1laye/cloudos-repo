#!/bin/bash
set -u

VERSION=${1:-2.4}
STRICT=${2:-0}

say() { printf '==> %s\n' "$*"; }

F=/var/tmp/s3files
ST=/var/tmp/s3stamp
SRC=/var/tmp/s3src
PKG=/var/tmp/cloudpkg-src
L=/var/tmp/s3log
REPORT=/var/tmp/cloudos-report.txt

mkdir -p "$ST" "$L"
rm -f "$REPORT"

step() {
  local name=$1; shift
  if [ -e "$ST/$name" ]; then
    say "step $name: done, skipping"
    return 0
  fi
  say "step $name"
  if "$@" > "$L/$name.log" 2>&1; then
    touch "$ST/$name"
  else
    tail -40 "$L/$name.log" >&2
    echo "step $name failed, log: /var/tmp/s3log/$name.log" >> "$REPORT"
    return 1
  fi
}

setup_cloudpkg() {
  install -d /etc/cloudpkg /var/db/cloudpkg/installed /var/db/repos \
    /var/cache/cloudpkg/distfiles /var/tmp/cloudpkg-build
  cat > /etc/cloudpkg/cloudpkg.conf <<CONF
repo=/var/db/repos/cloudpkg-recipes
recipes_url=https://codeload.github.com/wh1laye/cloudpkg-recipes/tar.gz/refs/heads/master
distdir=/var/cache/cloudpkg/distfiles
workdir=/var/tmp/cloudpkg-build
jobs=$(nproc)
snapshots=0
keep_workdir=no
allow_host=yes
CONF
  make -C "$PKG" clean >/dev/null
  make -C "$PKG" -j"$(nproc)"
  install -m755 "$PKG/cloudpkg" /usr/bin/cloudpkg
  "$PKG/cloudpkg" version
}

fetch_recipes() {
  cloudpkg sync
}

install_set() {
  local ok=0 fail=0 line
  while read -r line; do
    case $line in ''|\#*) continue ;; esac
    say "install: $line"
    if cloudpkg install --force "$line" > "$L/$(printf '%s' "$line" | tr / -).log" 2>&1; then
      ok=$((ok+1))
    else
      fail=$((fail+1))
      echo "$line" >> "$REPORT"
      tail -20 "$L/$(printf '%s' "$line" | tr / -).log" >&2 || true
    fi
  done < "$F/cloudos-packages.list"
  say "packages: installed $ok, failed $fail"
  [ "$fail" = 0 ]
}

layout() {
  install -d /usr/share/cloudos
  [ -f "$F/logo.txt" ] && install -m644 "$F/logo.txt" /usr/share/cloudos/logo.txt
  [ -f "$F/logo.ansi" ] && install -m644 "$F/logo.ansi" /usr/share/cloudos/logo.ansi
  [ -f "$F/logo.png" ] && install -m644 "$F/logo.png" /usr/share/cloudos/logo.png
  for f in cloudos-users cloudos-adduser cloudos-fix cloudos-firewall cloudos-audit; do
    [ -f "$F/$f" ] && install -m755 "$F/$f" /usr/sbin/$f
  done
  [ -f "$F/cloudos-audit" ] || true
  printf 'cloudos\n' > /etc/hostname
  grep -q '^ID=cloudos' /etc/os-release
}

clean() {
  rm -rf /var/cache/cloudpkg/distfiles/* /var/tmp/cloudpkg-build/* \
    /var/tmp/s3src /var/tmp/cloudpkg-src /root/.cache /tmp/* /etc/resolv.conf
}

step cloudpkg-setup setup_cloudpkg || exit 1
step cloudpkg-recipes fetch_recipes || exit 1
step cloudos-package-set install_set || exit 1
step cloudos-layout layout || exit 1
clean

if [ -s "$REPORT" ]; then
  say "report: $REPORT"
  cat "$REPORT" >&2
  if [ "$STRICT" = 1 ]; then
    die() { printf 'error: %s\n' "$*" >&2; exit 1; }
    die "STRICT=1: package set is incomplete"
  fi
fi
say "stage3 inside build finished"
