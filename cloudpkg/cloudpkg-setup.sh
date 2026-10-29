#!/bin/bash
set -eu

REPO=${CLOUDPKG_REPO:-wh1laye/cloudos-repo}
BRANCH=${CLOUDPKG_BRANCH:-main}
HERE="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd)" || HERE="$(pwd)"
SRC="${CLOUDPKG_SRC:-}"
PIPS=${CLOUDPKG_PIPS:-"https://mirrors.aliyun.com/pypi/simple/ https://mirrors.ustc.edu.cn/pypi/simple/ https://pypi.org/simple/"}
PORTAGE_VERSION=${CLOUDPKG_PORTAGE_VERSION:-}
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH

NOSYNC=""
for a in "$@"; do
  case $a in
    --no-sync) NOSYNC=1 ;;
    *) printf 'ошибка: неизвестный параметр %s\n' "$a" >&2; exit 1 ;;
  esac
done

TMP=""
cleanup() { [ -n "$TMP" ] && rm -rf "$TMP"; return 0; }
trap cleanup EXIT
say() { printf '==> %s\n' "$*"; }
die() { printf 'ошибка: %s\n' "$*" >&2; exit 1; }

[ "$(id -u)" = 0 ] || die "нужен root"

if [ -r /etc/os-release ] && ! grep -q '^ID=.\?cloudos' /etc/os-release && [ -z "${CLOUDPKG_FORCE:-}" ]; then
  die "это не cloudos. на другом дистрибутиве используй install.sh (изолированный режим), он не трогает твою систему"
fi

for c in python3 curl tar xz gcc make; do
  command -v "$c" >/dev/null || die "нет команды $c"
done

TMP=$(mktemp -d /var/tmp/cloudpkg-setup.XXXXXX)

