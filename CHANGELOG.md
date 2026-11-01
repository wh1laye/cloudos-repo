# changelog

## 1.4, безопасность (не выпущено)

новое:

- `tools/stage3/nftables.conf`, `nftables.initd`, `nftables.local`: фаервол nftables включён по умолчанию (input и forward drop, output accept, icmp с лимитом, dhcp, лог отброшенного в `nft-drop:`), свои правила в `/etc/nftables.d/*.nft`
- `tools/stage3/cloudos-firewall`: `status`, `check`, `reload`, `on`, `off`, `list`, `allow`, `remove`, `log`. порт и адрес проверяются строго, плохое правило откатывается
- `tools/stage3/cloudos-audit`: проверка системы (фаервол, sysctl, пустые пароли, uid 0, setuid, слушающие порты, sshd), код выхода 1 при ошибках
- `tools/stage3/sysctl-cloudos.conf`: kptr_restrict, dmesg_restrict, protected_*, rp_filter, syncookies и другое
- `tools/stage3/sshd-cloudos.conf`: root по ssh закрыт, MaxAuthTries 3, без X11 и проброса
- `tools/test-firewall.sh`: проверка фаервола в изолированном netns, запускается в github actions

изменения:

- `build-inside.sh`: шаг `firewall` (ставит `net-firewall/nftables`), проверки в `do_verify`
- `cloudos-users.sh`: UMASK 027, HOME_MODE 0750, LOGIN_RETRIES, rounds для sha512, `su` только для wheel (pam_wheel)
- `mkiso-inside.sh`: ядро с nf_tables и харденингом, cmdline с `slab_nomerge init_on_alloc=1 page_alloc.shuffle=1 randomize_kstack_offset=on vsyscall=none`
- `mkiso.sh`: проверка gpg-подписи ядра (`KERNEL_GPG=auto|1|0`)
- `cloudpkg.c`: путь лога с кавычкой или переводом строки не уходит в `system()`
- workflows: `persist-credentials: false`, проверка `version` и `kernel`, данные из inputs только через env, проверка фаервола в stage3, проверка nftables в smoke iso
- документация: в stage3 нет iptables в списке пакетов, поэтому упоминания iptables заменены на nftables

## 1.3, живой iso

новое:

- `tools/mkiso.sh`, `tools/iso/mkiso-inside.sh`, `tools/iso/init`: сборка гибридного iso (bios и uefi) на limine из stage 3. ядро собирается из исходников kernel.org, initramfs свой (без dracut), корень это squashfs из stage 3 с overlay в tmpfs
- `.github/workflows/iso.yml`: сборка iso в github actions, проверочная загрузка в qemu, выкладывание `cloudos-live-amd64-1.3.iso` и `.sha256` в релиз `1.3`. `docs/` не затрагивается

## 1.3, сайт и справочник

- версия 1.3 везде: `docs/index.html`, справочник (ru и en), мастер установки, страница пакетов, страница stage 3, имена файлов и ссылки на релиз `1.3`
- в stage 3 1.3 есть `openssh`, `iptables`, `man-db`, `man-pages`, `rsync`, `wget`, `gnupg`, `iputils`, `net-tools`, а на сайте и в `README.md` было написано, что ssh-сервера, фаервола и man-страниц нет. исправлено в `README.md`, `docs/index.html`, справочнике (разделы 1.2, 1.3, 13 и вопрос про man, ru и en). sshd и фаервол установлены, но выключены, как их включить написано в главе 13
- `docs/packages/packages.json`: добавлены пакеты из stage 3 1.3
- `docs/news`, `docs/rss.xml`, `docs/i18n.js`: запись про 1.3
- `docs/sitemap.xml`: адреса вели на старый домен `cloudos-repo.pages.dev`, теперь `https://wh1laye.github.io/cloudos-repo/`, добавлен `lastmod`
- `docs/stage3/stage3.js`: карта берётся из `docs/stage3/map.json`, если файла нет, из релиза `1.3`

## 1.3 (stage 3 и cloudpkg 0.7), правка 2

исправлено (шаг gentoo-stage3-set, упали `dev-util/debugedit` и `net-mail/mailbase`, `STRICT=1` остановил сборку):

- `build-inside.sh`: новый шаг `elfutils`. `dev-libs/elfutils` был в `package.provided`, но `libdw.pc` нет, поэтому у `debugedit` configure падал с `Package 'libdw' not found`. шаг проверяет `pkg-config --exists libdw`, если нет, убирает запись из `package.provided`, ставит настоящий elfutils через cloudpkg и снова проверяет `libdw`
- `build-inside.sh`: новый шаг `maildir` (`fix_maildir`). в lfs `/var/mail` каталог, а `mailbase-1.8.1` ставит `/var/mail -> spool/mail`, portage запрещает такую коллизию (PMS 13.4). шаг переносит почту в `/var/spool/mail` и делает `/var/mail` симлинком. `apply_fix` вызывает его сам, если в логе коллизия на `/var/mail`

