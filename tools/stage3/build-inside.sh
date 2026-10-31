#!/bin/bash
set -eu
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin
export CFLAGS="-O2 -pipe" CXXFLAGS="-O2 -pipe"
VERSION=${1:-1.2}
STRICT=${2:-0}
S=/var/tmp/s3src; F=/var/tmp/s3files; B=/var/tmp/s3build; J=$(nproc)
say() { printf '==> %s\n' "$*"; }
unpack() { rm -rf "$B"; mkdir -p "$B"; tar xf "$S/$1" -C "$B" --strip-components=1; cd "$B"; }
auto() { local f=$1; shift; unpack "$f"; CC="gcc -std=gnu17" ./configure --prefix=/usr "$@"; make -j"$J"; make install; ldconfig; }
ST=/var/tmp/s3stamp; mkdir -p "$ST"
step() {
  local n=$1; shift
  if [ -e "$ST/$n" ]; then say "$n: уже готово"; return 0; fi
  say "$n"; rm -f "$ST/$n.partial"
  "$@"
  if [ -e "$ST/$n.partial" ]; then say "$n: сделано не до конца, после исправления запусти с RESUME=1"; else touch "$ST/$n"; fi
}
L=/var/tmp/s3log; PP=/etc/portage/profile/package.provided; VDB=/var/db/pkg; PTMP=/var/tmp/portage
mkdir -p "$L"


# профиль gentoo 23.0 кладёт библиотеки в /usr/lib64, а у lfs они лежат в /usr/lib и загрузчик /usr/lib64 не знает.
# делаем /usr/lib64 ссылкой на lib: пакеты portage попадают туда, где их видят ld.so, gcc и pkgconf
do_libdir() {
  if [ -L /usr/lib64 ]; then say "/usr/lib64 уже ссылка на $(readlink /usr/lib64)"; return 0; fi
  if [ -d /usr/lib64 ]; then
    cp -a --update=none /usr/lib64/. /usr/lib/ || { echo "!! не смог перенести /usr/lib64 в /usr/lib" >&2; return 1; }
    rm -rf /usr/lib64
  fi
  ln -s lib /usr/lib64
  ldconfig
  say "/usr/lib64 -> lib"
}

# настоящий gnuconfig вместо записи в package.provided (у lfs нет /usr/share/gnuconfig, а ebuild-ы берут оттуда
# config.guess и config.sub), свежий make.conf без parallel-fetch и multilib-strict
do_tune() {
  sed -i '/^sys-devel\/gnuconfig-/d' "$PP"
  install -m644 /var/tmp/cloudpkg-src/etc/portage/make.conf /etc/portage/make.conf
  grep -q -- '-multilib-strict' /etc/portage/make.conf || { echo "!! в make.conf нет -multilib-strict" >&2; return 1; }
}

# cloudpkg из текущих исходников репозитория (нужно при RESUME=1, когда старый уже стоит). раст, если есть cargo
do_cloudpkg() {
  cd /var/tmp/cloudpkg-src
  make clean
  make
  make install
  make overlay
  cloudpkg version
}

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

do_neofetch() {
  install -m755 "$F/neofetch" /usr/bin/neofetch
  install -m755 "$F/cloudos-users.sh" /usr/sbin/cloudos-users
  install -m755 "$F/cloudos-adduser" /usr/sbin/cloudos-adduser
  NO_COLOR=1 /usr/bin/neofetch | grep -q '^OS ' || { echo "!! neofetch не работает" >&2; return 1; }
}

