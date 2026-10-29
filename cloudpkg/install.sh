#!/bin/sh
# cloudpkg: установка одной командой на любом дистрибутиве x86_64.
#
#   curl -fsSL https://raw.githubusercontent.com/wh1laye/cloudos-repo/main/cloudpkg/install.sh | sh
#
# в cloudos: собирает cloudpkg и ставит portage прямо в систему.
# на других дистрибутивах (arch, debian, ubuntu, fedora, ...): систему не трогает,
# кладёт отдельный корень cloudos (бокс) в /var/lib/cloudpkg/box и ставит туда cloudpkg.
#
# переменные: CLOUDPKG_BOX (путь бокса), CLOUDPKG_MODE (auto|box|native), CLOUDPKG_STAGE3
# (ссылка или путь к stage 3), CLOUDPKG_SRC (папка cloudpkg с исходниками), CLOUDPKG_BRANCH,
# CLOUDPKG_INSTALL_URL (откуда брать сам скрипт при перезапуске через sudo).
# параметры: --box, --native, --update, -h.
set -eu

main() {
	REPO=${CLOUDPKG_REPO:-wh1laye/cloudos-repo}
	BRANCH=${CLOUDPKG_BRANCH:-main}
	INSTALL_URL=${CLOUDPKG_INSTALL_URL:-https://raw.githubusercontent.com/$REPO/$BRANCH/cloudpkg/install.sh}
	S3_VER=1.0
	S3_NAME=cloudos-stage3-amd64-$S3_VER.tar.xz
	S3=${CLOUDPKG_STAGE3:-https://github.com/$REPO/releases/download/cloudos/$S3_NAME}
	BOX=${CLOUDPKG_BOX:-/var/lib/cloudpkg/box}
	MODE=${CLOUDPKG_MODE:-auto}
	SRC=${CLOUDPKG_SRC:-}
	UPDATE=0
	TMP=
	PM=

	case ${LC_ALL:-${LC_MESSAGES:-${LANG:-}}} in ru*) RU=1 ;; *) RU=0 ;; esac

	need_root "$@"

	for a in "$@"; do
		case $a in
			--box) MODE=box ;;
			--native) MODE=native ;;
			--update) UPDATE=1 ;;
			-h | --help) usage; exit 0 ;;
			*) die "неизвестный параметр: $a" "unknown option: $a" ;;
		esac
	done

	trap cleanup EXIT INT TERM

	case $(uname -m) in
		x86_64 | amd64) ;;
		*) die "cloudos работает только на x86_64, у тебя $(uname -m)" "cloudos runs on x86_64 only, this is $(uname -m)" ;;
	esac
	[ "$(uname -s)" = Linux ] || die "нужен linux" "linux is required"

	OSID=unknown
	if [ -r /etc/os-release ]; then
		# shellcheck disable=SC1091
		OSID=$(. /etc/os-release && printf '%s' "${ID:-unknown}")
	fi
	for p in pacman apt-get dnf yum zypper apk xbps-install; do
		if has "$p"; then PM=$p; break; fi
	done

	if [ "$MODE" = auto ]; then
		if [ "$OSID" = cloudos ]; then MODE=native; else MODE=box; fi
	fi
	case $MODE in
		box | native) ;;
		*) die "режим должен быть auto, box или native" "mode must be auto, box or native" ;;
	esac
	if [ "$MODE" = native ] && [ "$OSID" != cloudos ] && [ -z "${CLOUDPKG_FORCE:-}" ]; then
		die "режим native пишет прямо в /, это ломает менеджер пакетов системы ($OSID). используй --box или задай CLOUDPKG_FORCE=1" \
			"native mode writes straight into /, which breaks the package manager of $OSID. use --box or set CLOUDPKG_FORCE=1"
	fi

	say "система: $OSID, режим: $MODE" "system: $OSID, mode: $MODE"
	if [ "$MODE" = box ]; then install_box; else install_native; fi
}

usage() {
	t "установка cloudpkg одной командой
  curl -fsSL https://raw.githubusercontent.com/wh1laye/cloudos-repo/main/cloudpkg/install.sh | sh

  --box       изолированный режим (по умолчанию на любом дистрибутиве, кроме cloudos)
  --native    поставить прямо в систему (по умолчанию в cloudos)
  --update    обновить cloudpkg, бокс и пакеты не трогать
  -h          эта справка" "install cloudpkg with one command
  curl -fsSL https://raw.githubusercontent.com/wh1laye/cloudos-repo/main/cloudpkg/install.sh | sh

  --box       isolated mode (default on every distro except cloudos)
  --native    install straight into the system (default on cloudos)
  --update    update cloudpkg, keep the box and packages
  -h          this help"
}

