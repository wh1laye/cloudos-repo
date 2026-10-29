#!/bin/sh
# cloudpkg-box-launcher
# cloudpkg для чужих дистрибутивов (arch, debian, fedora, ...).
# система хоста не трогается: все пакеты собираются и живут в отдельном корне cloudos
# (бокс, по умолчанию /var/lib/cloudpkg/box). сюда ставит install.sh, руками этот файл не нужен.
# бокс отделяет файлы, а не безопасность: это не песочница, сборки идут от root внутри chroot.
set -u

BOX=${CLOUDPKG_BOX:-/var/lib/cloudpkg/box}
INSTALL_URL=https://raw.githubusercontent.com/wh1laye/cloudos-repo/main/cloudpkg/install.sh
MARK='# cloudpkg-export'

case ${LC_ALL:-${LC_MESSAGES:-${LANG:-}}} in ru*) RU=1 ;; *) RU=0 ;; esac
t() { if [ "$RU" = 1 ]; then printf '%s\n' "$1"; else printf '%s\n' "$2"; fi; }
die() { printf 'cloudpkg: ' >&2; t "$1" "$2" >&2; exit 1; }

help() {
	if [ "$RU" = 1 ]; then
		cat <<EOF
cloudpkg (бокс cloudos: $BOX)
использование: cloudpkg команда [параметры]

  sync                   обновить дерево рецептов (gentoo)
  install [-p] [-a] [-o] [-t] пакет...   собрать и поставить в бокс
  remove  [-p] [-a] пакет...             удалить из бокса
  upgrade [-p] [-a]      обновить все пакеты бокса
  clean   [-p]           удалить лишнее и очистить кеш
  search  строка         найти пакет
  info    пакет          показать, что будет установлено
  list                   список установленных пакетов
  doctor                 проверить настройку

только в боксе:
  run КОМАНДА...         запустить программу из бокса (от твоего пользователя)
  shell                  оболочка root внутри бокса
  exec КОМАНДА...        выполнить команду от root внутри бокса
  export ИМЯ...          сделать программу из бокса доступной как обычная команда
  unexport ИМЯ...        убрать такую команду
  self-update            обновить cloudpkg (бокс и пакеты не трогает)
  where                  показать путь к боксу

удалить всё: rm -rf $BOX /usr/local/bin/cloudpkg
EOF
	else
		cat <<EOF
cloudpkg (cloudos box: $BOX)
usage: cloudpkg command [options]

  sync                   update the recipe tree (gentoo)
  install [-p] [-a] [-o] [-t] package...   build and install into the box
  remove  [-p] [-a] package...             remove from the box
  upgrade [-p] [-a]      upgrade all packages in the box
  clean   [-p]           remove unused packages and clean caches
  search  string         search for a package
  info    package        show what would be installed
  list                   list installed packages
  doctor                 check the setup

box only:
  run COMMAND...         run a program from the box (as your user)
  shell                  root shell inside the box
  exec COMMAND...        run a command as root inside the box
  export NAME...         make a program from the box available as a normal command
  unexport NAME...       remove such a command
  self-update            update cloudpkg (the box and packages are kept)
  where                  print the box path

remove everything: rm -rf $BOX /usr/local/bin/cloudpkg
EOF
	fi
}

case $0 in
	/*) SELF=$0 ;;
	*/*) SELF=$PWD/$0 ;;
	*) SELF=$(command -v "$0" 2>/dev/null || echo /usr/local/bin/cloudpkg) ;;
esac

case ${1-help} in
	help | -h | --help) help; exit 0 ;;
	where) printf '%s\n' "$BOX"; exit 0 ;;
esac

# нужен root: chroot и mount без него не работают
if [ "$(id -u)" != 0 ]; then
	for s in sudo doas; do
		if command -v "$s" >/dev/null 2>&1; then
			exec "$s" env CLOUDPKG_UID="$(id -u)" CLOUDPKG_GID="$(id -g)" \
				CLOUDPKG_HOME="${HOME:-/}" CLOUDPKG_CWD="$PWD" "$SELF" "$@"
		fi
	done
	die "нужен root (sudo или doas)" "root is needed (sudo or doas)"
fi

for c in unshare mount chroot; do
	command -v "$c" >/dev/null 2>&1 || die "нет команды $c (пакеты util-linux и coreutils)" "missing command $c (util-linux and coreutils)"
done

