# AGENTS.md

## что это

CloudOS — самостоятельный Linux-дистрибутив (LFS, OpenRC, только x86_64), а не обычное приложение. В репозитории три части: пакетный менеджер на C (`cloudpkg/`), bash-сборщики stage 3 / ядра / iso (`tools/`), статический сайт и handbook (`docs/`, GitHub Pages). Основной язык документации и сайта — русский; handbook имеет полную английскую копию, сообщения установщика `cloudos-install` — на английском.

## проверки

Перед PR запускай то же, что CI (`.github/workflows/ci.yml`):

```bash
make -C cloudpkg CC="gcc -Werror"
find . -name '*.sh' -not -path './.git/*' -print0 | xargs -0 shellcheck -S error
node tools/test-site.js
for t in cloudpkg snapshots forum update-sign hardening kernel-patches kernel-userspace stage3-gate; do
  sudo env "PATH=$PATH" bash "tools/test-$t.sh"
done
```

- C собирается с `-Wall -Wextra -Wsign-conversion -Wformat=2`; warning = ошибка, включая знаковые преобразования.
- `test-cloudpkg` и `test-snapshots` сами требуют root, поэтому в CI все тесты идут через `sudo`. Нужны `node`, `gcc`, `minisign`, `gpg`.
- `sudo bash tools/test-firewall.sh` — отдельно: нужны root, `nft` и network namespace; запускается в `stage3.yml`, не в `ci.yml`.
- `node tools/test-verify.js` — единственный тест `docs/verify/vcore.js`; в `ci.yml` не подключён, запускай вручную.
- Скрипты без `.sh` (`tools/stage3/cloudos-*`, `neofetch`, `tools/iso/*`) shellcheck не видит; workflows проверяют их через `bash -n`.
- `make` кладёт бинарник в `cloudpkg/cloudpkg`, а `.gitignore` в репозитории нет. Не коммить его: перед коммитом `make -C cloudpkg clean`.

## сборка и релизы

Артефакты не коммитятся, а передаются через GitHub Releases. Порядок цепочки: stage 3 -> ядро cloudk -> live iso.

- `tools/build-stage3.sh` -> chroot `tools/stage3/build-inside.sh`; нужны root, x86_64, ~10 ГБ. База по умолчанию — предыдущий stage 3 из релиза; версии задаются `VERSION`/`BASE_VERSION`. Список пакетов — `tools/stage3/gentoo-stage3.list`, исключения — `gentoo-exclude.txt`, sha256 исходников — `SOURCES.txt`.
- `tools/kernel/build-cloudk.sh` — ванильное ядро + слой форка (`cloudk-config.sh`, `cloudk-source.sh`, `cloudk-patches.sh`). Патчи cachyos закреплены в `tools/kernel/patches.lock`; без закреплённого коммита и хэша сборка падает.
- `tools/mkiso.sh` -> `tools/iso/mkiso-inside.sh`; нужны root, x86_64, ~15 ГБ. Берёт stage 3 и cloudk из релизов, minisign проверяется по умолчанию. Внутри — установщик `tools/iso/cloudos-install`, initramfs `tools/iso/init`, squashfs, limine.
- `cloudpkg/install.sh` ставит пакетник на хост (на чужом дистрибутиве — в box), `cloudpkg-setup.sh` настраивает portage внутри CloudOS/box, `cloudpkg-box.sh` — обёртка chroot. Push в `main` с изменениями `cloudpkg/**` или `tools/sign.sh` автоматически публикует подписанный `cloudpkg-latest`.
- `OUT` у `build-stage3.sh` и `mkiso.sh` по умолчанию — текущая папка. Запускай с `OUT=/tmp/...`, иначе гигабайтные архивы окажутся в репозитории.
- Локально собранные stage 3/iso не публикуй: релизы собирает только GitHub Actions.
- Переменные и шаги сборки подробно описаны в `tools/README.md` и `cloudpkg/README.md`; не дублируй их.

## правила, которые легко нарушить

- В `cloudpkg/*.c` нельзя `system()` и `popen()`, в `cloudpkg-box.sh` — `eval`: `tools/test-hardening.sh` это проверяет.
- Версия cloudpkg — строка ровно `#define VERSION "x.y.z"` в `cloudpkg/cloudpkg.c`: `update.c` парсит её фиксированным префиксом, а `cloudpkg update` ставит только версию выше текущей.
- `docs/cloudos.pub` — публичный ключ minisign. Не пересоздавай его без намеренной ротации: старые подписи перестанут проверяться, id ключа закреплён в `tools/test-verify.js`. Закрытый ключ хранится только в секретах Actions.
- Actions в workflows закреплены по SHA. После добавления или обновления action запусти `bash tools/pin-actions.sh` (проверка: `--check`, строгая: `--strict`).
- История изменений ведётся вручную в `CHANGELOG.md`: новый раздел сверху, пункты с путями файлов; старые разделы не переписывай.
- Код пишется без комментариев: не добавляй их ни в C, ни в shell, ни в JS. Ориентир по стилю — соседние файлы. Одно изменение — одна причина, не смешивай исправление и переписывание.

## сайт (`docs/`)

- Чистая статика без сборщика и npm; основная проверка — `node tools/test-site.js` (битые ссылки, дубли `id`, теги до `<head>`, базлайн `innerHTML`).
- Меняешь CSS/JS — подними `?v=N` у этого файла во всех HTML, где он подключён, и `const V` в `docs/sw.js`, иначе браузер и service worker отдадут старую версию.
- Переводы: русские строки в разметке переводятся `docs/i18n.js`; новая строка без пары останется русской в en-режиме. Handbook — отдельная полная en-копия `docs/handbook/en/index.html`, правь обе версии.
- HTML без шаблонов: шапка и меню продублированы в каждой странице; новой странице нужны ссылки в меню и `docs/sitemap.xml`.
- Форум: CSP в `docs/forum/index.html` запрещает inline-скрипты и обработчики. Новый `innerHTML` экранируй через `esc()` и осознанно поднимай счётчик в `tools/innerhtml-baseline.json`.
- SQL форума (`tools/forum-*.sql`) проверяется `tools/test-forum.sh` на инварианты прав, лимитов и admin-функций.