do_users() {
  if ! command -v useradd >/dev/null || ! command -v su >/dev/null; then
    say "нет useradd или su: ставлю sys-apps/shadow через cloudpkg"
    sed -i '/^sys-apps\/shadow-/d' "$PP"
    restore_helpers "перед shadow"
    install_one sys-apps/shadow "$L/shadow.log" || { echo "!! shadow не поставился" >&2; return 1; }
    restore_helpers "после shadow"
  fi
  /usr/sbin/cloudos-users
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
  sed -i -E "s/CloudOS [0-9][0-9.]*/CloudOS $VERSION/g;s/^VERSION=.*/VERSION=\"$VERSION\"/;s/^VERSION_ID=.*/VERSION_ID=\"$VERSION\"/" /etc/os-release
  grep -q '^VERSION_ID=' /etc/os-release || echo "VERSION_ID=\"$VERSION\"" >> /etc/os-release
  if [ -f /etc/issue ]; then sed -i "s/CloudOS [0-9][0-9.]*/CloudOS $VERSION/g" /etc/issue; fi
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

# фишки gentoo, которые portage подтягивает зависимостями, а у нас им не место: записываем как уже стоящие.
# gentoo-functions не собирается (meson не видит ninja), а обёртки autoconf и automake затёрли бы
# настоящие autoconf и automake из lfs
do_machinery() {
  local n PP=/etc/portage/profile/package.provided
  {
    echo sys-apps/gentoo-functions-1.7.7
    echo dev-build/autoconf-wrapper-99999999
    echo dev-build/automake-wrapper-99999999
    echo dev-build/meson-format-array-99
    # app-alternatives кладут ссылки поверх настоящих файлов (ninja, awk, sh...) и ломают систему
    for n in awk bc bzip2 cpio gpg gzip lex ninja sh tar yacc zstd; do echo "app-alternatives/$n-99"; done
  } | while read -r n; do grep -qxF "$n" "$PP" || echo "$n" >> "$PP"; done
  # скрипты gentoo иногда подключают /lib/gentoo/functions.sh: даём лёгкую замену
  if [ ! -e /lib/gentoo/functions.sh ]; then
    install -d /lib/gentoo
    cat > /lib/gentoo/functions.sh <<'EOS'
# замена gentoo-functions для cloudos
einfo()  { printf ' * %s\n' "$*"; }
einfon() { printf ' * %s' "$*"; }
ewarn()  { printf ' * %s\n' "$*" >&2; }
eerror() { printf ' * %s\n' "$*" >&2; }
ebegin() { printf ' * %s ...' "$*"; }
eend()   { local r=${1:-0}; shift; if [ "$r" = 0 ]; then printf ' [ ok ]\n'; else printf ' [ !! ]\n'; [ -n "${*:-}" ] && eerror "$*"; fi; return "$r"; }
ewend()  { eend "$@"; }
eindent() { :; }
eoutdent() { :; }
yesno() { case ${1:-} in [Yy][Ee][Ss]|[Tt][Rr][Uu][Ee]|[Oo][Nn]|1) return 0 ;; *) return 1 ;; esac; }
EOS
  fi
  # libxml2: meson не находит readline через pkg-config, а он нужен только для xmllint --shell
  if [ -d /etc/portage/package.use ]; then
    echo 'dev-libs/libxml2 -readline' >> /etc/portage/package.use/cloudos
  else
    echo 'dev-libs/libxml2 -readline' >> /etc/portage/package.use
  fi
}

# portage умеет затирать ninja и meson-format-array (ссылки app-alternatives и т.п.).
# держим запасные копии и возвращаем файлы на место, записывая, после какого пакета это случилось
KEEP=/usr/lib/cloudos-keep
keep_helpers() {
  local f
  mkdir -p "$KEEP"
  for f in ninja meson-format-array; do
    if [ -x "/usr/bin/$f" ] && [ ! -L "/usr/bin/$f" ] && [ ! -e "$KEEP/$f" ]; then cp -a "/usr/bin/$f" "$KEEP/$f"; fi
  done
}
restore_helpers() {
  local f
  for f in ninja meson-format-array; do
    [ -e "$KEEP/$f" ] || continue
    if [ -L "/usr/bin/$f" ] || [ ! -x "/usr/bin/$f" ]; then
      rm -f "/usr/bin/$f"; cp -a "$KEEP/$f" "/usr/bin/$f"
      say "!! $f пропал ($1), вернул на место"
      echo "$f пропал: $1" >> /var/tmp/cloudos-helpers.txt
    fi
  done
}

