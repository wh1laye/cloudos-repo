# CLAUDE.md — контекст для работы с репозиторием

## Проект

CloudOS — собственный дистрибутив на базе LFS: glibc, openrc,
limine, своё ядро. Пакеты собираются из исходников собственным
пакетным менеджером `cloudpkg` без чужих движков.

## Пакетник (обязательно прочитать перед правкой)

- Язык: C, стандарт gnu17, жёсткие флаги в `cloudpkg/Makefile`
  (-Wall -Wextra -Wsign-conversion -Wformat=2, PIE, RELRO,
  stack protector, FORTIFY_SOURCE=3).
- Модули: `cloudpkg.c` (точка входа), `util.c` (конфиг, процессы,
  сеть), `lock.c` (flock), `recipe.c` (парсер .cpr, поиск по
  дереву, зависимости), `db.c` (база установленных, мир-сет,
  обратные зависимости), `build.c` (загрузка, фазы, конфликты,
  установка), `cmds.c` (команды), `snap.c` (снимки btrfs),
  `update.c` (самообновление с minisign).
- Формат рецепта: ключи PACKAGE, VERSION, DESCRIPTION, HOMEPAGE,
  LICENSE, SLOT, SRC_URI (с переименованием через `->`), DEPEND,
  RDEPEND, BUILD_FLAGS и фазы `src_prepare`, `src_configure`,
  `src_compile`, `src_install`, `pkg_preinst`, `pkg_postinst`,
  `pkg_prerm`, `pkg_postrm`. Для configure, cmake, meson и make
  есть фазы по умолчанию.
- Защита: установка в `/` только на CloudOS (проверка
  `/etc/os-release`, обход `CLOUDPKG_FORCE=1`), `--force` для
  конфликтов файлов, проверка путей в базе перед удалением,
  атомарная запись списков и меты через временные файлы.
- Пути: дерево рецептов `/var/db/repos/cloudpkg-recipes`, база
  `/var/db/cloudpkg/installed/<категория>/<имя>/<версия>`,
  мир-сет `/var/db/cloudpkg/world`, конфиг
  `/etc/cloudpkg/cloudpkg.conf`.

## Сборка системы

- `tools/build-stage3.sh` разворачивает предыдущий stage 3,
  копирует `tools/stage3` и `cloudpkg` в chroot и запускает
  `build-inside.sh`, который ставит пакеты через `cloudpkg`.
- `tools/mkiso.sh` собирает live iso: ядро cloudk, squashfs,
  limine для UEFI и BIOS.
- `tools/kernel/build-cloudk.sh` собирает ядро из исходников
  с проверкой подписи, применяет серию патчей и наш конфиг.

## Стилистика

- Вывод программ — английский. Документация и сайт — русский и
  английский через словари `docs/i18n.js`.
- В коде не оставлять чужих названий пакетных менеджеров и чужих
  дистрибутивов: у проекта свои рецепты и своя лицензия.
- Версии релизов: ядро — `cloudk-<версия>`, база —
  `cloudos-stage3-amd64-<версия>.tar.xz`, iso —
  `cloudos-live-amd64-<версия>.iso`.
