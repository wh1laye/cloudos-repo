#!/bin/bash
set -e
REPO=wh1laye/cloudos-repo
BRANCH=main
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="${CLOUDPKG_SRC:-}"
PIPS="https://mirrors.aliyun.com/pypi/simple/ https://mirrors.ustc.edu.cn/pypi/simple/ https://pypi.org/simple/"

[ "$(id -u)" = 0 ] || { echo "нужен root"; exit 1; }

for c in python3 curl tar gcc make git; do
  command -v $c >/dev/null || { echo "НЕТ: $c"; exit 1; }
done

if [ -z "$SRC" ]; then
  if [ -f "$HERE/cloudpkg.c" ]; then
    SRC="$HERE"
  else
    mkdir -p /var/tmp/cloudpkg-src
    cd /var/tmp/cloudpkg-src
    rm -rf cloudos-repo-$BRANCH
    echo "загрузка исходников cloudpkg"
    curl -fL --retry 3 --connect-timeout 20 -o repo.tar.gz https://codeload.github.com/$REPO/tar.gz/refs/heads/$BRANCH
    tar xf repo.tar.gz
    SRC="/var/tmp/cloudpkg-src/cloudos-repo-$BRANCH/cloudpkg"
  fi
fi
[ -f "$SRC/cloudpkg.c" ] || { echo "НЕТ: $SRC/cloudpkg.c"; exit 1; }
echo "исходники: $SRC"

getent group portage >/dev/null || groupadd -g 250 portage
getent passwd portage >/dev/null || useradd -g portage -d /var/tmp/portage -s /bin/false -u 250 portage 2>/dev/null || true

if ! command -v emerge >/dev/null; then
  OKP=""
  for I in $PIPS; do
    if python3 -m pip install --index-url $I portage; then OKP=1; break; fi
  done
  [ -n "$OKP" ] || { echo "НЕТ: не удалось установить portage через pip"; exit 1; }
fi
emerge --version | head -1

mkdir -p /var/db/repos /var/cache/distfiles /var/cache/binpkgs /var/db/pkg /var/tmp/portage
chown portage:portage /var/cache/distfiles /var/cache/binpkgs 2>/dev/null || true

cd "$SRC"
make clean
make
make install
make conf

PROF=/var/db/repos/gentoo/profiles/default/linux/amd64/23.0
/usr/bin/cloudpkg sync || true
if [ -d "$PROF" ]; then
  ln -sfn "$PROF" /etc/portage/make.profile
else
  echo "профиля нет: выполни cloudpkg sync, потом ln -sfn $PROF /etc/portage/make.profile"
fi

/usr/bin/cloudpkg doctor || true
emerge --info 2>&1 | head -8
echo CP_OK