t() { if [ "$RU" = 1 ]; then printf '%s\n' "$1"; else printf '%s\n' "$2"; fi; }
say() { printf '==> '; t "$1" "$2"; }
die() { printf 'cloudpkg: ' >&2; t "$1" "$2" >&2; exit 1; }
has() { command -v "$1" >/dev/null 2>&1; }

cleanup() {
	[ -n "$TMP" ] && rm -rf "$TMP"
	return 0
}

# нужен root: перезапускаем себя через sudo или doas (в том числе когда скрипт пришёл по конвейеру из curl)
need_root() {
	[ "$(id -u)" = 0 ] && return 0
	for s in sudo doas; do
		has "$s" || continue
		say "нужен root, перезапускаю через $s" "root is needed, re-running with $s"
		ENVV="CLOUDPKG_REPO=$REPO CLOUDPKG_BRANCH=$BRANCH CLOUDPKG_BOX=$BOX CLOUDPKG_MODE=$MODE CLOUDPKG_SRC=$SRC CLOUDPKG_STAGE3=${CLOUDPKG_STAGE3:-}"
		if [ -f "$0" ]; then
			# shellcheck disable=SC2086
			exec "$s" env $ENVV sh "$0" "$@"
		fi
		# shellcheck disable=SC2086
		fetch_out "$INSTALL_URL" | "$s" env $ENVV sh -s -- "$@"
		exit $?
	done
	die "нужен root (sudo или doas). запусти от root: su -c 'curl -fsSL $INSTALL_URL | sh'" \
		"root is needed (sudo or doas). run as root: su -c 'curl -fsSL $INSTALL_URL | sh'"
}

fetch_out() {
	if has curl; then curl -fsSL "$1"
	elif has wget; then wget -qO- "$1"
	else die "нужен curl или wget" "curl or wget is needed"
	fi
}

# dl ссылка файл: с докачкой
dl() {
	if has curl; then
		if [ -t 2 ]; then q=; else q=-sS; fi
		# shellcheck disable=SC2086
		curl -fL $q --retry 3 --connect-timeout 20 -C - -o "$2" "$1" </dev/null
	elif has wget; then
		wget -c -O "$2" "$1" </dev/null
	else
		die "нужен curl или wget" "curl or wget is needed"
	fi
}

pkg_for() {
	case $PM:$1 in
		apt-get:xz) echo xz-utils ;;
		*) echo "$1" ;;
	esac
}

pm_install() {
	case $PM in
		pacman) pacman -S --needed --noconfirm "$@" ;;
		apt-get) DEBIAN_FRONTEND=noninteractive apt-get install -y "$@" || { apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y "$@"; } ;;
		dnf) dnf install -y "$@" ;;
		yum) yum install -y "$@" ;;
		zypper) zypper --non-interactive install "$@" ;;
		apk) apk add "$@" ;;
		xbps-install) xbps-install -Sy "$@" ;;
		*) return 1 ;;
	esac
}

# ensure команда пакет: ставит пакет через менеджер хоста, если команды нет
ensure() {
	has "$1" && return 0
	[ -n "$PM" ] || die "нет команды $1, поставь пакет $2 и повтори" "command $1 is missing, install package $2 and retry"
	say "нет $1, ставлю $(pkg_for "$2") ($PM)" "$1 is missing, installing $(pkg_for "$2") ($PM)"
	pm_install "$(pkg_for "$2")" </dev/null || die "не удалось поставить $2 ($PM), поставь вручную и повтори" "could not install $2 ($PM), install it by hand and retry"
	has "$1" || die "после установки нет команды $1" "command $1 is still missing after install"
}

safe_box() {
	case $BOX in
		*[!A-Za-z0-9._/+-]*) die "в пути бокса только латиница, цифры и . _ / + -" "box path may contain only letters, digits and . _ / + -" ;;
		/*) ;;
		*) die "путь бокса должен быть абсолютным" "box path must be absolute" ;;
	esac
	case $BOX in
		/ | /usr | /etc | /bin | /sbin | /lib | /lib64 | /boot | /root | /home | /dev | /proc | /sys | /var | /run | /opt | /tmp | /srv | /mnt | \
		/usr/* | /etc/* | /bin/* | /sbin/* | /lib/* | /lib64/* | /boot/* | /dev/* | /proc/* | /sys/*)
			die "небезопасный путь бокса: $BOX" "unsafe box path: $BOX" ;;
	esac
}

# папка cloudpkg с исходниками: заданная, соседняя со скриптом или свежая с github
get_src() {
	if [ -n "$SRC" ]; then
		[ -f "$SRC/cloudpkg.c" ] || die "нет $SRC/cloudpkg.c" "no $SRC/cloudpkg.c"
		return 0
	fi
	if [ -f "$0" ]; then
		d=$(cd "$(dirname "$0")" 2>/dev/null && pwd) || d=
		if [ -n "$d" ] && [ -f "$d/cloudpkg.c" ]; then SRC=$d; return 0; fi
	fi
	TMP=$(mktemp -d /var/tmp/cloudpkg-install.XXXXXX)
	say "загрузка исходников cloudpkg" "downloading cloudpkg sources"
	dl "https://codeload.github.com/$REPO/tar.gz/refs/heads/$BRANCH" "$TMP/repo.tar.gz" || die "не удалось скачать исходники" "could not download the sources"
	tar -xzf "$TMP/repo.tar.gz" -C "$TMP"
	SRC=$(echo "$TMP"/*/cloudpkg)
	[ -f "$SRC/cloudpkg.c" ] || die "в архиве нет cloudpkg/cloudpkg.c" "no cloudpkg/cloudpkg.c in the archive"
}

