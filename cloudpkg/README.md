cloudpkg: пакетный менеджер cloudos. написан на c.

файлы:
- cloudpkg.c, Makefile: сама программа
- etc/cloudpkg.conf: зеркала и пути
- etc/portage/make.conf, repos.conf/gentoo.conf: настройки portage
- etc/portage/profile/package.provided: пакеты, собранные вручную в lfs (portage их не пересобирает)
- cloudpkg-setup.sh: автоустановка и настройка (отдельный скрипт)

установка в чистой системе (внутри cloudos, от root):

    bash cloudpkg-setup.sh

команды: sync, install, remove, upgrade, clean, search, info, list, doctor.
