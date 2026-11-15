# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## что это

CloudOS — самостоятельный Linux-дистрибутив на базе LFS. В репозитории три части: пакетный менеджер на C (`cloudpkg/`), bash-сборщики stage 3 / ядра / iso (`tools/`), статический сайт и handbook (`docs/`, GitHub Pages). Основной язык — русский.

## проверки

Перед изменениями и PR запускай то же, что CI:

```bash
make -C cloudpkg CC="gcc -Werror"
find . -name '*.sh' -not -path './.git/*' -print0 | xargs -0 shellcheck -S error
node tools/test-site.js
for t in cloudpkg snapshots forum update-sign hardening kernel-patches kernel-userspace stage3-gate; do
  sudo env "PATH=$PATH" bash "tools/test-$t.sh"
done
```

- C собирается с `-Wall -Wextra -Wsign-conversion -Wformat=2`; warning = ошибка.
- `test-cloudpkg` и `test-snapshots` требуют root. `test-firewall` запускается отдельно в `stage3.yml`, не в `ci.yml`.
- `node tools/test-verify.js` — тест `docs/verify/vcore.js`, запускай вручную.
- `make` кладёт бинарник в `cloudpkg/cloudpkg`; перед коммитом делай `make -C cloudpkg clean`.

## архитектура

### cloudpkg/ — пакетный менеджер

Написан на C (gnu17), собирается через Makefile. Основные модули: `cloudpkg.c` (main), `util.c`, `heal.c`, `emerge.c`, `snap.c`, `cmds.c`, `update.c`, `cloudpkg.h`. Работает через portage (рецепты Gentoo + оверлей cloudos в `overlay/`). Настройки: `etc/cloudpkg/cloudpkg.conf`, `etc/portage/make.conf`, репозитории в `etc/portage/repos.conf/`.

### tools/ — сборка и тесты

- `build-stage3.sh` + `stage3/build-inside.sh`: сборка stage 3 из предыдущего (нужен root, ~10 ГБ).
- `mkiso.sh` + `iso/mkiso-inside.sh`: сборка live iso из stage 3 и ядра cloudk (нужен root, ~15 ГБ).
- `kernel/`: сборка ядра cloudk (ванильное + патчи cachyos, закреплены в `patches.lock`).
- `stage3/`: пакеты gentoo stage 3 (`gentoo-stage3.list`, `gentoo-exclude.txt`), исходники (`SOURCES.txt`), утилиты live-системы (cloudos-users, cloudos-firewall, cloudos-audit, neofetch), настройки openrc/nftables/ssh/sysctl.
- `test-*.sh`: тесты отдельных компонентов.
- `sign.sh`, `pack-fetch.sh`, `pin-actions.sh`: подпись релизов, упаковка пакетов, закрепление actions.

### docs/ — статический сайт

Чистая статика без сборщика. Проверка — `node tools/test-site.js`. Меняешь CSS/JS — поднимай `?v=N` в подключениях и `const V` в `docs/sw.js`. Переводы через `docs/i18n.js`; handbook имеет отдельную полную en-версию в `docs/handbook/en/`.

## правила

- Код без комментариев в C, shell и JS — не добавляй их нигде.
- В `cloudpkg/*.c` нельзя `system()` и `popen()`, в `cloudpkg-box.sh` — `eval` (проверка: `tools/test-hardening.sh`).
- Версия cloudpkg — строка `#define VERSION "x.y.z"` в `cloudpkg/cloudpkg.c`: `update.c` парсит её фиксированным префиксом.
- `docs/cloudos.pub` — публичный ключ minisign. Не пересоздавай без намеренной ротации.
- Actions в workflows закреплены по SHA. После изменения workflow запускай `bash tools/pin-actions.sh`.
- История изменений — `CHANGELOG.md`: новый раздел сверху, пункты с путями файлов.
- Код без комментариев в C, shell и JS.
- `OUT` у `build-stage3.sh` и `mkiso.sh` по умолчанию — текущая папка. Запускай с `OUT=/tmp/...`, иначе гигабайтные архивы окажутся в репозитории.

## переменные сборки

| скрипт | ключевые переменные |
|---|---|
| `build-stage3.sh` | `BASE`, `VERSION`, `WORK`, `OUT`, `REFRESH_LIST`, `RESUME`, `STRICT` |
| `mkiso.sh` | `BASE`, `VERSION`, `KVER`, `CLOUDK_VER`, `CLOUDK_TAG`, `CLOUDK`, `OUT` |
| `cloudpkg` | `CLOUDPKG_BOX`, `CLOUDPKG_MODE`, `CLOUDPKG_STAGE3`, `CLOUDPKG_SRC` |

Детали — в `tools/README.md` и `cloudpkg/README.md`.
