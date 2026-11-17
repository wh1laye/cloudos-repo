# AGENTS.md — как устроен репозиторий

## Структура

- `cloudpkg/` — собственный пакетный менеджер на C: парсер рецептов
  `.cpr`, сборка из исходников, база файлов, мир-сет, снимки btrfs,
  самообновление. Рецепты — отдельный репозиторий `cloudpkg-recipes`.
- `tools/` — сборка stage 3, iso и ядра cloudk, тесты.
- `tools/stage3/` — сборка внутри chroot: `build-inside.sh` ставит
  пакеты через `cloudpkg` по списку `cloudos-packages.list`,
  исходники сверяются по `SOURCES.txt`.
- `tools/kernel/` — сборка ядра: `build-cloudk.sh`, конфиг
  `cloudk.config`, наши патчи в `patches/`.
- `tools/iso/` — live iso: `cloudos-install`, `cloudos-uki`,
  `cloudos-tpm2`, `cloudos-secureboot`, dracut-модуль для tpm2.
- `docs/` — сайт и справочник (статика на GitHub Pages).
- `.github/workflows/` — CI: ядро, stage 3, iso, релиз пакетника.

## Сборка

- `tools/build-stage3.sh` → chroot → `tools/stage3/build-inside.sh`.
  Нужны root, x86_64, ~10 ГБ. База — предыдущий stage 3 из релизов,
  версии задаются `VERSION`/`BASE_VERSION`, подпись проверяется
  ключом `docs/cloudos.pub`.
- `tools/mkiso.sh` собирает live iso поверх stage 3 и ядра cloudk.
- `tools/kernel/build-cloudk.sh` собирает ядро, модули и конфиг,
  отдаёт их в формате, который ждёт `mkiso.sh`.

## Пакетник

- `cloudpkg/install.sh` ставит пакетник: в CloudOS — в систему,
  на чужом дистрибутиве — только в изолированный бокс
  `/var/lib/cloudpkg/box`. `make install` отказывается ставить
  бинарник в систему, если это не CloudOS (кроме DESTDIR).
- `cloudpkg sync` качает дерево рецептов с ветки master репозитория
  рецептов по HTTPS, при наличии подписи проверяет её.
- База установленных пакетов: `/var/db/cloudpkg/installed`,
  мир-сет: `/var/db/cloudpkg/world`, кэш исходников:
  `/var/cache/cloudpkg/distfiles`, сборка: `/var/tmp/cloudpkg-build`.

## Тесты

- `tools/test-cloudpkg.sh` — сборка и функциональные проверки
  пакетника во временной папке.
- `tools/test-stage3-gate.sh` — проверка архива stage 3 на полноту
  и на отсутствие чужих пакетных менеджеров.
- `tools/test-snapshots.sh` — снимки btrfs.

## Лицензия

Код проекта — MIT. Рецепты — лицензия проекта. Подробности в
`NOTICE`.
