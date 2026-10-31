# changelog

## 1.3 (stage 3 и cloudpkg 0.7)

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
