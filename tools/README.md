# tools

## build-stage3.sh

собирает stage 3 cloudos из предыдущего stage 3 одной командой (нужен root, x86_64, около 10 гб места):

    sudo tools/build-stage3.sh

результат в `$OUT` (по умолчанию текущая папка):

- `cloudos-stage3-amd64-1.3.tar.xz` и `.sha256`: сам архив
- `cloudos-stage3-amd64-1.3.packages.txt`: состав (что собрано вручную и что поставлено через cloudpkg)
- `cloudos-stage3-amd64-1.3.failed.txt`: появляется, только если какой-то пакет не собрался

что внутри: cloudpkg 0.7 и portage, openrc, limine, syslog-ng вместо sysklogd, xorriso, squashfs-tools, mtools, fastfetch с облаком cloudos и все пакеты из stage 3 gentoo (кроме portage и того, что привязано к gentoo, см. `stage3/gentoo-exclude.txt`).

переменные:

- `BASE`: ссылка или путь к прошлому stage 3
- `VERSION`: версия (по умолчанию 1.3)
- `WORK`: рабочая папка (на github actions `/mnt/stage3`)
- `OUT`: куда положить результат
- `REFRESH_LIST=1`: перед сборкой взять список пакетов из настоящего stage 3 gentoo (нужна сеть, качается около 250 мб); если не вышло, берётся `stage3/gentoo-stage3.list`
- `RESUME=1`: продолжить прерванную или неудавшуюся сборку в той же рабочей папке, не распаковывая базу заново (готовые шаги пропускаются)
- `STRICT=1`: остановить сборку, если хоть один пакет не собрался (при запуске руками по умолчанию пакет пишется в отчёт и сборка идёт дальше, в github actions `strict` включён)

исходники скачиваются с github и из архива ubuntu, их sha256 записаны в `stage3/SOURCES.txt` и сверяются. сборка идёт шагами с отметками, поэтому прерванный запуск можно повторить, готовое не пересобирается. в конце сборка сама проверяет корень (есть ли `/sbin/init` на openrc-init, syslog-ng, fastfetch, cloudpkg, конфиг syslog-ng проходит `-s`) и показывает fastfetch в логе. после упаковки проверяет, что нужные файлы попали в архив.

### сборка на github (без своей машины)

вкладка Actions, workflow `stage3`, Run workflow. он собирает архив на сервере github и кладёт файлы в релиз `1.3`, откуда их берёт `cloudpkg/install.sh`. на одном ядре сборка идёт часами, на сервере с 4 ядрами заметно быстрее.

## mkiso.sh

собирает живой iso cloudos (bios и uefi, загрузчик limine) из stage 3 (нужен root, x86_64, около 15 гб места):

    sudo tools/mkiso.sh

результат в `$OUT`: `cloudos-live-amd64-1.3.iso` и `.sha256`.

как собирается: stage 3 распаковывается в chroot, внутри собирается ядро (`linux-$KVER` с kernel.org, sha256 сверяется с `sha256sums.asc`), свой минимальный initramfs (`iso/init`, без dracut: ищет носитель с `cloudos/rootfs.squashfs`, монтирует squashfs, кладёт поверх overlay в tmpfs, `switch_root`), squashfs (xz) из самого stage 3, затем гибридный iso через xorriso и `limine bios-install`. меню limine: обычная загрузка, serial console, rescue shell в initramfs (`cloudos.shell`).

переменные:

- `BASE`: ссылка или путь к stage 3 (по умолчанию релиз `$VERSION` этого репозитория)
- `VERSION`: версия (по умолчанию 1.3)
- `KVER`: версия ядра (по умолчанию 6.18.10)
- `WORK`: рабочая папка
- `OUT`: куда положить результат

на live-системе вход на tty1 автоматический под root, пароля нет, включены udev, dhcpcd и syslog-ng.

### сборка iso на github

вкладка Actions, workflow `iso`, Run workflow. берёт stage 3 из релиза `1.3`, собирает iso, проверяет загрузку в qemu (результат в summary, на публикацию не влияет) и кладёт `.iso` и `.sha256` в релиз `1.3`. `docs/` workflow не трогает.