install_native() {
	for c in python3 curl tar xz gcc make bash; do
		has "$c" || die "нет команды $c (в stage 3 cloudos она есть, проверь PATH)" "command $c is missing (stage 3 has it, check PATH)"
	done
	get_src
	CLOUDPKG_SRC=$SRC bash "$SRC/cloudpkg-setup.sh" </dev/null && rc=0 || rc=$?
	[ "$rc" = 0 ] || [ "$rc" = 3 ] || die "установка не удалась (код $rc)" "install failed (code $rc)"
	say "готово. попробуй: cloudpkg install nano" "done. try: cloudpkg install nano"
}

get_stage3() {
	DL=$(dirname "$BOX")/dl
	mkdir -p "$DL"
	F=$DL/stage3.tar.xz
	SUM=
	case $S3 in
		http://* | https://*)
			say "загрузка stage 3 cloudos, около 260 МБ" "downloading cloudos stage 3, about 260 MB"
			# сначала докачка; если не вышло (например, файл на github заменили), качаем заново с нуля
			dl "$S3" "$DL/stage3.part" || { rm -f "$DL/stage3.part"; dl "$S3" "$DL/stage3.part"; } \
				|| die "не удалось скачать $S3 (повтори или скачай файл сам и задай CLOUDPKG_STAGE3=/путь/к/файлу)" \
				"could not download $S3 (retry, or download it yourself and set CLOUDPKG_STAGE3=/path/to/file)"
			rm -f "$DL/stage3.sha256"
			dl "$S3.sha256" "$DL/stage3.sha256" || die "не удалось скачать $S3.sha256" "could not download $S3.sha256"
			mv "$DL/stage3.part" "$F"
			SUM=$DL/stage3.sha256
			;;
		*)
			[ -f "$S3" ] || die "нет файла $S3" "no such file: $S3"
			F=$S3
			if [ -f "$S3.sha256" ]; then SUM=$S3.sha256; fi
			;;
	esac
	if [ -n "$SUM" ]; then
		want=$(awk 'NR==1{print $1}' "$SUM")
		have_sum=$(sha256sum "$F" | awk '{print $1}')
		if [ "$want" != "$have_sum" ]; then
			case $S3 in http://* | https://*) rm -f "$F" ;; esac
			die "sha256 stage 3 не совпал, файл удалён, повтори установку" "stage 3 sha256 mismatch, the file was removed, run the installer again"
		fi
		say "sha256 stage 3 совпал" "stage 3 sha256 matches"
	else
		say "контрольной суммы нет, проверка пропущена" "no checksum file, verification skipped"
	fi
	rm -rf "$BOX.new"
	mkdir -p "$BOX.new"
	say "распаковка в $BOX, около 1.5 ГБ" "unpacking into $BOX, about 1.5 GB"
	if ! xz -dc "$F" </dev/null | tar -xpf - -C "$BOX.new" --numeric-owner; then
		rm -rf "$BOX.new"
		die "не удалось распаковать stage 3" "could not unpack stage 3"
	fi
	if ! grep -q '^ID=.\?cloudos' "$BOX.new/etc/os-release" 2>/dev/null; then
		rm -rf "$BOX.new"
		die "это не stage 3 cloudos" "this is not a cloudos stage 3"
	fi
	rmdir "$BOX" 2>/dev/null || true
	mv "$BOX.new" "$BOX"
	echo "cloudpkg box" > "$BOX/.cloudpkg-box"
	case $S3 in http://* | https://*) [ -n "${CLOUDPKG_KEEP:-}" ] || rm -f "$F" "$DL/stage3.sha256" ;; esac
}

