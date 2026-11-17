#!/bin/bash
set -eu

REPO=${CLOUDPKG_REPO:-wh1laye/cloudos-repo}
BRANCH=${CLOUDPKG_BRANCH:-main}
HERE="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd)" || HERE="$(pwd)"
SRC="${CLOUDPKG_SRC:-}"
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH

NOSYNC=""
for a in "$@"; do
  case $a in
    --no-sync) NOSYNC=1 ;;
    *) printf 'error: unknown option %s\n' "$a" >&2; exit 1 ;;
  esac
done

TMP=""
cleanup() { [ -n "$TMP" ] && rm -rf "$TMP"; return 0; }
trap cleanup EXIT
say() { printf '==> %s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }

[ "$(id -u)" = 0 ] || die "root is required"

if [ -r /etc/os-release ] && ! grep -q '^ID=.\?cloudos' /etc/os-release && [ -z "${CLOUDPKG_FORCE:-}" ]; then
  die "this is not CloudOS; on another distribution use install.sh (isolated box mode), it does not touch your system"
fi

for c in bash curl tar gcc make; do
  command -v "$c" >/dev/null || die "missing command: $c"
done

TMP=$(mktemp -d /var/tmp/cloudpkg-setup.XXXXXX)

if [ -z "$SRC" ]; then
  if [ -f "$HERE/cloudpkg.c" ]; then
    SRC="$HERE"
  else
    say "downloading cloudpkg sources"
    curl -fL --retry 3 --connect-timeout 20 -o "$TMP/repo.tar.gz" "https://codeload.github.com/$REPO/tar.gz/refs/heads/$BRANCH"
    tar xf "$TMP/repo.tar.gz" -C "$TMP"
    SRC=$(echo "$TMP"/*/cloudpkg)
  fi
fi
[ -f "$SRC/cloudpkg.c" ] || die "no $SRC/cloudpkg.c"
say "sources: $SRC"

mkdir -p /var/db/repos /var/db/cloudpkg/installed /var/cache/cloudpkg/distfiles /var/tmp/cloudpkg-build

say "building cloudpkg"
cd "$SRC"
make clean
make
make install
make conf

SYNC_FAIL=""
if [ -z "$NOSYNC" ]; then
  say "cloudpkg sync"
  cloudpkg sync || SYNC_FAIL=1
fi

cloudpkg doctor || true
if [ -z "$SYNC_FAIL" ]; then
  echo CP_OK
else
  echo "cloudpkg is installed, but the recipe tree was not downloaded"
  echo "check the network and run: cloudpkg sync"
  exit 3
fi