if [ -z "$SRC" ]; then
  if [ -f "$HERE/cloudpkg.c" ]; then
    SRC="$HERE"
  else
    say "загрузка исходников cloudpkg"
    curl -fL --retry 3 --connect-timeout 20 -o "$TMP/repo.tar.gz" "https://codeload.github.com/$REPO/tar.gz/refs/heads/$BRANCH"
    tar xf "$TMP/repo.tar.gz" -C "$TMP"
    SRC=$(echo "$TMP"/*/cloudpkg)
  fi
fi
[ -f "$SRC/cloudpkg.c" ] || die "нет $SRC/cloudpkg.c"
say "исходники: $SRC"

getent group portage >/dev/null || groupadd -g 250 portage || groupadd portage
getent passwd portage >/dev/null || useradd -g portage -d /var/tmp/portage -s /bin/false -u 250 portage 2>/dev/null \
  || useradd -g portage -d /var/tmp/portage -s /bin/false portage || true

each_index() {
  local idx what=$1
  shift
  for idx in $PIPS; do
    say "$what ($idx)"
    "$@" "$idx" && return 0
  done
  return 1
}

pip_into() {
  local idx=$1 flag log rc
  shift
  log=$(mktemp)
  for flag in "" "--break-system-packages"; do
    python3 -m pip install $flag --disable-pip-version-check --timeout 20 --retries 1 --index-url "$idx" "$@" </dev/null 2>&1 | tee "$log"
    rc=${PIPESTATUS[0]}
    if [ "$rc" = 0 ]; then rm -f "$log"; return 0; fi
    grep -q externally-managed "$log" || break
  done
  rm -f "$log"
  return 1
}

get_tools() { pip_into "$1" --target "$TMP/tools" meson ninja; }

get_sdist() {
  local idx=$1 line url sum
  line=$(python3 - "$idx" "$PORTAGE_VERSION" <<'PY'
import re, sys, urllib.parse, urllib.request
idx = sys.argv[1].rstrip("/") + "/portage/"
want = sys.argv[2]
try:
    html = urllib.request.urlopen(idx, timeout=30).read().decode("utf-8", "replace")
except Exception as e:
    sys.stderr.write("нет ответа: %s\n" % e)
    sys.exit(1)
best = None
for m in re.finditer(r'href="([^"]+)"', html):
    full = urllib.parse.urljoin(idx, m.group(1))
    path, _, frag = full.partition("#")
    name = urllib.parse.unquote(path.rsplit("/", 1)[-1])
    mm = re.fullmatch(r"portage-(\d+(?:\.\d+)*)\.tar\.gz", name)
    if not mm or (want and mm.group(1) != want):
        continue
    ver = tuple(int(x) for x in mm.group(1).split("."))
    sha = frag[len("sha256="):] if frag.startswith("sha256=") else ""
    if best is None or ver > best[0]:
        best = (ver, path, sha)
if best is None:
    sys.exit(1)
print(best[1], best[2])
PY
  ) || return 1
  url=${line%% *}
  sum=${line#* }
  curl -fL --retry 3 --connect-timeout 20 -o "$TMP/portage.tar.gz" "$url" || return 1
  if [ -n "$sum" ] && [ "$sum" != "$line" ]; then
    [ "$(sha256sum "$TMP/portage.tar.gz" | cut -d' ' -f1)" = "$sum" ] || { echo "sha256 не совпал"; return 1; }
  fi
  return 0
}

portage_ok() {
  command -v emerge >/dev/null && python3 -c 'import sys, portage.installation as i; sys.exit(i.TYPE.name != "SYSTEM")' 2>/dev/null
}

install_portage() {
  local meson_args="-Dsystem-wide=true -Drsync-verify=false"
  if python3 -m pip show portage >/dev/null 2>&1; then
    say "убираю portage из pip (модульная сборка)"
    python3 -m pip uninstall -y --break-system-packages portage >/dev/null 2>&1 || python3 -m pip uninstall -y portage >/dev/null 2>&1 || true
  fi
  if ! { command -v meson >/dev/null && command -v ninja >/dev/null; }; then
    each_index "meson и ninja через pip" get_tools || die "не удалось получить meson и ninja через pip (повтори позже или задай CLOUDPKG_PIPS=\"https://...\")"
    export PATH="$TMP/tools/bin:$PATH" PYTHONPATH="$TMP/tools${PYTHONPATH:+:$PYTHONPATH}"
  fi
  each_index "исходники portage" get_sdist || die "не удалось скачать исходники portage"
  mkdir -p "$TMP/psrc"
  tar xzf "$TMP/portage.tar.gz" -C "$TMP/psrc" --strip-components=1
  say "сборка portage (meson, system-wide)"
  if ! { meson setup "$TMP/pbuild" "$TMP/psrc" --prefix=/usr --sysconfdir=/etc --libdir=lib $meson_args >"$TMP/meson.log" 2>&1 \
         && ninja -C "$TMP/pbuild" >>"$TMP/meson.log" 2>&1; }; then
    say "с нативными расширениями не собралось, собираю на чистом python"
    rm -rf "$TMP/pbuild"
    { meson setup "$TMP/pbuild" "$TMP/psrc" --prefix=/usr --sysconfdir=/etc --libdir=lib $meson_args -Dnative-extensions=false >"$TMP/meson.log" 2>&1 \
      && ninja -C "$TMP/pbuild" >>"$TMP/meson.log" 2>&1; } || { tail -30 "$TMP/meson.log"; die "не удалось собрать portage"; }
  fi
  meson install -C "$TMP/pbuild" >"$TMP/install.log" 2>&1 || { tail -30 "$TMP/install.log"; die "не удалось установить portage"; }
  hash -r
}

if ! portage_ok; then
  install_portage
fi

[ -e /usr/bin/python ] || ln -s python3 /usr/bin/python
[ -e /usr/bin/gtar ] || ln -s tar /usr/bin/gtar

portage_ok || die "portage установлен неправильно (emerge не находится или не системная сборка)"
emerge --version | head -1

mkdir -p /var/db/repos /var/cache/distfiles /var/cache/binpkgs /var/db/pkg /var/tmp/portage
chown portage:portage /var/cache/distfiles /var/cache/binpkgs 2>/dev/null || true

say "сборка cloudpkg"
cd "$SRC"
make clean
make
make install
make conf
make overlay

SYNC_FAIL=""
if [ -z "$NOSYNC" ]; then
  say "cloudpkg sync"
  cloudpkg sync || SYNC_FAIL=1
fi

cloudpkg doctor || true
if [ -z "$SYNC_FAIL" ]; then
  emerge --info 2>&1 | head -8
  echo CP_OK
else
  echo "portage и cloudpkg установлены, но дерево рецептов не загружено."
  echo "включи vpn или смени зеркало и выполни: cloudpkg sync"
  exit 3
fi
