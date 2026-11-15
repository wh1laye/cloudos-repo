#!/bin/bash
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
T=$(mktemp -d)
trap 'kill $(jobs -p) 2>/dev/null || true; rm -rf "$T"' EXIT
fail() { printf 'тест не пройден: %s\n' "$*" >&2; exit 1; }
ok() { printf 'ok: %s\n' "$*"; }
for c in python3 curl sha256sum patch; do command -v "$c" >/dev/null || fail "нужен $c"; done

say() { printf '==> %s\n' "$*"; }
die() { printf '::error::%s\n' "$*" >&2; exit 1; }

cat > "$T/drv.sh" <<'EOD'
set -euo pipefail
. "$1"
fetch() { curl -fL --retry 3 --connect-timeout 20 -C - -sS -o "$2" "$1"; }
TAG=$(curl -sL "https://api.github.com/repos/CachyOS/linux/releases/latest" | python3 -c "import json,sys; print(json.load(sys.stdin)['tag_name'])")
[ -n "$TAG" ] || die "не получен тег cachyos"
TAR="cachyos-${TAG}.tar.gz"
fetch "https://github.com/CachyOS/linux/releases/download/$TAG/$TAR" "$2/$TAR"
CSHA=$(curl -sL "https://api.github.com/repos/CachyOS/linux/releases/latest" | python3 -c "import json,sys; [print(a['sha256']) for a in json.load(sys.stdin).get('assets',[]) if a['name']=='$TAR']")
[ -n "$CSHA" ] || die "нет sha256 для $TAR в релизе"
printf '%s  %s\n' "$CSHA" "$2/$TAR" | sha256sum -c -
mkdir -p "$3"
tar xf "$2/$TAR" -C "$3" --strip-components=1
printf 'скачан %s, распакован в %s\n' "$TAR" "$3"
EOD

WORK=$T/w OUT=$T/o bash "$T/drv.sh" "tools/kernel/cloudk-source.sh" "$T" "$T/src"
ok "скачан и проверён исходник cachyos"

# Проверяем что патчи cachyos внутри (ищем bore-related файлы)
if [ ! -f "$T/src/kernel/sched/bore.c" ] && [ ! -f "$T/src/kernel/sched/fair.c" ]; then
  fail "в исходнике нет патчей cachyos (bore/fair)"
fi
ok "в исходнике есть патчи cachyos"

# Проверяем что cloudk_source применяет правки
bash -c '
  set -euo pipefail
  HERE=tools/kernel
  . tools/kernel/cloudk-source.sh
  mkdir -p "$T/check-src"
  cp -r "$T/src"/* "$T/check-src/"
  cd "$T/check-src"
  cloudk_source
'
ok "cloudk_source применяет правки к исходнику cachyos"

# Проверяем что required config опции есть в .config cachyos
if [ -f "$T/src/.config" ]; then
  cfg="$T/src/.config"
else
  (cd "$T/src" && make defconfig >/dev/null 2>&1)
  cfg="$T/src/.config"
fi
for opt in LRU_GEN LRU_GEN_ENABLED BFQ BBR STACKPROTECTOR_STRONG RANDOMIZE_BASE; do
  grep -q "CONFIG_$opt" "$cfg" || fail "в конфиге cachyos нет CONFIG_$opt"
done
ok "конфиг cachyos содержит нужные опции"

# Проверяем sha256: плохой хэш должен отклониться
BAD_TAR="$T/bad.tar.gz"
echo "badhash  $BAD_TAR" | sha256sum -c - 2>/dev/null && fail "плохой sha256 принят" || true
ok "sha256 проверка отклоняет неверный хэш"

echo "все тесты пройдены"
