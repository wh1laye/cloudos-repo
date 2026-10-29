# tools

## build-stage3.sh

собирает stage 3 cloudos из предыдущего stage 3 одной командой (нужен root, x86_64, около 6 гб места):

    sudo tools/build-stage3.sh

результат: `cloudos-stage3-amd64-1.1.tar.xz` и `.sha256` в текущей папке. что внутри: cloudpkg и portage, limine, syslog-ng вместо sysklogd, xorriso, squashfs-tools, mtools, fastfetch с логотипом cloudos.

переменные: `BASE` (ссылка или путь к прошлому stage 3), `VERSION` (по умолчанию 1.1), `WORK` (рабочая папка), `OUT` (куда положить результат).

исходники скачиваются с github и из архива ubuntu, их sha256 записаны в `stage3/SOURCES.txt` и сверяются. сборка идёт шагами с отметками, поэтому прерванный запуск можно повторить, готовое не пересобирается. на одном ядре это 1-2 часа, на 8 ядрах около 15 минут.

после сборки залей оба файла в релиз `1.1` на github: `cloudpkg/install.sh` уже берёт stage 3 версии 1.1.

## stage3/

- `build-inside.sh`: сборка внутри chroot (пакеты, замена sysklogd на syslog-ng, список package.provided)
- `SOURCES.txt`: имя, sha256 и ссылка каждого исходника
- `syslog-ng.initd`, `syslog-ng.confd`, `syslog-ng.conf`: файлы openrc из дерева gentoo (gpl-2)
- `fastfetch.jsonc`: настройка fastfetch, по умолчанию цветной логотип для любого терминала
- `fastfetch-truecolor.jsonc`, `fastfetch-image.jsonc`: то же облако в truecolor и картинкой для терминалов с показом изображений. запуск: `fastfetch -c /usr/share/cloudos/fastfetch-image.jsonc`
- `logo.png`, `logo.txt`, `logo.ansi`, `make-logo.py`: логотип с сайта и скрипт, который делает из него текстовые варианты (нужен pillow)

## stage3-map.py

карта содержимого stage 3.