# проверка, что инструменты сборки живы. при поломке показываем, что именно сказала команда
tools_ok() {
  local bad="" t out
  hash -r
  for t in ninja meson autoconf automake pkg-config gcc bash tar python3 make; do
    if ! out=$("$t" --version 2>&1); then
      bad="$bad
   $t: $(printf '%s' "$out" | head -n 2 | tr '\n' ' ')
   файл: $(ls -l "$(command -v "$t" 2>/dev/null)" 2>&1)
   библиотеки: $(ldd "$(command -v "$t" 2>/dev/null)" 2>&1 | grep -i 'not found' | tr '\n' ' ')"
    fi
  done
  [ -z "$bad" ] && return 0
  printf '%s\n' "$bad"; return 1
}

STRIPV='s/-[0-9]+(\.[0-9]+)*[a-z]?(_(alpha|beta|pre|rc|p)[0-9]*)*(-r[0-9]+)?$//'

# portage иногда хочет пересобрать то, что уже стоит из lfs (из-за новых версий и флагов abi).
# смотрим план: если в нём пакет, который у нас уже есть (package.provided) или фишка gentoo,
# записываем его как установленный и не пересобираем
provide_planned() {
  local a=$1 PP=/etc/portage/profile/package.provided i p name ok changed
  for i in 1 2 3 4; do
    changed=0
    while read -r p; do
      [ -n "$p" ] || continue
      name=$(printf '%s\n' "$p" | sed -E "$STRIPV")
      [ "$name" = "$a" ] && continue
      case $name in
        sys-apps/gentoo-functions|app-alternatives/*|dev-build/*-wrapper) ok=1 ;;
        *) ok=0; sed -E "$STRIPV" "$PP" | grep -qxF "$name" && ok=1 ;;
      esac
      if [ "$ok" = 1 ] && ! grep -qxF "$p" "$PP"; then
        echo "$p" >> "$PP"; say "уже есть в системе, не пересобираю: $p"; changed=1
      fi
    done < <(emerge -pvq --noreplace "$a" < /dev/null 2>/dev/null | sed -nE 's/^\[(ebuild|binary)[^]]*\] +([^ ]+).*/\2/p')
    [ "$changed" = 1 ] || break
  done
  return 0
}

# убирает цветовые коды из лога portage
clean_log() { sed 's/\x1b\[[0-9;]*[A-Za-z]//g' "$1"; }

# пакеты, которые упали в логе: "категория/пакет-версия фаза"
failed_in_log() {
  clean_log "$1" | sed -nE 's/.*ERROR: ([^ ]+)::[^ ]+ failed \(([a-z-]+) phase\).*/\1 \2/p' | awk '!s[$0]++' || true
}

# настоящая причина падения: кусок build.log самого упавшего пакета вокруг строки ERROR
show_failure() {
  local pf=$1 phase=$2 bl n
  bl="$PTMP/$pf/temp/build.log"
  if [ ! -s "$bl" ]; then echo "   (нет $bl)"; return 0; fi
  n=$(clean_log "$bl" | grep -n -m1 'ERROR: .* failed (' | cut -d: -f1 || true)
  n=${n:-1}
  echo "   ---- $pf, фаза $phase: из build.log ----"
  clean_log "$bl" | sed -n "$((n > 12 ? n - 12 : 1)),$((n + 40))p" | sed 's/^/   | /'
  echo "   ----"
}

report_failure() {
  local a=$1 lg=$2 pf ph n=0
  printf '!! не собрался %s\n' "$a"
  while read -r pf ph; do
    [ -n "$pf" ] || continue
    n=$((n + 1))
    printf '   упал пакет %s, фаза %s\n' "$pf" "$ph"
    show_failure "$pf" "$ph"
  done < <(failed_in_log "$lg")
  if [ "$n" = 0 ]; then
    echo "   сборка не началась: portage не смог составить план. сообщения emerge:"
    clean_log "$lg" | grep -E '^(!!!|emerge:|\[blocks)|^ \* (Error|ERROR)|[Ff]ailed|rror:' | tail -n 20 | sed 's/^/   | /' || true
    echo "   хвост лога:"
    clean_log "$lg" | tail -n 20 | sed 's/^/   | /'
  fi
  echo "   (полный лог: $lg)"
}