# enter MODE КОМАНДА...: MODE root или user; монтирования живут только в приватном пространстве имён
# и исчезают сами, когда процесс закончится, поэтому rm -rf бокса безопасен
enter() {
	[ -x "$BOX/usr/bin/env" ] || die "бокс не найден: $BOX. установка: curl -fsSL $INSTALL_URL | sh" \
		"box not found: $BOX. install: curl -fsSL $INSTALL_URL | sh"
	mode=$1
	shift
	# shellcheck disable=SC2016
	exec unshare -m sh -c '
BOX=$1; MODE=$2; shift 2
mount --make-rprivate / || { echo "cloudpkg: не удалось изолировать монтирование" >&2; exit 1; }
mount --rbind /dev "$BOX/dev" && mount -t proc proc "$BOX/proc" && mount --rbind /sys "$BOX/sys" \
	&& mount -t tmpfs tmpfs "$BOX/run" || { echo "cloudpkg: не удалось смонтировать dev, proc, sys" >&2; exit 1; }
if [ "$MODE" = user ]; then
	[ -d /home ] && mount --rbind /home "$BOX/home"
	mount --bind /tmp "$BOX/tmp"
fi
# dns: старый resolv.conf (или ссылку) убираем, чтобы не записать на хост через ссылку
rm -f "$BOX/etc/resolv.conf"
if [ -s /etc/resolv.conf ]; then cat /etc/resolv.conf > "$BOX/etc/resolv.conf"; else echo "nameserver 1.1.1.1" > "$BOX/etc/resolv.conf"; fi
# сертификаты хоста вместо старых из stage 3 (работает и за корпоративным прокси)
if [ "${CLOUDPKG_HOST_CA:-1}" != 0 ] && [ -f "$BOX/etc/ssl/certs/ca-certificates.crt" ] && [ ! -L "$BOX/etc/ssl/certs/ca-certificates.crt" ]; then
	for ca in /etc/ssl/certs/ca-certificates.crt /etc/pki/tls/certs/ca-bundle.crt /etc/ssl/ca-bundle.pem /etc/ssl/cert.pem; do
		if [ -s "$ca" ] && grep -q "BEGIN CERTIFICATE" "$ca" 2>/dev/null; then
			mount --bind "$ca" "$BOX/etc/ssl/certs/ca-certificates.crt" 2>/dev/null
			break
		fi
	done
fi
P=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin
if [ "$MODE" = user ]; then
	set -- /usr/bin/bash -c "cd \"\${CLOUDPKG_CWD:-/}\" 2>/dev/null || cd /; exec \"\$@\"" bash "$@"
	set -- "CLOUDPKG_CWD=${CLOUDPKG_CWD:-/}" "$@"
	HOMEDIR=${CLOUDPKG_HOME:-/}
else
	HOMEDIR=/root
fi
for v in http_proxy https_proxy all_proxy no_proxy HTTP_PROXY HTTPS_PROXY ALL_PROXY NO_PROXY; do
	eval "val=\${$v-}"
	[ -n "$val" ] && set -- "$v=$val" "$@"
done
if [ "$MODE" = user ]; then
	exec chroot --userspec="${CLOUDPKG_UID:-0}:${CLOUDPKG_GID:-0}" "$BOX" /usr/bin/env -i \
		PATH="$P" HOME="$HOMEDIR" TERM="${TERM:-xterm}" LANG=C.UTF-8 "$@"
fi
exec chroot "$BOX" /usr/bin/env -i PATH="$P" HOME="$HOMEDIR" TERM="${TERM:-xterm}" LANG=C.UTF-8 "$@"
' sh "$BOX" "$mode" "$@"
}

valid_name() {
	case $1 in
		'' | cloudpkg | *[!A-Za-z0-9._+-]*) return 1 ;;
	esac
	return 0
}

case ${1-} in
	shell)
		enter root /usr/bin/bash -l
		;;
	exec)
		shift
		[ $# -gt 0 ] || die "укажи команду" "give a command"
		enter root "$@"
		;;
	run)
		shift
		[ $# -gt 0 ] || die "укажи программу" "give a program"
		# для root-запуска без sudo берём пользователя из SUDO_UID
		CLOUDPKG_UID=${CLOUDPKG_UID:-${SUDO_UID:-0}}
		CLOUDPKG_GID=${CLOUDPKG_GID:-${SUDO_GID:-0}}
		export CLOUDPKG_UID CLOUDPKG_GID
		if [ -z "${CLOUDPKG_HOME:-}" ]; then
			if [ "$CLOUDPKG_UID" = 0 ]; then CLOUDPKG_HOME=/root
			else CLOUDPKG_HOME=$(getent passwd "$CLOUDPKG_UID" 2>/dev/null | cut -d: -f6); fi
			CLOUDPKG_HOME=${CLOUDPKG_HOME:-/}
		fi
		CLOUDPKG_CWD=${CLOUDPKG_CWD:-$PWD}
		export CLOUDPKG_HOME CLOUDPKG_CWD
		chroot --help 2>&1 | grep -q userspec || die "нужен GNU chroot (пакет coreutils)" "GNU chroot is needed (coreutils)"
		enter user "$@"
		;;
	export)
		shift
		[ $# -gt 0 ] || die "укажи имена программ" "give program names"
		for n in "$@"; do
			valid_name "$n" || die "плохое имя: $n" "bad name: $n"
			found=""
			for d in /usr/local/bin /usr/bin /usr/sbin /usr/local/sbin; do
				[ -x "$BOX$d/$n" ] && found=1 && break
			done
			[ -n "$found" ] || die "в боксе нет программы $n" "no program $n in the box"
			if [ -e "/usr/local/bin/$n" ] && ! grep -q "^$MARK" "/usr/local/bin/$n" 2>/dev/null; then
				die "/usr/local/bin/$n уже есть и это не наша обёртка" "/usr/local/bin/$n exists and is not our wrapper"
			fi
			printf '#!/bin/sh\n%s\nexec /usr/local/bin/cloudpkg run %s "$@"\n' "$MARK" "$n" > "/usr/local/bin/$n"
			chmod 755 "/usr/local/bin/$n"
			t "готово: $n" "done: $n"
		done
		;;
	unexport)
		shift
		[ $# -gt 0 ] || die "укажи имена программ" "give program names"
		for n in "$@"; do
			valid_name "$n" || die "плохое имя: $n" "bad name: $n"
			if [ -f "/usr/local/bin/$n" ] && grep -q "^$MARK" "/usr/local/bin/$n" 2>/dev/null; then
				rm -f "/usr/local/bin/$n"
				t "убрано: $n" "removed: $n"
			else
				t "не наша обёртка или нет файла: $n" "not our wrapper or no such file: $n"
			fi
		done
		;;
	self-update)
		command -v curl >/dev/null 2>&1 || die "нужен curl" "curl is needed"
		curl -fsSL "$INSTALL_URL" | sh -s -- --update
		;;
	*)
		enter root /usr/bin/cloudpkg "$@"
		;;
esac