### правка 1

исправлено (шаг pam, `dev-python/more-itertools`: `python_setup: no enabled implementation satisfy requirements`):

- `build-inside.sh`: новый шаг `python-vdb` после `autotools-vdb`. `has_version` в eclass `python-utils-r1` не видит `package.provided`, поэтому python 3.13 из lfs считался не установленным и `python_setup` не находил ни одной реализации. шаг записывает `dev-lang/python-<версия>` (slot `3.13`, флаги `USE` определяются проверкой импорта модулей: ssl, sqlite, readline, xml, gdbm, ncurses, threads, ensurepip) в `/var/db/pkg` с файлом `CLOUDOS_STUB`, потом проверяет `portageq has_version / dev-lang/python:3.13` и `python3_13` в `make.conf`

исправлено (stage 3, сборка падала без причины в логе):

- `build-inside.sh`: описанные ниже `s3log/step-имя.log`, `trap` с `::error::` и хвостом лога на самом деле отсутствовали в скрипте, теперь они есть: `set -E`, `trap ERR`, каждый шаг пишет в `s3log/step-имя.log`
- `build-inside.sh`: функция `mk`: `make -jN` упал, повтор `-j1 V=1` (ivykis, syslog-ng, libburn, libisofs, libisoburn, squashfs-tools)
- `build-inside.sh`: syslog-ng собирается с `--disable-example-modules --disable-stackdump`, меньше кода, меньше шансов упасть на gcc 15

исправлено (сборка stage 3 в github actions, ошибка без причины в логе):

- `cloudpkg.c`: буфер в `put()` был `BUF` (600) под путь `dir/name`, gcc 15 в chroot давал `-Wformat-truncation` на каждую запись stub. буфер `BUF + 64`, сборка проходит с `-Wall -Wextra -Werror`
- `build-inside.sh`: каждый шаг пишет вывод в `s3log/step-имя.log`, при падении `trap` печатает `::error::`, последние 80 строк шага и строки с `error:`/`Error N`/`No such file`
- `build-inside.sh`: `make -jN` упал, повтор с `-j1 V=1`: параллельный вывод прятал настоящую ошибку, заодно лечит гонки в libisoburn и syslog-ng
- `build-inside.sh`: шаг `limine` перенесён после `autotools-vdb`: раньше `cloudpkg sync` и `install limine` шли до `package.provided`, `machinery` и записи autotools, и portage мог начать собирать gentoo-functions и app-alternatives
- зеркала дерева portage: первым `distfiles.gentoo.org`, китайские в конце (с runner github они медленные, `--speed-limit` рвал каждое по 30 секунд). pypi для сборки portage: первым `pypi.org`
- workflow: весь вывод сборки пишется в `build.log`, в summary идёт блок "где упало", `build.log` лежит в артефакте `s3log-версия` даже при падении

исправлено (сборка stage 3 через github actions, падали 9 пакетов):

- `sys-libs/pam` убран из `package.provided`: в lfs shadow собран без pam, настоящего pam нет, но portage считал его установленным. из-за этого не было `security/pam_appl.h`, и падали `sys-auth/passwdqc` (compile), `sys-auth/pambase`, `net-misc/openssh` и `net-mail/mailbase`. новый шаг `pam` ставит настоящий pam через cloudpkg и проверяет `pam_appl.h` и `libpam.so`
- `sys-libs/timezone-data`: архив `.tar.lz`, а `lzip` в lfs нет, unpacker падал с `-dc: command not found`. новый шаг `lzip` ставит `app-arch/lzip` и проверяет распаковку своего архива
- сборка: список упавших пакетов теперь содержит строки причины (`fatal error`, `No such file`...) из `build.log`, а `failed.txt` сохраняется и когда сборка оборвалась, поэтому причина видна в summary github actions без скачивания логов
- cloudpkg: `package.provided` без `sys-libs/pam`
- `sys-libs/pam` тянет docbook, а у `app-text/build-docbook-catalog` падал postinst (`getopt-long: command not found`), из-за чего `--keep-going` выкидывал сам pam. сборка ставит обёртку `/usr/bin/getopt-long` над `getopt` до шагов `pam` и `lzip`, а `apply_fix` ставит её сам при такой ошибке и повторяет пакет

исправлено:

