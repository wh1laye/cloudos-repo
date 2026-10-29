cloudpkg: пакетный менеджер cloudos. написан на c, собирает пакеты из исходников через portage (рецепты gentoo).

## установка одной командой

    curl -fsSL https://raw.githubusercontent.com/wh1laye/cloudos-repo/main/cloudpkg/install.sh | sh

скрипт сам определяет систему (нужен x86_64 и root, sudo или doas подставится сам):

- в cloudos: собирает cloudpkg и ставит portage прямо в систему.
- на любом другом дистрибутиве (arch, debian, ubuntu, fedora, opensuse, void, alpine): систему не трогает. скачивает stage 3 cloudos, проверяет sha256, кладёт в `/var/lib/cloudpkg/box` и ставит cloudpkg туда. в `/usr/local/bin` появляется только скрипт `cloudpkg`, который заходит в бокс. недостающие утилиты (curl, tar, xz, util-linux) скрипт доставит менеджером пакетов хоста. нужно 4 гб свободного места.

почему бокс, а не прямо в систему: portage пишет в `/usr`, там же лежат файлы pacman, apt и dnf. на чужом дистрибутиве это ломает его менеджер пакетов. в боксе пакеты живут отдельно, а хост остаётся как был. бокс разделяет файлы, это не песочница: сборки идут от root внутри chroot.

## использование

    cloudpkg sync               обновить дерево рецептов
    cloudpkg install nano       собрать и поставить
    cloudpkg install -p nano    пробный запуск, ничего не меняет
    cloudpkg remove nano
    cloudpkg upgrade
    cloudpkg clean
    cloudpkg search строка
    cloudpkg info nano
    cloudpkg list
    cloudpkg doctor

только в боксе (на чужом дистрибутиве):

    cloudpkg run nano файл      запустить программу из бокса от своего пользователя
    cloudpkg export nano        сделать команду nano доступной на хосте как обычную
    cloudpkg unexport nano
    cloudpkg shell              оболочка root внутри бокса
    cloudpkg exec команда       команда от root внутри бокса
    cloudpkg self-update        обновить cloudpkg, бокс и пакеты остаются
    cloudpkg where              путь к боксу

удалить всё: `rm -rf /var/lib/cloudpkg /usr/local/bin/cloudpkg` (и обёртки, сделанные через export).

## переменные установщика

- `CLOUDPKG_BOX`: путь бокса (по умолчанию /var/lib/cloudpkg/box)
- `CLOUDPKG_MODE`: auto, box или native (параметры `--box`, `--native`)
- `CLOUDPKG_STAGE3`: ссылка или путь к файлу stage 3 (если github медленный, скачай файл сам)
- `CLOUDPKG_SRC`: папка cloudpkg с исходниками (по умолчанию берутся с github)
- `CLOUDPKG_PIPS`: адреса индекса pypi через пробел (для meson и исходников portage)
- `CLOUDPKG_HOST_CA=0`: не подставлять сертификаты хоста в бокс

## файлы

- `install.sh`: установка одной командой, работает в любом дистрибутиве (sh)
- `cloudpkg-setup.sh`: настройка внутри cloudos или бокса: portage, cloudpkg, дерево рецептов
- `cloudpkg-box.sh`: скрипт для хоста, входит в бокс (монтирует dev, proc, sys в отдельном пространстве имён и делает chroot)
- `cloudpkg.c`, `Makefile`: сама программа
- `overlay/`: рецепты cloudos, копируются в `/var/db/repos/cloudos` при каждой установке
- `etc/cloudpkg.conf`: зеркала, запасной канал для дерева, пути, профиль
- `etc/portage/make.conf`, `repos.conf/gentoo.conf`: настройки portage
- `etc/portage/profile/package.provided`: пакеты, собранные вручную в lfs (portage их не пересобирает)

## что cloudpkg делает сам (0.4)

- короткое имя из нескольких категорий (`jq`, `git`, `mc`) он выбирает сам и пишет, что выбрал и что ещё есть.
- пакет только в testing (`~amd64`) разрешается автоматически, как и нужные для него флаги use.
- нет дерева рецептов: `install`, `upgrade`, `search` и `info` сами делают `sync`.
- сборка не удалась: показывается хвост лога сборки и что проверить.
- `upgrade` обновляет только то, что поставил ты (набор `@selected`), а не всю базу gentoo.
- оверлей cloudos (`/var/db/repos/cloudos`) даёт рецепты, которых нет в gentoo или которые там слишком тяжёлые. `limine` ставится готовым бинарным релизом без llvm.

## как это устроено

- portage берётся не из pip-колеса (оно собрано как «модуль»: ищет настройки в `/usr/etc` и ставило бы пакеты в `/usr/usr`), а собирается из исходников с `-Dsystem-wide=true`, как в gentoo.
- дерево рецептов качается снимком с зеркал из `cloudpkg.conf`. если ни одно не ответило, берётся запасной канал: зеркало gentoo на github.
- ссылка `/etc/portage/make.profile` ставится сама после `cloudpkg sync`.
- `make conf` не затирает твои настройки: если файл уже есть и отличается, новый вариант кладётся рядом с суффиксом `.dist`.
- cloudpkg отказывается ставить пакеты в `/`, если система не cloudos (защита от случайной поломки хоста). обойти можно через `CLOUDPKG_FORCE=1`.
