#!/bin/bash
set -eu

ARCHIVE=${1:-}
[ -n "$ARCHIVE" ] || { printf 'usage: %s cloudos-stage3-amd64-VERSION.tar.xz\n' "$0" >&2; exit 1; }
[ -f "$ARCHIVE" ] || { printf 'no such file: %s\n' "$ARCHIVE" >&2; exit 1; }

LIST=$(mktemp); trap 'rm -f "$LIST"' EXIT
tar -tf "$ARCHIVE" > "$LIST"
fail=0

need() {
  if grep -qxE "(\./)?(usr/)?$1" "$LIST"; then
    printf 'ok       %s\n' "$1"
  else
    printf 'MISSING  %s\n' "$1"; fail=1
  fi
}
forbid() {
  if grep -qxE "(\./)?$1" "$LIST"; then
    printf 'FORBIDDEN %s\n' "$1"; fail=1
  else
    printf 'clean    %s\n' "$1"
  fi
}

need usr/bin/cloudpkg
need etc/cloudpkg/cloudpkg.conf
need etc/os-release
need sbin/openrc-init
need etc/doas.conf
forbid usr/bin/emerge
forbid usr/bin/emaint
forbid etc/portage/make.conf
forbid etc/portage/make.profile
forbid var/db/repos/gentoo

if grep -qE '^(\./)?var/db/cloudpkg/' "$LIST"; then
  printf 'ok       cloudpkg database directory\n'
else
  printf 'note     cloudpkg database is empty, packages were built manually\n'
fi

if [ "$fail" = 0 ]; then
  printf 'stage3 gate: PASS\n'
else
  printf 'stage3 gate: FAIL\n'
fi
exit "$fail"
