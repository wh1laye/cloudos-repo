CLOUDK_SRC_MISS=""

cloudk_edit() {
  local file=$1 expr=$2 check=$3
  if [ ! -f "$file" ]; then CLOUDK_SRC_MISS="$CLOUDK_SRC_MISS $file"; return 0; fi
  sed -E -i "$expr" "$file"
  grep -Eq "$check" "$file" || CLOUDK_SRC_MISS="$CLOUDK_SRC_MISS $file"
  return 0
}

cloudk_source() {
  local ov=$HERE/overlay d=security/cloudk
  [ -d "$ov/$d" ] || die "нет $ov/$d"
  [ -f security/Kconfig ] && [ -f security/Makefile ] || die "в дереве ядра нет security/Kconfig или security/Makefile"
  mkdir -p "$d"
  cp "$ov/$d"/Kconfig "$ov/$d"/Makefile "$ov/$d"/cloudk.c "$d"/
  printf '#define CLOUDK_VERSION "%s"\n' "$CLOUDK_VER" > "$d/cloudk_version.h"
  grep -q 'security/cloudk/Kconfig' security/Kconfig || printf '\nsource "security/cloudk/Kconfig"\n' >> security/Kconfig
  grep -q 'CONFIG_SECURITY_CLOUDK' security/Makefile || printf '\nobj-$(CONFIG_SECURITY_CLOUDK)\t+= cloudk/\n' >> security/Makefile
  grep -q 'cloudk/Kconfig' security/Kconfig && grep -q 'CONFIG_SECURITY_CLOUDK' security/Makefile || die "слой cloudk не подключился к security"

  cloudk_edit lib/vsprintf.c 's/^(int kptr_restrict __read_mostly)[[:space:]]*;/\1 = 2;/' '^int kptr_restrict __read_mostly = 2;'
  cloudk_edit mm/page-writeback.c 's/^((static )?int vm_dirty_ratio[[:space:]]*=[[:space:]]*)[0-9]+;/\1 15;/' 'vm_dirty_ratio[[:space:]]*=[[:space:]]*15;'
  cloudk_edit mm/page-writeback.c 's/^((static )?int dirty_background_ratio[[:space:]]*=[[:space:]]*)[0-9]+;/\1 5;/' 'dirty_background_ratio[[:space:]]*=[[:space:]]*5;'
  cloudk_edit mm/vmscan.c 's/^(int vm_swappiness[[:space:]]*=[[:space:]]*)[0-9]+;/\1 100;/' 'vm_swappiness[[:space:]]*=[[:space:]]*100;'
  say "слой cloudk $CLOUDK_VER подключён"
}