## iso/

- `mkiso-inside.sh`: сборка внутри chroot (ядро, initramfs, настройка live, squashfs, iso, проверка загрузочных записей)
- `init`: `/init` внутри initramfs

## stage3/

- `build-inside.sh`: сборка внутри chroot (пакеты, замена sysklogd на syslog-ng, весь набор gentoo stage 3, проверка корня)
- `gentoo-stage3.list`: пакеты из stage 3 gentoo. то, что уже есть в базе или в package.provided, пропускается
- `gentoo-exclude.txt`: что из gentoo не берём и почему (portage, eselect, sysvinit и другие фишки gentoo)
- `refresh-list.sh`: пересобирает `gentoo-stage3.list` из настоящего stage 3 gentoo (amd64 openrc)
- `SOURCES.txt`: имя, sha256 и ссылка каждого исходника
- `syslog-ng.initd`, `syslog-ng.confd`, `syslog-ng.conf`: файлы openrc из дерева gentoo (gpl-2)
- `neofetch`: команда `neofetch` на чистом bash с облаком cloudos, без зависимостей (`neofetch --ff` запускает fastfetch, `--plain` без логотипа и цветов)
- `cloudos-users.sh`: ставится как `/usr/sbin/cloudos-users`. настраивает вход и пользователей: pam (только если shadow собран с ним), setuid на su и passwd, login.defs, PATH с sbin для всех, /etc/skel, группа wheel, doas.conf. безопасно запускать повторно, на живой системе 1.1 тоже
- `cloudos-adduser`: `cloudos-adduser имя` создаёт пользователя с домашней папкой, группой wheel и паролем
- `cloudos-fix.sh`: ставится как `/usr/sbin/cloudos-fix`. чинит систему 1.2: убирает хуки `cloudos-noreconf` и строки про них в `package.env`, обновляет cloudpkg и записывает autotools в базу установленных. `--files` только убирает файлы, без сети
- `fastfetch.jsonc`: настройка fastfetch, по умолчанию облако в пяти оттенках голубого для любого терминала
- `fastfetch-truecolor.jsonc`, `fastfetch-image.jsonc`: то же облако плавным градиентом (truecolor) и картинкой для терминалов с показом изображений. запуск: `fastfetch -c /usr/share/cloudos/fastfetch-truecolor.jsonc` или `fastfetch -c /usr/share/cloudos/fastfetch-image.jsonc`
- `logo.png`, `logo.txt`, `logo.ansi`, `make-logo.py`: логотип с сайта и скрипт, который делает из него текстовые варианты (нужен pillow)

## фаервол и безопасность

- `stage3/nftables.conf`: основные правила, `/etc/nftables.conf`. свои правила: `/etc/nftables.d/*.nft`
- `stage3/cloudos-firewall`: `cloudos-firewall allow ssh`, `allow tcp/8080 from 10.0.0.0/8`, `remove ssh`, `status`, `list`, `log`, `check`, `reload`
- `stage3/cloudos-audit`: проверка системы, `0` если ошибок нет
- `stage3/sysctl-cloudos.conf`: `/etc/sysctl.d/90-cloudos.conf`
- `stage3/sshd-cloudos.conf`: `/etc/ssh/sshd_config.d/10-cloudos.conf`
- `test-firewall.sh`: проверка в изолированном netns (нужны root и nft)
- `KERNEL_GPG` для `mkiso.sh`: `auto` проверяет подпись ядра и ругается, `1` останавливает сборку при любой неудаче, `0` отключает

## test-cloudpkg.sh

проверка cloudpkg на временном корне, без portage (нужен root и gcc): очистка хуков и `package.env`, запись autotools со слотами, повторный запуск, настоящий пакет не затирается, `cloudos-fix --files`. запускается в github actions перед сборкой:

    sudo tools/test-cloudpkg.sh

## stage3-map.py

карта содержимого stage 3.
