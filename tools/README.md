# tools

## build-stage3.sh

собирает stage 3 cloudos из предыдущего stage 3 одной командой (нужен root, x86_64, около 10 гб места):

    sudo tools/build-stage3.sh

результат в `$OUT` (по умолчанию текущая папка):

- `cloudos-stage3-amd64-1.2.tar.xz` и `.sha256`: сам архив
- `cloudos-stage3-amd64-1.2.packages.txt`: состав (что собрано вручную и что поставлено через cloudpkg)
- `cloudos-stage3-amd64-1.2.failed.txt`: появляется, только если какой-то пакет не собрался

что внутри: cloudpkg 0.6 и portage, openrc, limine, syslog-ng вместо sysklogd, xorriso, squashfs-tools, mtools, fastfetch с облаком cloudos и все пакеты из stage 3 gentoo (кроме portage и того, что привязано к gentoo, см. `stage3/gentoo-exclude.txt`).

переменные:

- `BASE`: ссылка или путь к прошлому stage 3
- `VERSION`: версия (по умолчанию 1.2)
- `WORK`: рабочая папка (на github actions `/mnt/stage3`)
- `OUT`: куда положить результат
- `REFRESH_LIST=1`: перед сборкой взять список пакетов из настоящего stage 3 gentoo (нужна сеть, качается около 250 мб); если не вышло, берётся `stage3/gentoo-stage3.list`
- `RESUME=1`: продолжить прерванную или неудавшуюся сборку в той же рабочей папке, не распаковывая базу заново (готовые шаги пропускаются)
- `STRICT=1`: остановить сборку, если хоть один пакет не собрался (по умолчанию пакет пишется в отчёт и сборка идёт дальше)

исходники скачиваются с github и из архива ubuntu, их sha256 записаны в `stage3/SOURCES.txt` и сверяются. сборка идёт шагами с отметками, поэтому прерванный запуск можно повторить, готовое не пересобирается. в конце сборка сама проверяет корень (есть ли `/sbin/init` на openrc-init, syslog-ng, fastfetch, cloudpkg, конфиг syslog-ng проходит `-s`) и показывает fastfetch в логе. после упаковки проверяет, что нужные файлы попали в архив.

### сборка на github (без своей машины)

вкладка Actions, workflow `stage3`, Run workflow. он собирает архив на сервере github и кладёт файлы в релиз `1.2`, откуда их берёт `cloudpkg/install.sh`. на одном ядре сборка идёт часами, на сервере с 4 ядрами заметно быстрее.

## stage3/

- `build-inside.sh`: сборка внутри chroot (пакеты, замена sysklogd на syslog-ng, весь набор gentoo stage 3, проверка корня)
- `gentoo-stage3.list`: пакеты из stage 3 gentoo. то, что уже есть в базе или в package.provided, пропускается
- `gentoo-exclude.txt`: что из gentoo не берём и почему (portage, eselect, sysvinit и другие фишки gentoo)
- `refresh-list.sh`: пересобирает `gentoo-stage3.list` из настоящего stage 3 gentoo (amd64 openrc)
- `SOURCES.txt`: имя, sha256 и ссылка каждого исходника
- `syslog-ng.initd`, `syslog-ng.confd`, `syslog-ng.conf`: файлы openrc из дерева gentoo (gpl-2)
- `neofetch`: команда `neofetch` на чистом bash с облаком cloudos, без зависимостей (`neofetch --ff` запускает fastfetch, `--plain` без логотипа и цветов)
- `cloudos-users.sh`: ставится как `/usr/sbin/cloudos-users`. настраивает вход и пользователей: pam (system-auth, login, su, doas, passwd), setuid на su и passwd, login.defs, PATH с sbin для всех, /etc/skel, группа wheel, doas.conf. безопасно запускать повторно, на живой системе 1.1 тоже
- `cloudos-adduser`: `cloudos-adduser имя` создаёт пользователя с домашней папкой, группой wheel и паролем
- `fastfetch.jsonc`: настройка fastfetch, по умолчанию облако в пяти оттенках голубого для любого терминала
- `fastfetch-truecolor.jsonc`, `fastfetch-image.jsonc`: то же облако плавным градиентом (truecolor) и картинкой для терминалов с показом изображений. запуск: `fastfetch -c /usr/share/cloudos/fastfetch-truecolor.jsonc` или `fastfetch -c /usr/share/cloudos/fastfetch-image.jsonc`
- `logo.png`, `logo.txt`, `logo.ansi`, `make-logo.py`: логотип с сайта и скрипт, который делает из него текстовые варианты (нужен pillow)

## stage3-map.py

карта содержимого stage 3.
