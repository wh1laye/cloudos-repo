#!/bin/bash
set -eu
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin
export CFLAGS="-O2 -pipe" CXXFLAGS="-O2 -pipe"
VERSION=${1:-1.1}
S=/var/tmp/s3src; F=/var/tmp/s3files; B=/var/tmp/s3build; J=$(nproc)
say() { printf '==> %s\n' "$*"; }
unpack() { rm -rf "$B"; mkdir -p "$B"; tar xf "$S/$1" -C "$B" --strip-components=1; cd "$B"; }
auto() { local f=$1; shift; unpack "$f"; CC="gcc -std=gnu17" ./configure --prefix=/usr "$@"; make -j"$J"; make install; ldconfig; }
ST=/var/tmp/s3stamp; mkdir -p "$ST"
step() { local n=$1; shift; if [ -e "$ST/$n" ]; then say "$n: уже готово"; return 0; fi; say "$n"; "$@"; touch "$ST/$n"; }


do_ivykis() { unpack ivykis-0.43.2.tar.gz; autoreconf -fi >/dev/null; CC="gcc -std=gnu17" ./configure --prefix=/usr --disable-static; make -j"$J"; make install; ldconfig; }

do_jsonc() {
  unpack json-c-0.19-20260627.tar.gz
  CC=gcc cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/usr -DCMAKE_INSTALL_LIBDIR=lib -DBUILD_STATIC_LIBS=OFF -DBUILD_TESTING=OFF -DDISABLE_WERROR=ON
  cmake --build build -j"$J"; cmake --install build; ldconfig
}

do_syslogng() {
  auto syslog-ng-4.10.2.tar.gz --sysconfdir=/etc/syslog-ng --localstatedir=/var/lib/syslog-ng \
    --with-ivykis=system --with-module-dir=/usr/lib/syslog-ng --with-pidfile-dir=/run \
    --enable-ipv6 --enable-json --disable-java --disable-java-modules --disable-python \
    --disable-mongodb --without-mongoc --disable-amqp --disable-geoip2 --disable-http --disable-kafka \
    --disable-mqtt --disable-redis --disable-smtp --disable-sql --disable-systemd --disable-tcp-wrapper \
    --disable-linux-caps --disable-spoof-source --disable-manpages --disable-docs
}

do_squashfs() {
  unpack squashfs-tools-4.7.5.tar.gz
  local z=0 l=0; [ -e /usr/include/zstd.h ] && z=1; [ -e /usr/include/lzo/lzo1x.h ] && l=1
  make -C squashfs-tools -j"$J" CC="gcc -std=gnu17" GZIP_SUPPORT=1 XZ_SUPPORT=1 ZSTD_SUPPORT=$z LZO_SUPPORT=$l
  make -C squashfs-tools install INSTALL_DIR=/usr/bin
}

do_mtools() { auto mtools_4.0.49.orig.tar.bz2 --sysconfdir=/etc; [ -e /etc/mtools.conf ] || install -Dm644 mtools.conf /etc/mtools.conf; }

do_fastfetch() {
  unpack fastfetch-2.70.0.tar.gz
  CC=gcc CXX=g++ cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/usr -DBUILD_FLASHFETCH=OFF -DBUILD_TESTS=OFF
  cmake --build build -j"$J"
  cmake --install build
  install -d /usr/share/cloudos /etc/xdg/fastfetch /etc/fastfetch
  install -m644 "$F/logo.txt" "$F/logo.ansi" "$F/logo.png" /usr/share/cloudos/
  install -m644 "$F/fastfetch-truecolor.jsonc" "$F/fastfetch-image.jsonc" /usr/share/cloudos/
  install -m644 "$F/fastfetch.jsonc" /etc/xdg/fastfetch/config.jsonc
  ln -sf ../xdg/fastfetch/config.jsonc /etc/fastfetch/config.jsonc
}

do_limine() { cloudpkg sync; cloudpkg install limine; }

do_logger() {
  rm -f /usr/sbin/syslogd /usr/sbin/klogd /usr/lib/libsyslog.* /usr/lib/pkgconfig/libsyslog.pc /etc/syslog.conf \
    /etc/init.d/sysklogd /etc/conf.d/sysklogd /etc/runlevels/*/sysklogd
  rm -rf /usr/include/syslog
  install -d /etc/syslog-ng/patterndb.d /var/lib/syslog-ng /var/log
  install -m755 "$F/syslog-ng.initd" /etc/init.d/syslog-ng
  install -m644 "$F/syslog-ng.confd" /etc/conf.d/syslog-ng
  install -m644 "$F/syslog-ng.conf" /etc/syslog-ng/syslog-ng.conf
  ln -sf /etc/init.d/syslog-ng /etc/runlevels/default/syslog-ng
}

do_provided() {
  sed -i '/sysklogd/d;/^virtual\/logger/d' /etc/portage/profile/package.provided
  cat >> /etc/portage/profile/package.provided <<EOP
virtual/logger-0
app-admin/syslog-ng-4.10.2
dev-libs/ivykis-0.43.2
dev-libs/json-c-0.19
dev-libs/libburn-1.5.6
dev-libs/libisofs-1.5.6
dev-libs/libisoburn-1.5.6
sys-fs/squashfs-tools-4.7.5
sys-fs/mtools-4.0.49
app-misc/fastfetch-2.70.0
EOP
  install -m644 /var/tmp/cloudpkg-src/etc/portage/make.conf /etc/portage/make.conf
  sed -i "s/CloudOS 1\.0/CloudOS $VERSION/g;s/^VERSION_ID=.*/VERSION_ID=\"$VERSION\"/" /etc/os-release
  if [ -f /etc/issue ]; then sed -i "s/CloudOS 1\.0/CloudOS $VERSION/g" /etc/issue; fi
}

step ivykis do_ivykis
step json-c do_jsonc
step syslog-ng do_syslogng
step libburn auto libburn_1.5.6.orig.tar.gz --disable-static
step libisofs auto libisofs_1.5.6.pl01.orig.tar.gz --disable-static
step libisoburn auto libisoburn_1.5.6.orig.tar.gz --disable-static
step squashfs-tools do_squashfs
step mtools do_mtools
step fastfetch do_fastfetch
step limine do_limine
step sysklogd-to-syslog-ng do_logger
step package.provided do_provided

say "уборка"
rm -rf /var/db/repos/gentoo /var/cache/distfiles/* /var/tmp/portage/* /var/tmp/s3* /var/tmp/cloudpkg-src /root/.cache /tmp/* /etc/resolv.conf /.cloudpkg-box
say "готово"
