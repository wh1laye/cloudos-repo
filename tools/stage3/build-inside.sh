#!/bin/bash
set -eu
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin
export CFLAGS="-O2 -pipe" CXXFLAGS="-O2 -pipe"
VERSION=${1:-1.1}
STRICT=${2:-0}
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
  sed -i -E "s/CloudOS 1\.0/CloudOS $VERSION/g;s/^VERSION=.*/VERSION=\"$VERSION\"/;s/^VERSION_ID=.*/VERSION_ID=\"$VERSION\"/" /etc/os-release
  grep -q '^VERSION_ID=' /etc/os-release || echo "VERSION_ID=\"$VERSION\"" >> /etc/os-release
  if [ -f /etc/issue ]; then sed -i "s/CloudOS 1\.0/CloudOS $VERSION/g" /etc/issue; fi
}

excluded() {
  local p
  while read -r p _; do
    case $p in ''|'#'*) continue ;; esac
    case $1 in $p) return 0 ;; esac
  done < "$F/gentoo-exclude.txt"
  return 1
}

have_pkg() {
  ls -d /var/db/pkg/"$1"-[0-9]* >/dev/null 2>&1 && return 0
  awk -v a="$1-" 'index($0, a) == 1 { f = 1 } END { exit !f }' /etc/portage/profile/package.provided
}

# в gentoo этот скрипт ставит их пакет meson, а у нас meson собран вручную. без него падают все meson-пакеты
do_meson_helper() {
  command -v meson-format-array >/dev/null && return 0
  cat > /usr/bin/meson-format-array <<'EOH'
#!/usr/bin/env python3
import shlex, sys
def q(s): return "'" + s.replace("\\", "\\\\").replace("'", "\\'") + "'"
print("[" + ", ".join(q(x) for x in shlex.split(" ".join(sys.argv[1:]))) + "]")
EOH
  chmod 755 /usr/bin/meson-format-array
  [ "$(meson-format-array "-O2 -pipe")" = "['-O2', '-pipe']" ] || { echo "meson-format-array работает неверно" >&2; return 1; }
}

# весь набор пакетов из gentoo stage 3 (кроме пакетного менеджера и фишек gentoo, см. gentoo-exclude.txt).
# один пакет не собрался: пишем в отчёт и идём дальше, итог в конце (с STRICT=1 это ошибка сборки)
do_gentoo_set() {
  local rep=/var/tmp/cloudos-report.txt L=/var/tmp/s3log a n=0 ok=0 have=0 skip=0 fail=0
  mkdir -p "$L"; : > "$rep"
  while read -r a _; do
    case $a in ''|'#'*) continue ;; esac
    n=$((n + 1))
    if excluded "$a"; then skip=$((skip + 1)); continue; fi
    if have_pkg "$a"; then have=$((have + 1)); continue; fi
    say "gentoo stage 3: $a ($n)"
    if cloudpkg install "$a" < /dev/null > "$L/${a//\//_}.log" 2>&1; then
      ok=$((ok + 1))
    else
      fail=$((fail + 1)); echo "$a" >> "$rep"
      printf '!! не собрался %s. главное из лога:\n' "$a"
      grep -E 'not found|No such file|rror:|ERROR|undefined|cannot|failed' "$L/${a//\//_}.log" | grep -v 'Called ' | head -n 6
      echo "   (полный лог: $L/${a//\//_}.log)"
    fi
  done < "$F/gentoo-stage3.list"
  say "пакеты gentoo stage 3: в списке $n, уже были $have, исключено $skip, поставлено $ok, ошибок $fail"
  if [ "$fail" -gt 0 ]; then
    say "НЕ СОБРАЛИСЬ: $(tr '\n' ' ' < "$rep")"
    [ "$STRICT" = 1 ] && { echo "STRICT=1: сборка остановлена" >&2; return 1; }
  fi
  return 0
}

# проверка готового корня: всё, что нужно, чтобы система загрузилась и работала
do_verify() {
  local bad=0 f
  for f in /sbin/init /sbin/openrc-init /sbin/openrc /etc/init.d/syslog-ng /etc/runlevels/default/syslog-ng \
           /etc/syslog-ng/syslog-ng.conf /usr/share/cloudos/logo.txt /usr/share/cloudos/logo.ansi \
           /usr/share/cloudos/logo.png /etc/xdg/fastfetch/config.jsonc /etc/os-release /etc/portage/make.conf; do
    if [ -e "$f" ] || [ -L "$f" ]; then :; else echo "!! нет $f"; bad=1; fi
  done
  for f in syslog-ng fastfetch cloudpkg emerge xorriso mksquashfs mcopy bash python3 gcc git curl doas dhcpcd; do
    command -v "$f" >/dev/null || { echo "!! нет команды $f"; bad=1; }
  done
  [ "$(readlink -f /sbin/init)" = "$(readlink -f /sbin/openrc-init)" ] || { echo "!! /sbin/init не указывает на openrc-init"; bad=1; }
  grep -q "^VERSION_ID=\"$VERSION\"" /etc/os-release || { echo "!! в /etc/os-release не $VERSION"; bad=1; }
  [ ! -e /etc/init.d/sysklogd ] || { echo "!! остался sysklogd"; bad=1; }
  syslog-ng -s -f /etc/syslog-ng/syslog-ng.conf || { echo "!! конфиг syslog-ng не проходит проверку"; bad=1; }
  fastfetch --version || bad=1
  say "так выглядит fastfetch в этом stage 3:"
  fastfetch --pipe false || true
  [ "$bad" = 0 ] || { echo "проверка не пройдена" >&2; return 1; }
  say "проверка пройдена"
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
step meson-helper do_meson_helper
step gentoo-stage3-set do_gentoo_set
step verify do_verify

say "уборка"
rm -rf /var/db/repos/gentoo /var/cache/distfiles/* /var/tmp/portage/* /var/tmp/s3* /var/tmp/cloudpkg-src /root/.cache /tmp/* /etc/resolv.conf /.cloudpkg-box /var/log/portage /var/log/emerge*.log
say "готово"
