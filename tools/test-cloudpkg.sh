#!/bin/bash
set -eu

HERE=$(cd "$(dirname "$0")" && pwd)
SRC=${1:-$(dirname "$HERE")/cloudpkg}
[ -f "$SRC/cloudpkg.c" ] || { printf 'no cloudpkg sources in %s\n' "$SRC" >&2; exit 1; }

T=$(mktemp -d /var/tmp/cloudpkg-test.XXXXXX)
trap 'rm -rf "$T"' EXIT
mkdir -p "$T/db" "$T/tree" "$T/src" "$T/work" "$T/dist"

cat > "$T/cloudpkg.conf" <<CONF
repo=$T/tree
distdir=$T/dist
workdir=$T/work
jobs=2
snapshots=0
CONF

make -C "$SRC" clean >/dev/null
cp "$SRC"/*.c "$SRC"/*.h "$T/"
gcc -O2 -std=gnu17 -Wall -Wextra -Wsign-conversion -Wformat=2 -Wno-format-truncation \
  -fstack-protector-strong -fPIE -D_FORTIFY_SOURCE=3 \
  -DCONF="\"$T/cloudpkg.conf\"" -DDBDIR="\"$T/db\"" -DLOCKFILE="\"$T/lock\"" \
  -pie -Wl,-z,relro,-z,now -o "$T/cloudpkg" \
  "$T"/cloudpkg.c "$T"/util.c "$T"/lock.c "$T"/recipe.c "$T"/db.c "$T"/build.c "$T"/cmds.c "$T"/snap.c "$T"/update.c

mkdir -p "$T/pkg/hello-1.0"
printf '#!/bin/sh\necho configured\n' > "$T/pkg/hello-1.0/configure"
chmod +x "$T/pkg/hello-1.0/configure"
printf 'all:\n\tprintf "#!/bin/sh\\necho hello\\n" > hello\ninstall:\n\tmkdir -p $(DESTDIR)/usr/bin\n\tcp hello $(DESTDIR)/usr/bin/hello\n\tchmod 755 $(DESTDIR)/usr/bin/hello\n' > "$T/pkg/hello-1.0/Makefile"
tar -czf "$T/src/hello-1.0.tar.gz" -C "$T/pkg" hello-1.0

mkdir -p "$T/tree/libs/hellolib/hellolib-1.0" "$T/tree/editors/hello/hello-1.0" "$T/tree/editors/broken/broken-1.0"
cat > "$T/tree/libs/hellolib/hellolib-1.0/hellolib-1.0.cpr" <<CPR
PACKAGE=hellolib
VERSION=1.0
DESCRIPTION="Test library"
LICENSE="MIT"
SRC_URI="$T/src/hello-1.0.tar.gz -> hellolib-1.0.tar.gz"
CPR
cat > "$T/tree/editors/hello/hello-1.0/hello-1.0.cpr" <<CPR
PACKAGE=hello
VERSION=1.0
DESCRIPTION="Test editor"
LICENSE="MIT"
SRC_URI="$T/src/hello-1.0.tar.gz"
DEPEND="libs/hellolib"
RDEPEND="libs/hellolib"
CPR
printf 'PACKAGE=broken\nVERSION=1.0\nRDEPEND="\n' > "$T/tree/editors/broken/broken-1.0/broken-1.0.cpr"

pass=0; fail=0
run() { "$T/cloudpkg" "$@" >"$T/out" 2>&1; echo $?; }
check() {
  local name=$1 want=$2 code=$3 text=$4
  if [ "$code" = "$want" ] && grep -qF "$text" "$T/out"; then
    printf 'PASS  %s\n' "$name"; pass=$((pass+1))
  else
    printf 'FAIL  %s (exit %s, wanted %s, text "%s")\n' "$name" "$code" "$want" "$text"; fail=$((fail+1))
    sed -n '1,12p' "$T/out"
  fi
}

check version 0 "$(run version)" "cloudpkg "
check help 0 "$(run help)" "standalone source package manager"
check search 0 "$(run search hello)" "editors/hello 1.0"
check info 0 "$(run info hello)" "libs/hellolib"
check plan 0 "$(run install -p hello)" "libs/hellolib-1.0 (dependency)"
check plan-target 0 "$(run install -p hello)" "editors/hello-1.0"
check broken 1 "$(run install -p broken)" "unterminated quoted value"
check not-installed 1 "$(run remove -p hello)" "is not installed"
check empty-list 0 "$(run list)" "no packages installed"
check owns 1 "$(run owns /usr/bin/definitely-not-tracked)" "untracked"
check clean-pretend 0 "$(run clean -p)" "would clear distfiles"
check upgrade-pretend 0 "$(run upgrade -p)" "up to date"
check doctor 1 "$(run doctor)" "system id"

printf '\ncloudpkg tests: %d passed, %d failed\n' "$pass" "$fail"
[ "$fail" = 0 ] || exit 1