show_plan() {
  local a=$1 out
  echo "   что он тянет за собой:"
  out=$(emerge -pvq --noreplace "$a" < /dev/null 2>&1 | sed 's/\x1b\[[0-9;]*[A-Za-z]//g') || true
  printf '%s\n' "$out" | grep -E '^\[(ebuild|binary)' | head -n 14 | sed 's/^/   /' || true
  if ! printf '%s\n' "$out" | grep -q '^\[ebuild'; then
    echo "   emerge -p не показал план сборки, его вывод:"
    printf '%s\n' "$out" | tail -n 25 | sed 's/^/   | /'
  fi
}

# известный сбой: ebuild падает в prepare на eautoreconf. в тарболле уже есть готовый configure,
# поэтому для этого пакета глушим пересборку autotools (хук pre_src_prepare в /etc/portage/env)
fix_noreconf() {
  local cp=$1 pc=${1%%/*} mark pe
  mark="$ST/fix-noreconf-${cp//\//_}"
  if [ -e "$mark" ]; then return 1; fi
  touch "$mark"
  install -d "/etc/portage/env/$pc"
  printf '%s\n' 'pre_src_prepare() {' 'eautoreconf() { :; }' 'eaclocal() { :; }' 'eautoconf() { :; }' 'eautoheader() { :; }' \
    'eautomake() { :; }' 'elibtoolize() { :; }' '_elibtoolize() { :; }' '}' > /etc/portage/env/cloudos-noreconf
  bash -n /etc/portage/env/cloudos-noreconf || { echo "!! cloudos-noreconf не прошёл bash -n" >&2; rm -f /etc/portage/env/cloudos-noreconf; return 1; }
  cp /etc/portage/env/cloudos-noreconf "/etc/portage/env/$cp"
  if [ -d /etc/portage/package.env ]; then pe=/etc/portage/package.env/cloudos; else pe=/etc/portage/package.env; fi
  echo "$cp cloudos-noreconf" >> "$pe"
  return 0
}

# смотрит, что упало, и чинит то, что умеем. 0 = что-то изменили и повтор имеет смысл
apply_fix() {
  local lg=$1 pf ph cp did=1
  while read -r pf ph; do
    [ -n "$pf" ] || continue
    cp=$(printf '%s\n' "$pf" | sed -E "$STRIPV")
    case $ph in
      prepare)
        if fix_noreconf "$cp"; then say "для $cp отключаю пересборку autotools"; did=0; fi ;;
    esac
  done < <(failed_in_log "$lg")
  if clean_log "$lg" | grep -qE 'Fetch failed|Couldn.t download|Could not resolve host|Connection timed out|Connection reset'; then
    say "похоже на сбой сети, повторю через 10 секунд"; sleep 10; did=0
  fi
  return "$did"
}

# один пакет через cloudpkg: до трёх попыток, между ними apply_fix
install_one() {
  local a=$1 lg=$2 try=1
  while :; do
    provide_planned "$a"
    if MAKEOPTS="-j$J" cloudpkg install "$a" < /dev/null > "$lg" 2>&1; then return 0; fi
    report_failure "$a" "$lg"
    if [ "$try" -ge 3 ] || ! apply_fix "$lg"; then return 1; fi
    try=$((try + 1))
    say "повторяю $a, попытка $try"
  done
}

# scanelf из pax-utils нужен самому portage (без него estrip и проверки ругаются)
do_paxutils() {
  keep_helpers
  command -v scanelf >/dev/null && return 0
  restore_helpers "перед pax-utils"
  install_one app-misc/pax-utils "$L/pax-utils.log" || echo "!! pax-utils не поставился"
  restore_helpers "после pax-utils"
  command -v scanelf >/dev/null || echo "!! scanelf не появился, продолжаю без него"
  return 0
}

preflight() {
  say "состояние перед установкой пакетов"
  local t
  for t in ninja meson pkg-config autoconf automake; do
    printf '%-11s %s -> %s\n' "$t" "$(command -v $t || echo НЕТ)" "$($t --version 2>&1 | head -n 1)"
  done
  pkg-config --print-errors --modversion readline 2>&1 | head -n 3 || true
  ls -l "$(command -v ninja)" 2>&1 || true
  ls -ld /usr/lib64 /lib64 2>&1 || true
  readlink -f /etc/portage/make.profile || true
  emerge --info > "$L/emerge-info.txt" 2>&1 < /dev/null || true
  grep -E '^(Portage |System uname|ABI=|LIBDIR_amd64|CHOST=|ACCEPT_KEYWORDS=|FEATURES=|MAKEOPTS=)' "$L/emerge-info.txt" | cut -c1-200 || true
}

# весь набор пакетов из gentoo stage 3 (кроме пакетного менеджера и фишек gentoo, см. gentoo-exclude.txt).
# один пакет не собрался: показываем настоящую причину, идём дальше, в конце вторая попытка для упавших.
# итог в конце (с STRICT=1 это ошибка сборки, без неё шаг остаётся "не до конца" и при RESUME=1 повторится)
do_gentoo_set() {
  local rep=/var/tmp/cloudos-report.txt a bad lg n=0 ok=0 have=0 skip=0 fail=0
  local failed=() again=()
  : > "$rep"
  keep_helpers
  preflight
  export EMERGE_DEFAULT_OPTS="--keep-going --backtrack=30"
  while read -r a _; do
    case $a in ''|'#'*) continue ;; esac
    n=$((n + 1))
    if excluded "$a"; then skip=$((skip + 1)); continue; fi
    if have_pkg "$a"; then have=$((have + 1)); continue; fi
    say "gentoo stage 3: $a ($n)"
    restore_helpers "перед $a"
    lg="$L/${a//\//_}.log"
    if install_one "$a" "$lg"; then
      ok=$((ok + 1))
    else
      fail=$((fail + 1)); failed+=("$a")
      show_plan "$a"
    fi
    restore_helpers "после $a"
    if ! bad=$(tools_ok); then
      printf '!! после %s не работают инструменты сборки:%s\n' "$a" "$bad" >&2
      echo "после $a сломано:$bad" >> "$rep"
    fi
  done < "$F/gentoo-stage3.list"
  if [ "$fail" -gt 0 ]; then
    say "вторая попытка для упавших: ${failed[*]}"
    again=("${failed[@]}"); failed=()
    for a in "${again[@]}"; do
      lg="$L/${a//\//_}.retry.log"
      if install_one "$a" "$lg"; then
        ok=$((ok + 1)); fail=$((fail - 1)); say "собрался со второй попытки: $a"
      else
        failed+=("$a")
        { echo "$a"; failed_in_log "$lg" | sed 's/^/   упал: /'; } >> "$rep"
      fi
    done
  fi
  say "пакеты gentoo stage 3: в списке $n, уже были $have, исключено $skip, поставлено $ok, ошибок $fail"
  if [ "$fail" -gt 0 ]; then
    touch "$ST/gentoo-stage3-set.partial"
    say "НЕ СОБРАЛИСЬ: ${failed[*]}"
    if [ "$STRICT" = 1 ]; then echo "STRICT=1: сборка остановлена" >&2; return 1; fi
  fi
  return 0
}

# проверка готового корня: всё, что нужно, чтобы система загрузилась и работала
do_verify() {
  local bad=0 f miss
  for f in /sbin/init /sbin/openrc-init /sbin/openrc /etc/init.d/syslog-ng /etc/runlevels/default/syslog-ng \
           /etc/syslog-ng/syslog-ng.conf /usr/share/cloudos/logo.txt /usr/share/cloudos/logo.ansi \
           /usr/share/cloudos/logo.png /etc/xdg/fastfetch/config.jsonc /etc/os-release /etc/portage/make.conf /usr/lib64; do
    if [ -e "$f" ] || [ -L "$f" ]; then :; else echo "!! нет $f"; bad=1; fi
  done
  for f in syslog-ng fastfetch neofetch cloudpkg emerge xorriso mksquashfs mcopy bash python3 gcc git curl doas dhcpcd useradd usermod userdel groupadd passwd chpasswd su login cloudos-users cloudos-adduser; do
    command -v "$f" >/dev/null || { echo "!! нет команды $f"; bad=1; }
  done
  for f in /etc/pam.d/system-auth /etc/pam.d/su /etc/pam.d/login /etc/pam.d/passwd /etc/pam.d/doas /etc/login.defs /etc/default/useradd /etc/profile.d/cloudos-path.sh /etc/skel/.bashrc /etc/doas.conf; do
    [ -e "$f" ] || { echo "!! нет $f"; bad=1; }
  done
  for f in su passwd; do
    [ -u "$(readlink -f "$(command -v $f)")" ] || { echo "!! у $f нет setuid"; bad=1; }
  done
  grep -q '^wheel:' /etc/group || { echo "!! нет группы wheel"; bad=1; }
  env -i PATH=/usr/bin:/bin bash -lc 'command -v useradd' >/dev/null 2>&1 || { echo "!! useradd не виден в PATH обычного входа"; bad=1; }
  [ "$(readlink -f /sbin/init)" = "$(readlink -f /sbin/openrc-init)" ] || { echo "!! /sbin/init не указывает на openrc-init"; bad=1; }
  grep -q "^VERSION_ID=\"$VERSION\"" /etc/os-release || { echo "!! в /etc/os-release не $VERSION"; bad=1; }
  [ ! -e /etc/init.d/sysklogd ] || { echo "!! остался sysklogd"; bad=1; }
  syslog-ng -s -f /etc/syslog-ng/syslog-ng.conf || { echo "!! конфиг syslog-ng не проходит проверку"; bad=1; }
  fastfetch --version || bad=1
  tools_ok || { echo "!! сломаны инструменты сборки"; bad=1; }
  # у программ не должно быть потерянных библиотек (так ловится беда с /usr/lib64)
  miss=$(for f in /usr/bin/* /usr/sbin/*; do
    [ -f "$f" ] && [ ! -L "$f" ] || continue
    head -c4 "$f" 2>/dev/null | grep -q ELF || continue
    ldd "$f" 2>/dev/null | grep 'not found' | sed "s|^|$f: |"
  done | head -n 40)
  [ -z "$miss" ] || { echo "!! у программ нет библиотек:"; printf '%s\n' "$miss"; bad=1; }
  for f in gpg man; do
    command -v "$f" >/dev/null || continue
    "$f" --version >/dev/null 2>&1 || { echo "!! $f не запускается"; bad=1; }
  done
  say "так выглядит fastfetch в этом stage 3:"
  fastfetch --pipe false || true
  [ "$bad" = 0 ] || { echo "проверка не пройдена" >&2; return 1; }
  say "проверка пройдена"
}

step libdir do_libdir
step portage-tune do_tune
step cloudpkg-0.6 do_cloudpkg
step ivykis do_ivykis
step json-c do_jsonc
step syslog-ng do_syslogng
step libburn auto libburn_1.5.6.orig.tar.gz --disable-static
step libisofs auto libisofs_1.5.6.pl01.orig.tar.gz --disable-static
step libisoburn auto libisoburn_1.5.6.orig.tar.gz --disable-static
step squashfs-tools do_squashfs
step mtools do_mtools
step fastfetch do_fastfetch
step neofetch do_neofetch
step limine do_limine
step sysklogd-to-syslog-ng do_logger
step package.provided do_provided
step meson-helper do_meson_helper
step machinery do_machinery
do_paxutils || true
step users do_users
step gentoo-stage3-set do_gentoo_set
step verify do_verify

say "уборка"
for d in /var/tmp/s3*; do
  case $d in
    /var/tmp/s3stamp) continue ;;
    /var/tmp/s3log) if [ -e "$ST/gentoo-stage3-set.partial" ]; then continue; fi ;;
  esac
  rm -rf "$d"
done
rm -rf /var/db/repos/gentoo /var/cache/distfiles/* /var/tmp/cloudpkg-src /var/tmp/cloudos-helpers.txt /root/.cache /tmp/* /etc/resolv.conf /.cloudpkg-box /var/log/portage /var/log/emerge*.log /usr/lib/cloudos-keep
if [ ! -e "$ST/gentoo-stage3-set.partial" ]; then rm -rf /var/tmp/portage/*; fi
say "готово"
