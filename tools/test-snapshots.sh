#!/usr/bin/env bash
set -eu
HERE=$(cd "$(dirname "$0")" && pwd)
SRC=$(dirname "$HERE")/cloudpkg
T=$(mktemp -d)
trap 'rm -rf "$T"' EXIT
fail() { echo "ошибка: $*" >&2; exit 1; }
[ "$(id -u)" = 0 ] || fail "нужен root"

mkdir -p "$T/bin" "$T/top"
printf '%s\n' '24 1 0:21 / / rw,noatime shared:1 - btrfs /dev/vda2 rw,subvolid=5' > "$T/mi.btrfs"
printf '%s\n' '24 1 8:2 / / rw,noatime shared:1 - ext4 /dev/vda2 rw' > "$T/mi.ext4"
printf '%s\n' 'snapshots=2' > "$T/conf"

cat > "$T/bin/btrfs" <<'EOS'
#!/bin/sh
echo "btrfs $*" >> "$LOG"
case "$1 $2" in
"subvolume snapshot") for a in "$@"; do last=$a; done; mkdir -p "$last" ;;
"subvolume delete") rm -rf "$3" ;;
"inspect-internal rootid") echo 257 ;;
esac
exit 0
EOS
for c in mount umount; do printf '#!/bin/sh\necho "%s $*" >> "$LOG"\n' "$c" > "$T/bin/$c"; done
chmod +x "$T/bin/"*

build() {
	gcc -O1 -Wall -Wextra -Werror -DMOUNTINFO="\"$1\"" -DTOPMNT="\"$T/top\"" -DCONF="\"$T/conf\"" -o "$2" "$SRC"/*.c
}
build "$T/mi.btrfs" "$T/cp"
build "$T/mi.ext4" "$T/cp-ext4"

export LOG="$T/log"
export PATH="$T/bin:$PATH"
: > "$LOG"

"$T/cp" snapshot first >/dev/null || fail "snapshot first"
sleep 1
"$T/cp" snapshot >/dev/null || fail "snapshot без метки"
sleep 1
"$T/cp" snapshot third >/dev/null || fail "snapshot third"

D="$T/top/cloudpkg-snapshots"
mkdir -p "$D"
[ "$(find "$D" -mindepth 1 -maxdepth 1 | wc -l)" = 2 ] || fail "после обрезки должно остаться 2 снимка"
grep -q "btrfs subvolume snapshot -r / $D/" "$LOG" || fail "нет команды снимка"
grep -q "btrfs subvolume delete $D/" "$LOG" || fail "старый снимок не удалён"
grep -q "mount -o subvolid=5,noatime /dev/vda2 $T/top" "$LOG" || fail "нет монтирования корня btrfs"

LIST=$("$T/cp" snapshots)
[ "$(printf '%s\n' "$LIST" | wc -l)" = 2 ] || fail "список снимков"
printf '%s\n' "$LIST" | grep -q -- '-third$' || fail "в списке нет последнего снимка"

"$T/cp" rollback -y >/dev/null || fail "rollback"
grep -q "btrfs subvolume set-default 257 $T/top" "$LOG" || fail "не сменён корень по умолчанию"
[ -d "$T/top/cloudpkg-roots" ] || fail "нет каталога корней"
grep -q "btrfs subvolume snapshot $D/.*-third $T/top/cloudpkg-roots/" "$LOG" || fail "rollback не взял последний снимок"

if "$T/cp" snapshot-rm ../etc 2>/dev/null; then fail "snapshot-rm принял путь"; fi
if "$T/cp" snapshot "a b" 2>/dev/null; then fail "snapshot принял метку с пробелом"; fi
if "$T/cp" snapshot "-x" 2>/dev/null; then fail "snapshot принял метку с дефисом в начале"; fi
if "$T/cp" rollback -y 20990101-000000 2>/dev/null; then fail "rollback на несуществующий снимок"; fi

FIRST=$(printf '%s\n' "$LIST" | head -n 1)
"$T/cp" snapshot-rm "$FIRST" >/dev/null || fail "snapshot-rm"
[ ! -e "$D/$FIRST" ] || fail "снимок не удалён"

if "$T/cp-ext4" snapshot 2>/dev/null; then fail "snapshot на ext4 должен падать"; fi
if "$T/cp-ext4" rollback -y 2>/dev/null; then fail "rollback на ext4 должен падать"; fi

echo "всё прошло: снимки и откат"