install_box() {
	safe_box
	[ -n "$PM" ] || say "менеджер пакетов хоста не определён, зависимости проверю без установки" "host package manager not found, dependencies are only checked"
	has curl || has wget || ensure curl curl
	ensure tar tar
	tar --version 2>/dev/null | grep -qi 'gnu tar' || { ensure tar tar; tar --version 2>/dev/null | grep -qi 'gnu tar' || die "нужен GNU tar" "GNU tar is required"; }
	ensure xz xz
	ensure sha256sum coreutils
	ensure chroot coreutils
	ensure unshare util-linux
	ensure mount util-linux
	ensure awk gawk
	unshare -m mount --make-rprivate / </dev/null 2>/dev/null \
		|| die "нет прав на mount и chroot. нужна обычная система с root, не урезанный контейнер" \
		"no rights for mount and chroot. a normal system with root is needed, not a restricted container"

	if [ -e "$BOX" ] && [ ! -f "$BOX/.cloudpkg-box" ]; then
		if [ -d "$BOX" ] && [ -z "$(ls -A "$BOX" 2>/dev/null)" ]; then
			:
		else
			die "$BOX уже существует и это не бокс cloudpkg, укажи другой путь: CLOUDPKG_BOX=/путь" \
				"$BOX exists and is not a cloudpkg box, pick another path: CLOUDPKG_BOX=/path"
		fi
	fi

	if [ ! -f "$BOX/.cloudpkg-box" ]; then
		mkdir -p "$(dirname "$BOX")"
		free_kb=$(df -Pk "$(dirname "$BOX")" | awk 'NR==2{print $4}')
		if [ "${free_kb:-0}" -lt 4194304 ]; then
			die "мало места на диске: нужно минимум 4 ГБ свободно в $(dirname "$BOX")" "not enough disk space: at least 4 GB free is needed in $(dirname "$BOX")"
		fi
		get_stage3
	else
		say "бокс уже есть: $BOX" "box already exists: $BOX"
	fi

	get_src
	rm -rf "$BOX/var/tmp/cloudpkg-src"
	mkdir -p "$BOX/var/tmp/cloudpkg-src"
	cp -R "$SRC/." "$BOX/var/tmp/cloudpkg-src/"

	if [ -e /usr/local/bin/cloudpkg ] && ! grep -q '^# cloudpkg-box-launcher' /usr/local/bin/cloudpkg 2>/dev/null; then
		die "/usr/local/bin/cloudpkg уже есть и это не наш скрипт, убери его и повтори" "/usr/local/bin/cloudpkg exists and is not ours, remove it and retry"
	fi
	mkdir -p /usr/local/bin
	# путь бокса подставляем только в одну строку с точным значением по умолчанию
	# shellcheck disable=SC2016
	sed 's|^BOX=${CLOUDPKG_BOX:-/var/lib/cloudpkg/box}$|BOX=${CLOUDPKG_BOX:-'"$BOX"'}|' "$SRC/cloudpkg-box.sh" > /usr/local/bin/cloudpkg.new
	chmod 755 /usr/local/bin/cloudpkg.new
	mv /usr/local/bin/cloudpkg.new /usr/local/bin/cloudpkg

	say "настройка внутри бокса: portage, cloudpkg, дерево рецептов" "setting up inside the box: portage, cloudpkg, recipe tree"
	extra=
	if [ "$UPDATE" = 1 ] && [ -d "$BOX/var/db/repos/gentoo/profiles" ]; then extra=--no-sync; fi
	# shellcheck disable=SC2086
	/usr/local/bin/cloudpkg exec bash /var/tmp/cloudpkg-src/cloudpkg-setup.sh $extra </dev/null && rc=0 || rc=$?
	rm -rf "$BOX/var/tmp/cloudpkg-src"
	[ "$rc" = 0 ] || [ "$rc" = 3 ] || die "настройка внутри бокса не удалась (код $rc)" "setup inside the box failed (code $rc)"

	if [ "$rc" = 3 ]; then
		say "почти готово: дерево рецептов не загрузилось, выполни позже: cloudpkg sync" "almost done: the recipe tree was not downloaded, run later: cloudpkg sync"
	else
		say "готово" "done"
	fi
	case ":$PATH:" in
		*:/usr/local/bin:*) ;;
		*) say "/usr/local/bin нет в PATH, вызывай /usr/local/bin/cloudpkg или добавь каталог в PATH" "/usr/local/bin is not in PATH, call /usr/local/bin/cloudpkg or add the directory to PATH" ;;
	esac
	t "
cloudpkg стоит в изолированном режиме, твоя система не тронута. бокс: $BOX
  cloudpkg install nano       собрать и поставить пакет в бокс
  cloudpkg run nano файл      запустить программу из бокса
  cloudpkg export nano        сделать команду nano доступной везде
  cloudpkg shell              оболочка внутри бокса
  cloudpkg help               все команды" "
cloudpkg is installed in isolated mode, your system is untouched. box: $BOX
  cloudpkg install nano       build and install a package into the box
  cloudpkg run nano file      run a program from the box
  cloudpkg export nano        make the nano command available everywhere
  cloudpkg shell              shell inside the box
  cloudpkg help               all commands"
}

main "$@"