- `cloudos-noreconf`: хук убран совсем. сборки падали в фазе prepare с `Cannot find the latest automake!`, потому что `has_version` в portage не видит `package.provided`, и eclass autotools считал, что automake нет, хотя он собран в lfs. отключать autoreconf было неправильно: у части пакетов (libuv) в архиве нет `configure`, его надо генерировать
- cloudpkg 0.7 записывает autoconf, automake и libtool из lfs в `/var/db/pkg` (с настоящими версиями и слотами, `dev-build/*` с файлом `CLOUDOS_STUB`). делается само перед каждым `sync`, `install` и после `clean`, настоящие пакеты из portage не затираются
- cloudpkg при установке сам убирает хуки `cloudos-noreconf` (файл и копии в `/etc/portage/env/категория/пакет` уходят в `.bak`) и строки про него из `package.env`
- сборка: шаг `cloudpkg-0.7` вместо `cloudpkg-0.6` (при `RESUME=1` старый шаг пропускался)
- сборка: шаг `autotools-vdb` проверяет `portageq has_version` для autoconf, automake и libtool до установки пакетов, при ошибке сборка падает сразу, а не через час
- сборка: не применённые обновления конфигов (`._cfg0000_*`) убираются, а не уезжают в архив
- `packages.txt`: записи lfs больше не считаются установленными через portage
- `neofetch`: версия берётся из `/etc/os-release`, а не зашита в скрипт
- `install.sh` скачивает stage 3 версии 1.3

новое:

- `cloudpkg vdb`: показывает и чинит записи autotools в базе установленных
- `cloudpkg doctor`: проверяет хуки в `/etc/portage/env`, `package.env` и autotools в базе
- `cloudpkg`: при ошибке `Cannot find the latest automake` подсказывает `cloudpkg vdb`
- `cloudos-fix`: чинит систему 1.2 одной командой, ставится в `/usr/sbin`
- `tools/test-cloudpkg.sh`: проверка очистки хуков и записи autotools на временном корне (без portage)
- проверка архива: нет `cloudos-noreconf`, есть записи autotools и `cloudos-fix`
- github actions: по умолчанию `strict` включён, перед сборкой идут `bash -n`, сборка cloudpkg с `-Wextra -Werror` и тест, в конце карта размеров `cloudos-stage3-amd64-1.3.map.json` и список упавших пакетов в summary

как починить систему на 1.2 без пересборки:

    mv /etc/portage/env/cloudos-noreconf /etc/portage/env/cloudos-noreconf.bak && cloudpkg sync
    curl -fsSL https://raw.githubusercontent.com/wh1laye/cloudos-repo/main/tools/stage3/cloudos-fix.sh | bash

первая команда убирает сломанный файл. её одной мало: строка в `package.env` и копии хука для пакетов остаются, и установка libuv по-прежнему падает. вторая команда убирает их, ставит cloudpkg 0.7 и записывает autotools в базу установленных.

## 1.2 (stage 3 и cloudpkg 0.6)

ошибки пакетного менеджера в версии 1.2: ошибка синтаксиса в `/etc/portage/env/cloudos-noreconf`, установка libuv падает с `Cannot find the latest automake`. исправлено в 1.3, обход для 1.2 описан выше.

исправлено:

- useradd: `/usr/sbin` теперь в PATH у всех (`/etc/profile.d/cloudos-path.sh`, `ENV_PATH` и `ENV_SUPATH` в `login.defs`), если shadow не установлен, сборка ставит его через cloudpkg
- версия в `/etc/os-release` и `/etc/issue` обновляется с любой прошлой версии, не только с 1.0

новое:

- `neofetch`: команда на чистом bash с облаком cloudos, память и диск с полосками, `--ff` запускает fastfetch, `--plain` без цветов
- fastfetch: строки init, cloudpkg и locale
- `cloudos-users`: проверяет и чинит вход и пользователей, безопасно запускать повторно
- `cloudos-adduser имя`: пользователь с домашней папкой, группой wheel и паролем
- шаблон `/etc/skel` с цветным приглашением, `/etc/doas.conf` (`permit persist :wheel`)
- в stage 3 нет пользователей и пароля root: их задаёт сам человек при установке
- проверка сборки теперь смотрит setuid, группу wheel, useradd в PATH обычного входа и неработающие библиотеки

как починить систему на 1.1 без пересборки:

    mv /etc/portage/env/cloudos-noreconf /etc/portage/env/cloudos-noreconf.bak && cloudpkg sync
    curl -fsSL https://raw.githubusercontent.com/wh1laye/cloudos-repo/main/tools/stage3/cloudos-users.sh | bash

первая команда убирает сломанный файл, вторая настраивает pam, su и пользователей.

## 1.1

ошибки пакетного менеджера в версии 1.1: ошибка синтаксиса в `/etc/portage/env/cloudos-noreconf`. исправлено в 1.2, обход для 1.1 описан выше.
