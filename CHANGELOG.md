# changelog

## iso 2.3, stage3 1.6, cloudpkg 1.1.0: обязательная подпись, ci

- `cloudpkg/install.sh`: проверка подписи minisign обязательна по умолчанию, `--insecure` отключает, `CLOUDPKG_STRICT`, `CLOUDPKG_FORCE`, `CLOUDPKG_KEEP` и `CLOUDPKG_INSTALL_URL` доезжают через sudo и doas
- `cloudpkg/update.c`: обновление отменяется, если не удалось сохранить копию старого бинарника, сбой обновления конфигов выводится
- `.github/workflows/ci.yml`: shellcheck, сборка cloudpkg с `-Werror`, тесты
- `.github/workflows/iso.yml`: вход `overwrite`, перезапись релиза запрещена по умолчанию, информационная проверка загрузки iso через загрузчик, actions закреплены по sha
- `tools/test-hardening.sh`: проверка под `CLOUDK_VERIFY`
- `.github/workflows/autofix.yml`: удалён
- версии по умолчанию: iso 2.3, база stage 3 1.6, cloudpkg 1.1.0. в `install.sh` остаётся stage 3 1.5 до выхода релиза 1.6

## cloudk 0.2: thinlto и динамическое вытеснение

- `tools/kernel/build-cloudk.sh`: сборка через clang с thinlto (`LTO=thin`, по умолчанию в workflow), проверка clang, lld и llvm-утилит, остановка, если thinlto не включился
- `tools/kernel/cloudk-config.sh`: добавлены `PREEMPT_DYNAMIC`, `RCU_LAZY`, `ZSWAP_SHRINKER_DEFAULT_ON`
- `.github/workflows/cloudk.yml`: вход `lto`, пакеты clang, lld, llvm, таймаут 330 минут
- версия по умолчанию cloudk `0.2` в cloudk, cloudk-boot, iso, mkiso

## iso 2.2, cloudk 0.1: своё ядро в отдельном релизе, строгая сборка

- `tools/kernel/build-cloudk.sh`, `tools/kernel/cloudk-config.sh`: ядро cloudk собирается отдельным скриптом (`linux-6.18.10`, sha256 и подпись gpg, хук для патчей `tools/kernel/patches`), обязательные опции ядра проверяются после `olddefconfig`, сборка останавливается, если хоть одна не встала
- оптимизации ядра: mglru (`LRU_GEN`), `SCHED_AUTOGROUP`, `SCHED_MC_PRIO`, `CPU_IDLE_GOV_TEO`, `NO_HZ_IDLE`, `HZ_1000`, полное вытеснение, bbr и fq, `NET_SCH_CAKE`, zswap с zstd, bfq, `NTSYNC`; без `PROFILING`; флаги `-O2 -pipe`, для v3 ещё `-march=x86-64-v3`
- `.github/workflows/cloudk.yml`: сборка для x86-64 и x86-64-v3, подпись minisign в отдельной задаче, релиз `cloudk-0.1`
- `tools/mkiso.sh`, `tools/iso/mkiso-inside.sh`: iso больше не компилирует ядро, а скачивает cloudk из релиза, проверяет подпись minisign и sha256 и ставит ядро с модулями
- `tools/iso/cloudos-install`: проверяет, что в образе есть ядро cloudk, и показывает его версию в конце установки
- `.github/workflows/iso.yml`: `smoke` и `install_test` больше не `continue-on-error`, публикация без них запрещена, attestation обязательна
- версии: iso `2.2`, cloudk `0.1`

## stage 3 1.5, iso 2.1: утилиты, neovim с lazyvim, раскладка в установщике

- `tools/stage3/cloudos-extra.list`: новый список пакетов (утилиты диагностики, диски и файловые системы, сеть, архиваторы, библиотеки для сборки, git, ripgrep, fd, fzf, tmux, htop, btop, mc, neovim); сборка идёт после основного набора gentoo и не валит stage 3, если отдельный пакет не собрался, такие пакеты попадают в `failed.txt`
- `tools/stage3/build-inside.sh`: шаги `cloudos-extra` и `lazyvim`; lazyvim starter кладётся в `/etc/skel/.config/nvim` и `/root/.config/nvim`, плагины ставятся при сборке (`Lazy! sync`), `vi` и `vim` ведут на nvim, `EDITOR` и `VISUAL` равны nvim
- `tools/iso/cloudos-install`: выбор раскладки (`us` по умолчанию, `ru` = английская и русская с переключением, либо любая раскладка kbd), выбор сочетания для переключения (`alt_shift`, `ctrl_shift`, `caps`), язык системы (locale), часовой пояс; переменные `CLOUDOS_KEYMAP`, `CLOUDOS_SWITCH`, `CLOUDOS_LOCALE`, `CLOUDOS_TZ`; при `CLOUDOS_YES=1` вопросов нет, берутся значения по умолчанию
- `tools/iso/mkiso-inside.sh`: проверка, что в stage 3 есть nvim, git, rg, fd, tmux, htop и конфиг lazyvim; обновлён motd
- версии: stage 3 `1.5`, iso `2.1`, iso по умолчанию собирается из stage 3 `1.5`

## 2.0.5, cloudpkg 1.0.1: проверка stage 3, защита sync, правки workflows

- `cloudpkg/install.sh`: stage 3 проверяется подписью minisign (`stage3.tar.xz.minisig` из того же релиза, ключ тот же, что у исходников) вдобавок к sha256; неверная подпись останавливает установку и удаляет скачанный файл; нет minisign или `.minisig`, то предупреждение, при `CLOUDPKG_STRICT=1` отказ; без minisign скрипт пробует поставить его пакетным менеджером хоста до проверки исходников
- `cloudpkg/install.sh`: `CLOUDPKG_REPO` и `CLOUDPKG_BRANCH` проверяются по белому списку символов до повышения прав (как уже сделано в `update.c`); curl не следует за редиректом на http; `tar` распаковывает исходники с `--no-same-owner`
- `cloudpkg/util.c`: `fetch` разрешает только http и https и запрещает редирект на http; `safe_dir` требует глубину не меньше трёх компонентов и отвергает ещё `/var/db`, `/var/lib`, `/var/cache`, `/usr/local`, `/etc/portage` и им подобные (раньше `repo=/var/lib` проходил, а `sync` переименовывает `repo` в `repo.old`); завершающие `/` в `repo` и `distdir` убираются (с `repo=путь/` каталог `.new` создавался внутри самого дерева)
- `cloudpkg/emerge.c`: `sync` возвращает старое дерево, если не удалось поставить новое (раньше после неудачного второго `rename` дерева не оставалось вообще)
- `cloudpkg/heal.c`: `probe_ver` закрывает дескриптор `/dev/null` в потомке и отвязывает stdin
- `cloudpkg/snap.c`: `sn_prune` без мёртвого кода, путь снимка проверяется на усечение перед `btrfs subvolume delete`
- `cloudpkg/cloudpkg.c`: версия 1.0.1, иначе `cloudpkg update` не доставит исправления
- `.github/workflows/iso.yml`, `stage3.yml`: при `publish` сборка сразу падает, если не задан `MINISIGN_KEY` (раньше выходил неподписанный релиз после многочасовой сборки, теперь проверка идёт первым шагом и секрет не раскрывается)
- `.github/workflows/cloudpkg-release.yml`: `cancel-in-progress: false`, чтобы отмена не оставляла архив и подпись разных версий
- `tools/test-cloudpkg.sh`: тест `safe_dir`
- не проверено: ветка возврата дерева при сбое `rename` в `sync`, проверка подписи stage 3 с настоящим minisign (проверена на заглушке), shellcheck (в среде его нет, проверит `check.yml`)
- не исправлено: actions закреплены тегами, а не sha; `tools/pin-actions.sh --check` только предупреждает; закрепление требует сети (`bash tools/pin-actions.sh`, затем `--strict` в `check.yml`); снимок portage в `sync` не проверяется подписью gentoo, защита только tls

## 2.0.4, установка по разделам, установщик на английском

- `tools/iso/cloudos-install`: режим `manual`: можно разметить диск через cfdisk, fdisk или sfdisk (для sfdisk скрипт вводится построчно с подтверждением), затем выбрать раздел root и раздел boot; форматируются только они, остальные разделы диска не трогаются; проверяются: блочное устройство, тип partition, не смонтирован, не на носителе live iso, root от 4 gib, boot от 100 mib, boot и root разные
- `tools/iso/cloudos-install`: существующий vfat раздел boot можно не форматировать (`CLOUDOS_FORMAT_BOOT=0`), старый `EFI/BOOT/BOOTX64.EFI` и `limine.conf` сохраняются как `.bak`; диск для `limine bios-install` определяется по разделу boot
- `tools/iso/cloudos-install`: переменные `CLOUDOS_MODE`, `CLOUDOS_ROOT`, `CLOUDOS_BOOT`, `CLOUDOS_FORMAT_BOOT`; без `CLOUDOS_MODE` режим выбирается по `CLOUDOS_ROOT` (manual) или `CLOUDOS_DISK` (auto), старый запуск через `CLOUDOS_DISK` работает без изменений
- `tools/iso/cloudos-install`: все сообщения, вопросы и справка переведены на английский
- `tools/iso/mkiso-inside.sh`: подсказка в motd live iso про установку на английском
- `docs/handbook/`, `README.md`: описание режимов auto и manual
- ограничения: manual не проверен на реальном железе и в qemu; для bios с gpt нужен bios boot раздел

## 2.0.3, проверка файлов, статус сборок, безопасность, песочница

- `.github/workflows/iso-test.yml`: qemu с `-cpu max` и `-cpu host` под kvm (раньше qemu64 мог молча падать на ядре v3), kvm включается через udev, вывод идёт в файл `-serial file:` вместо stdio, код выхода qemu и хвост лога печатаются в job, ядро и initramfs проверяются после извлечения, тестовая установка запускается даже если проверочная загрузка упала, загрузка установленной системы останавливается сразу после `is starting up`, в summary логи smoke, установки и загрузки
- `docs/verify/`: новая страница «проверка файлов» (меню «другие»); выбираешь релиз cloudos, файл из него и способ (sha256, подпись minisign, оба), потом свой скачанный файл; проверяются только файлы из релизов `wh1laye/cloudos-repo`, ожидаемый хеш и `.minisig` берутся из того же релиза, ключ из `docs/cloudos.pub`; sha256 и blake2b-512 считаются потоком (`vcore.js`, без внешних библиотек), подпись проверяет webcrypto (ed25519: chrome 137+, firefox 129+, safari 17+); размер файла сверяется с релизом до расчёта; проверяется и подпись комментария; страница показывает id ключа и честно пишет, что хеш из того же релиза не защищает от подмены
- `docs/status/`: новая страница «статус сборок»: последние прогоны iso, check, iso-test, stage3, cloudpkg-release из github actions, дата последнего коммита, релиза и успешной сборки iso, вердикт «проект живой» по давности коммита; ответы кешируются на 5 минут, при лимите api показывается понятное сообщение
- `docs/security/`: новая страница «безопасность»: модель угроз, что усилено (с файлами из репозитория), чего пока нет (apparmor в complain, uki и tpm2 не проверены на железе, ключ подписи в секретах actions, нет независимого аудита, пароль live), как проверить скачанное и как сообщить об уязвимости
- `docs/sandbox/`, `docs/themes/secret.js`: страница «песочница» открывает cloudsh без секретки; в cloudsh добавлен `cloudpkg` (search, info, list, install -p, remove, sync, upgrade, clean, doctor, version) на данных `packages/packages.json`, установка только имитируется; новые команды `pwd`, `id`, `hostname`, `which`, `man`, `free`, `df`, `lsblk`, `ps`, `dmesg`, `ping`, `sl`, `cloudos-audit` (пример вывода); дополнение имени команды по tab
- `docs/themes/secret.js`: скрытая команда `snake` (змейка: стрелки, wasd или hjkl, свайпы, p пауза, q выход, рекорд в localStorage); в `help` и в дополнении по tab её нет, только здесь
- `tools/test-verify.js`, `.github/workflows/check.yml`: тест `vcore.js` против node crypto (sha256 и blake2b-512 на границах блоков, куски разного размера), подпись, подмена файла, подмена комментария, чужой ключ, чужой id, при наличии minisign ещё и настоящая подпись
- меню «другие» на всех страницах, `docs/cmdk.js` (палитра и переводы), `docs/sitemap.xml`, `docs/sw.js`, `docs/themes/themes.js`, `docs/theme.js`, `docs/themes/fun.js`: новые страницы и сброс кэша
- `README.md`: бейджи iso и check, ссылки на новые страницы

## 2.0.2, темы и секретка

- `docs/theme.css`, `docs/theme.js`: новые темы `night` (oled), `nord`, `dracula`, `sepia`; скрытые `matrix` и `amber` (доступны только после секретки); значение темы проверяется по белому списку, неизвестное или закрытое сбрасывается в `gray`
- `docs/themes/fun.js`: konami заменён на слово `cloudos` (работает на любой раскладке по физическим клавишам, не срабатывает в полях ввода); подсказка про секрет убрана из настроек
- `docs/themes/secret.js`: новый файл, грузится только по секретке; терминал `cloudsh` (help, theme, matrix, neofetch, cd <раздел>, fortune, cowsay, hack и др.); `CloudSecret.add(name, fn)` добавляет команды
- `docs/forum/app.js`, `docs/forum/forum.css`: список тем форума берётся из общего набора
- `docs/cmdk.js`, `docs/404.html`: новые темы в палитре и в раннем скрипте
- `docs/themes/themes.js`, `docs/sw.js`: сброс кэша

## 2.0.1, исправления: сборка iso и konami

- `tools/iso/mkiso-inside.sh`: `sys-apps/apparmor` падал в `pkg_setup` (нет `.config`, ядро собирается позже wifi-шага); добавлен `kcfg_stub`: временная папка с `Makefile` и `.config`, `KERNEL_DIR` указывает на неё только на время установки apparmor
- `docs/themes/fun.js`: konami-код читал `e.key`, на русской раскладке `b` и `a` приходят как `и` и `ф`; теперь `e.code` (KeyB, KeyA), работает на любой раскладке
- `docs/themes/themes.js`, `docs/sw.js`: сброс кэша

## 2.0.0, live iso 2.0: uki, tpm2, cis

- `tools/iso/cloudos-uki`: новая команда, `build` собирает unified kernel image (efi stub, ядро, initramfs, параметры из limine.conf), подписывает ключом db, ставит пункт первым в limine.conf; `status`; повторный запуск не дублирует пункт
- `tools/iso/cloudos-install`: `CLOUDOS_UKI=1` (нужен `CLOUDOS_SECUREBOOT=1`) собирает uki до подписи конфига, хеш uki попадает в limine.conf
- `tools/iso/cloudos-tpm2`, `tools/iso/dracut-tpm2/`: `enroll` запечатывает случайный ключ в tpm2 по pcr 7, добавляет слот luks 7, пересобирает initramfs, uki и подпись; `remove`, `status`; модуль dracut `91cloudos-tpm2` открывает luks при загрузке, при неудаче остаётся запрос пароля
- `tools/iso/mkiso-inside.sh`: ядро с `TCG_TPM`, `TCG_TIS`, `TCG_CRB`; в образ ставятся `tpm2-tools` и `systemd-utils` (efi stub, USE boot), новые скрипты и модуль dracut
- `tools/stage3/cloudos-audit`: `--cis` добавляет проверки прав файлов, паролей, учётных записей, лишних файловых систем, core-дампов, сетевых sysctl, ssh, каталогов без sticky
- `tools/mkiso.sh`, `.github/workflows/iso.yml`, `check.yml`: версия по умолчанию 2.0, новые файлы в проверках
- `docs/handbook/`: раздел 5.6, убраны устаревшие фразы; `docs/news`, `README.md`: 2.0 готово
- ограничения: uki, tpm2 и модуль dracut не проверены на железе; tpm2 привязан к pcr 7 (состояние secure boot), а не к хешу ядра

## 1.11.0, apparmor (live iso 2.0)

- `tools/iso/mkiso-inside.sh`: ядро с `SECURITY_APPARMOR`, `SECURITY_YAMA`, `SECURITY_LANDLOCK`, `AUDIT`, `LSM=landlock,lockdown,yama,apparmor,bpf`, apparmor по умолчанию; в образ ставятся `sys-apps/apparmor` (сборка падает без него) и `sec-policy/apparmor-profiles`; служба `apparmor` в runlevel boot
- `tools/iso/cloudos-install`: в параметры ядра добавлены `apparmor=1 security=apparmor`
- `tools/stage3/cloudos-audit`: проверка, что apparmor включён и есть профили в enforce
- профили из apparmor-profiles идут в режиме complain, в enforce их переводит владелец: `aa-enforce /etc/apparmor.d/имя`

## 1.10.0, cloudpkg 1.0: модули и подпись обновлений

- `cloudpkg/`: `cloudpkg.c` разбит на `cloudpkg.c` (main, версия), `util.c`, `heal.c`, `emerge.c`, `snap.c`, `cmds.c`, `update.c` и `cloudpkg.h`; `Makefile` собирает все модули; версия 1.0
- `cloudpkg/update.c`: `update` качает `cloudpkg-src.tar.gz` и `.minisig` из релиза `cloudpkg-latest`, проверяет `minisign` ключом `/etc/cloudpkg/cloudos.pub` до распаковки и сборки; нет minisign, ключа или подпись не подошла, обновление отменяется; `--unsigned` берёт ветку без проверки с предупреждением
- `cloudpkg/install.sh`: берёт тот же подписанный архив, проверяет подпись встроенным ключом; без minisign предупреждает, `CLOUDPKG_STRICT=1` делает проверку обязательной; если релиза нет, берёт ветку с предупреждением
- `.github/workflows/cloudpkg-release.yml`: при изменении `cloudpkg/**` в main собирает воспроизводимый архив, подписывает `tools/sign.sh`, кладёт в релиз `cloudpkg-latest`
- `cloudpkg/Makefile`: исправлено, `cloudpkg.conf` ставился в `/etc/cloudpkg.conf`, а читается из `/etc/cloudpkg/cloudpkg.conf`; ключ ставится в `/etc/cloudpkg/cloudos.pub` при каждом `make conf`
- `tools/test-update-sign.sh`, `check.yml`: тест принимает верную подпись, отклоняет изменённый файл и чужой ключ; остальные тесты и `test-hardening.sh` переведены на модули
- `tools/iso/mkiso-inside.sh`: в iso ставится `app-crypt/minisign`, сборка падает, если он не встал
- 0.9 обновляется до 1.0 без проверки подписи (старый код её не умеет), дальше проверка работает

## 1.9.1, план live iso 2.0, правка устаревших текстов

- `docs/news/index.html`, `docs/rss.xml`, `README.md`: план live iso 2.0 из четырёх направлений: доверие к обновлениям (minisign для `cloudpkg update` и `install.sh`), защита системы (подписанный uki, apparmor, tpm2 для luks, профиль cis), пакеты (подписанный binhost, воспроизводимая сборка, проверка целостности), платформы (arm64)
- `docs/handbook/index.html`, `docs/handbook/en/index.html`, `docs/index.html`: убрано устаревшее «secure boot и luks в планах», они есть с 1.6 и 1.7; в «чего пока нет» теперь apparmor и подпись обновлений
- `docs/sw.js`: сброс кэша, версия 11

## 1.9.0, cloudpkg 0.9: снимки и откат, тест iso, закрепление actions

- `cloudpkg/cloudpkg.c`: `upgrade` на btrfs сначала делает снимок корня, без снимка обновление не начинается (`--no-snapshot` отключает); новые команды `snapshot`, `snapshots`, `snapshot-rm`, `rollback [-y] [имя]`, параметр `snapshots=N` в конфиге (по умолчанию 5, старые снимки удаляются); откат создаёт записываемую копию снимка и делает её корнем по умолчанию, `/boot` не откатывается; версия 0.9
- `tools/test-snapshots.sh`, `check.yml`: тест снимков, обрезки, отката и отказа на ext4 на фейковых `btrfs`, `mount`, `umount` (в `cloudpkg.c` добавлены переопределяемые `MOUNTINFO`, `TOPMNT`, `CONF`)
- `.github/workflows/iso-test.yml`: раз в неделю, при публикации релиза и вручную скачивает iso из релиза, проверяет sha256 и подпись minisign, гоняет проверочную загрузку и тестовую установку с загрузкой на ext4 и btrfs в qemu
- `tools/iso/mkiso-inside.sh`: тестовая установка принимает `cloudos.itest.fs=btrfs` в командной строке ядра
- `tools/pin-actions.sh`: закрепляет все actions в workflows по sha коммита (`# тег` в комментарии, dependabot их обновляет); `--check` предупреждает о незакреплённых, `--strict` падает. `check.yml` запускает `--check`
- `cloudpkg/README.md`, `cloudpkg/etc/cloudpkg.conf`: описание снимков и `snapshots=5`

## 1.8.2, форум: решено только персоналу, чат с удалённым аккаунтом

- `docs/forum/app.js`: кнопка «отметить решённой» и вызов `set_solved` доступны только с правом `delete_posts` или админу, автор темы больше не может отмечать
- `docs/forum/app.js`: чат с удалённым аккаунтом открывается, показывает «аккаунт удалён» и «пусто», форма отправки скрыта, сверху кнопка «удалить чат»; в списке сообщений такой собеседник подписан «удалённый аккаунт»
- `tools/forum-solved-staff.sql`: `set_solved` проверяет право на сервере
- `tools/forum-dm-gone.sql`: `dm_delete_gone` удаляет переписку, только если аккаунта собеседника уже нет
- применить оба sql в supabase (sql editor) до выката

## 1.8.1, сайт: шрифт и настройки

- `docs/style.css`, все `docs/**/index.html`: основной шрифт Inter (вес 450, кириллица), запасной IBM Plex Sans, подключены Inter и Manrope
- `docs/themes/more.js`: новый раздел настроек «вид и удобство»: шрифт (Inter, Manrope, Plex, система), межстрочный, межбуквенный, ширина текста, размер кода, подчёркивание ссылок, без анимаций, без плавной прокрутки, перенос строк в коде, выделение цветом акцента, крупная рамка фокуса, скрытие шапки при прокрутке, кнопка «наверх», экспорт, импорт и полный сброс настроек
- `docs/settings.css`, `docs/theme.js`: стили новых опций, ранняя установка атрибутов без мигания
- `docs/themes/themes.js`, `docs/sw.js`: подключение more.js, сброс кэша

## 1.8.0, cloudpkg 0.8: update, fix, авто-маски

- `cloudpkg update [--force]`: скачивает репозиторий, берёт версию из `cloudpkg.c`, при более высокой собирает, проверяет запуск, заменяет бинарник атомарно, старый кладёт в `cloudpkg.bak`; рецепты cloudos и конфиги обновляются при каждом запуске, понижение версии только с `--force`
- `cloudpkg fix [пакеты]`: чинит хуки env, базу autotools, пользователя portage, дерево и профиль, `emaint --fix cleanresume world`, затем `doctor`; с пакетами ставит их
- `install` и `upgrade`: при сбое чинят окружение и повторяют, сначала с `~amd64` на эту установку, потом без `--autounmask-keep-masks`; `--safe` отключает повторы и снятие масок
- версия 0.8

## 1.7.2, безопасность

- `cloudpkg/cloudpkg.c`: `probe_ver` больше не использует `popen` и shell, запуск через `fork` и `execlp` без оболочки, имя команды с ведущим `-` отклоняется
- `cloudpkg/cloudpkg-box.sh`: убран `eval` при переносе переменных прокси
- `tools/mkiso.sh`: проверка gpg-подписи ядра включена по умолчанию, при сбое сборка падает (`KERNEL_GPG=0` отключает)
- `tools/test-hardening.sh`, `check.yml`: проверка в ci, что в `cloudpkg.c` нет `popen` и `system`, в `cloudpkg-box.sh` нет `eval`, подпись ядра включена, `cloudpkg.c` собирается с `-Werror`

## 1.7.1, сайт: темы и фишки

- `docs/site.js`: кнопка скачивания на главной берёт только `.iso`, `.tar.xz` (stage3) больше не подхватывается
- `docs/themes/aurora.js`, `cyber.js`, `sunset.js`, `rain.js`: новые темы сияние, киберпанк, закат, дождь
- `docs/themes/ocean.js`, `forest.js`, `autumn.js`: океан с китом, медузами и водорослями, лес с лунным светом, туманом и совой, осень с ветром, гусями и кучей листьев
- `docs/themes/fun.js`: фишки в настройках: след за курсором, конфетти по клику, crt-экран, моно-шрифт, полоса прокрутки, звук кликов, радужный режим, форма углов, секретный konami-код
- `docs/themes/themes.js`, `themes.css`, `docs/theme.js`, `docs/sw.js`: подключение новых тем, цвета для светлой и серой, сброс кэша

## 1.7.0, secure boot, профили, оптимизация, аудит

- `tools/iso/cloudos-secureboot`: новая команда. `init` создаёт свои ключи PK, KEK, db (rsa 3072) в `/etc/cloudos/secureboot`, `sign` вписывает blake2b-хеши ядра и initramfs в `limine.conf`, вшивает хеш конфига в limine (`limine enroll-config`), подписывает `BOOTX64.EFI` ключом db, удаляет `BOOTIA32.EFI`, кладёт публичные ключи в `/boot/cloudos-keys`, `enroll` записывает ключи в прошивку в setup mode, `status` показывает состояние. цепочка: прошивка проверяет limine по db, limine проверяет конфиг по вшитому хешу, конфиг проверяет ядро и initramfs по хешам
- `tools/iso/cloudos-install`: `CLOUDOS_SECUREBOOT=1` (только uefi), `CLOUDOS_PROFILE=balanced|secure|fast`. secure: `mitigations=auto,nosmt lockdown=integrity init_on_free=1`, fast: `nowatchdog audit=0`
- `tools/iso/mkiso-inside.sh`: ядро с `PREEMPT`, `HZ_1000`, `SECURITY_LOCKDOWN_LSM`, `LOCK_DOWN_IN_EFI_SECURE_BOOT`, `EFI_STUB`; ставятся `sbsigntools` и `efitools`; в образ попадают `cloudos-secureboot`, `cloudos-audit` и `/etc/sysctl.d/91-cloudos-perf.conf`
- `tools/iso/sysctl-perf.conf`: swappiness под zswap, vfs_cache_pressure, page-cluster, dirty, nmi_watchdog, tcp fastopen, somaxconn (все ключи необязательные)
- `tools/stage3/cloudos-audit`: раздел «загрузка и диск» (secure boot, lockdown, подпись модулей, luks, smt, уязвимости процессора из sysfs) и итоговая оценка из 100
- `tools/mkiso.sh`, `.github/workflows/iso.yml`, `check.yml`: новые файлы в проверках и копировании

## 1.6.0, luks, x86-64-v3, темы, без мастера

- `tools/iso/cloudos-install`: шифрование корня luks2 (aes-xts-plain64, 512 бит, argon2id), переменные `CLOUDOS_LUKS` и `CLOUDOS_LUKSPASS`, в интерактивном режиме вопрос; initramfs для установленной системы собирается через dracut с модулем crypt, в `limine.conf` добавляется `module_path`, в cmdline `rd.luks.uuid` и `root=UUID`; mapper закрывается при выходе
- `tools/iso/cloudos-install`: образ под x86-64-v3 не ставится на процессор без avx2, fma, bmi1, bmi2, movbe, f16c
- `tools/iso/mkiso-inside.sh`: в ядро добавлены `DM_CRYPT`, `BLK_DEV_DM`, `CRYPTO_XTS`, `CRYPTO_AES_NI_INTEL`, `RD_ZSTD`, `DM_CRYPT` в обязательной проверке конфига; ставится `sys-fs/cryptsetup`; параметр `MARCH` (`x86-64` или `x86-64-v3`) задаёт `KCFLAGS` ядра и `-march` в `/etc/portage/make.conf`, метка в `/etc/cloudos-march`
- `tools/mkiso.sh`, `.github/workflows/iso.yml`: вход `march`
- `docs/releases/app.js`: страница релизов скрывает всё с подписью stage3 (релизы и файлы) и показывает только релизы с `.iso`
- удалён мастер установки: `docs/wizard/`, ссылки в меню, палитре ctrl+k, справочнике, определении железа, sitemap и сравнении
- `docs/themes/`: новые темы лес (`forest.js`), осень (`autumn.js`), океан (`ocean.js`), палитры в `themes.css`, осень включается в режиме авто с 15 октября по 9 декабря, кроме хэллоуина
- `docs/themes/themes.js`, `themes.css`: настройка «интерфейс → плавные переходы» отключает transition и animation на всём сайте, кроме анимаций тем
- `docs/news/index.html`, `docs/index.html`, `README.md`: статус планов обновлён
- `docs/sw.js`, `docs/theme.js`: версии кэша подняты

## 1.5.0, live iso без stage 3

- `tools/iso/cloudos-install`: новый установщик. размечает диск (gpt для uefi, dos для bios), форматирует ext4 или btrfs, монтирует в `/mnt/cloudos`, распаковывает `rootfs.squashfs` через `unsquashfs`, пишет fstab и `limine.conf` с `root=PARTUUID`, ставит limine, убирает следы live (пользователь cloudos, smoke, автологин, ключи ssh), создаёт пользователя и пароли. запуск без вопросов через переменные `CLOUDOS_*`
- `tools/iso/mkiso-inside.sh`: установщик кладётся в `/usr/sbin`, ставятся `dosfstools` и по возможности `btrfs-progs`, из squashfs убрана документация
- `tools/iso/mkiso-inside.sh`: оптимизация ядра: zstd для ядра, zswap и zram с zstd, tcp bbr, fq и fq_codel, планировщики bfq, kyber и deadline, schedutil, pstate, thp по запросу
- `tools/iso/mkiso-inside.sh`: в cloudos-smoke режим `cloudos.itest` для тестовой установки на второй диск
- `.github/workflows/iso.yml`: iso больше не требует публичного stage 3, база берётся из внутреннего релиза (`base_tag`, `base_version`), версия iso по умолчанию 1.0, новый шаг тестовой установки в qemu и загрузки установленной системы до openrc
- `.github/workflows/stage3.yml`: результат идёт во внутренний релиз как prerelease, а не как публичный stage 3
- `.github/workflows/check.yml`: `cloudos-install` проверяется `bash -n` и shellcheck
- `tools/mkiso.sh`: база задаётся `BASE_TAG` и `BASE_VERSION`
- `docs/handbook/index.html`, `docs/handbook/en/index.html`: справочник переписан под live iso: установка одной командой, установка вручную, первые шаги, пакеты, свое ядро, ошибки
- `docs/index.html`, `docs/news/index.html`, `docs/wizard/`: новая главная, очищен раздел новое, мастер собирает команду `cloudos-install`
- `docs/releases/`: страница показывает только live iso, внутренняя база скрыта
- убраны страницы `docs/kernel/` и `docs/stage3/`, ссылки на них из меню, палитры и определения железа

## 1.4.2, wifi

- `docs/handbook/index.html`, `docs/handbook/en/index.html`: глава 8 в правильном порядке (8.1 fstab, 8.2 initramfs, 8.3 limine), dracut читает fstab, поэтому fstab первый; убран `cloudpkg install dracut` (он уже в stage 3), добавлены проверки `/lib/modules` и `mountpoint /boot` и флаг `--force`; в примерах 11.3 убраны limine и dracut
- `docs/handbook/index.html`, `docs/handbook/en/index.html`: 8.3 limine переписан (он уже есть в stage 3, `cloudpkg install limine` не нужен, `limine bios-install` на весь диск, а не на раздел, добавлен шаг с blkid), глава 9 переделана (9.1 включить dhcpcd и syslog-ng, 9.2 wifi в chroot до перезагрузки, 9.3 первая загрузка), убран раздел 7.4 и дубль установки wifi в 10.5
- `docs/handbook/index.html`, `docs/handbook/en/index.html`: в разделе про сеть wifi через `doas iwctl` с аргументами (интерактивный iwctl в live падает), проверено на железе, добавлены `dhcpcd wlan0`, `ip addr`, `connect-hidden` и пояснение про `ping` только через doas
- `tools/iso/mkiso-inside.sh`: сборка `libnl` падала на `yacc.bison: No such file or directory` (в stage 3 нет app-alternatives/yacc), теперь создаётся обёртка `/usr/bin/yacc.bison` над `bison -y`, только если её нет
- `tools/iso/mkiso-inside.sh`: установка `linux-firmware` падала в pretend-фазе (`mount-boot` читает `/etc/fstab`), теперь `-initramfs` в package.use, `DONT_MOUNT_BOOT=1` и пустой `/etc/fstab` на время сборки
- `docs/handbook/index.html`, `docs/handbook/en/index.html`: wifi в справочнике: iwctl в live (2.3), ядро (7.1), установка iwd и прошивок на диск (10.5), шпаргалка (15.2), решение проблем (14.8)
- `tools/iso/mkiso-inside.sh`: wifi в live-системе: пакеты `iwd`, `iw`, `wireless-regdb`, `linux-firmware` ставятся через cloudpkg, службы `dbus` и `iwd` включены в default, dhcp для wlan делает уже стоящий dhcpcd (`EnableNetworkConfiguration=false`), пользователь cloudos добавлен в группу netdev для iwctl
- `tools/iso/mkiso-inside.sh`: ядро с wifi: `CFG80211`, `MAC80211`, `RFKILL` встроены, драйверы модулями (intel iwlwifi, atheros ath9k/10k/11k/12k, realtek rtl и rtw88/89, mediatek mt76, broadcom brcmfmac, ralink), `regulatory.db` встроен в ядро, включён `CRYPTO_USER_API` для iwd, сжатые прошивки xz и zstd
- `tools/iso/mkiso-inside.sh`: в cloudos-smoke проверка iwd и iwctl, в motd подсказка по iwctl

## 1.4.1, исправление сборки iso

- `tools/iso/mkiso-inside.sh`: в конфиг ядра добавлены `BPF`, `BPF_SYSCALL`, `BPF_JIT`, `BPF_JIT_ALWAYS_ON`, без `BPF_SYSCALL` опция `BPF_UNPRIV_DEFAULT_OFF` скрыта и проверка конфига падала
- `tools/iso/mkiso-inside.sh`: сборка iso больше не падает на «в doas.conf нет правила для wheel». недостающие правила `permit persist :wheel` и `permit nopass root` дописываются в `/etc/doas.conf`, права 600, проверка остаётся после дописывания
- `tools/stage3/cloudos-users.sh`: правила doas добавляются и в уже существующий `doas.conf`, раньше файл не трогался, если он был. добавляется перевод строки в конце, повторный запуск не плодит дубли
- `.github/workflows/check.yml`: шаг shellcheck на всех скриптах (уровень warning, блокирует), `.shellcheckrc` отключает SC2254 для списков исключений с масками
- `cloudpkg/cloudpkg.c`: `xcalloc` и `xstrdup` с выходом при нехватке памяти вместо разыменования NULL, размеры приведены к `size_t`, чисто под `-Wextra -Wsign-conversion`
- `cloudpkg/Makefile`: pie, `-fstack-protector-strong`, `_FORTIFY_SOURCE=3`, `relro` и `now`, `-Wextra -Wsign-conversion -Wformat=2`
- `tools/iso/mkiso-inside.sh`: обработчик ошибок вынесен в функцию `on_err`
- `tools/stage3/build-inside.sh`: убрана неиспользуемая переменная цикла
- `tools/iso/mkiso-inside.sh`: ядро с подписью модулей (`MODULE_SIG_FORCE`, sha512), `BPF_UNPRIV_DEFAULT_OFF`, `MITIGATION_*` для 6.18 (старое имя `PAGE_TABLE_ISOLATION` в 6.18 не работало), в cmdline добавлены `module.sig_enforce=1`, `efi=disable_early_pci_dma`, `iommu.strict=1`, общие параметры вынесены в `HARDEN`
- live: служба `cloudos-smoke` включена в default и работает только с `cloudos.smoke` в cmdline. проверяет wheel, правило doas, `doas -C` от cloudos, `su`, закрытый порт 22, drop в nftables, kptr_restrict, ptrace_scope, unprivileged bpf, пишет `cloudos-smoke: ok` или `FAIL ...` и выключает машину
- `.github/workflows/iso.yml`: проверочная загрузка идёт с `cloudos.smoke` и падает, если нет `cloudos-smoke: ok` или есть `FAIL`
- `.github/workflows/check.yml`: тест cloudpkg под `-fsanitize=address,undefined` (`CFLAGS_EXTRA` в `tools/test-cloudpkg.sh`)
- `tools/stage3/build-inside.sh`: итоговая проверка stage 3 требует правило wheel в doas.conf и группу wheel
- `tools/stage3/sysctl-cloudos.conf`: `legacy_tiocsti`, `mmap_rnd_bits`, `mmap_rnd_compat_bits` (необязательные, с `-`)
- подпись релизов minisign: `tools/sign.sh`, шаги в `stage3.yml` и `iso.yml`, `.minisig` попадают в релиз, проверка по `docs/cloudos.pub`. без секрета `MINISIGN_KEY` сборка идёт без подписи, с предупреждением. инструкция в `tools/README.md`, проверка для пользователей в README и handbook (ru, en), `SECURITY.md` обновлён
- `DISTROWATCH.md`: чек-лист заявки на distrowatch

## 1.4, жёсткая безопасность

stage 3:

- `sshd-cloudos.conf`: только ключи (`PasswordAuthentication no`, `AuthenticationMethods publickey`), `DisableForwarding`, `AllowGroups wheel users`, современные kex, шифры, mac и ключи хоста, `LogLevel VERBOSE`, `MaxStartups 3:50:10`
- `sysctl-cloudos.conf`: `ptrace_scope 2`, `mmap_min_addr`, `perf_event_paranoid`, `io_uring_disabled`, `unprivileged_userfaultfd`, `ldisc_autoload`, временные ipv6-адреса. необязательные ключи с `-`, на старом ядре не ломают загрузку
- `nftables.conf`: отбрасываются пакеты с невозможными tcp-флагами, новое соединение не с syn, поддельный loopback в адресе отправителя, invalid на выходе
- `cloudos-users.sh`: pam_faillock (блокировка на 10 минут после 5 неудач), rounds=100000 для sha512, pam_pwquality если есть, сроки паролей в login.defs, пустой пароль root блокируется, у chsh и chfn снят setuid
- новый шаг `harden`: `modprobe-cloudos.conf` отключает dccp, sctp, rds, tipc и редкие файловые системы, `limits-cloudos.conf` (core 0), права /root 700 и /etc/shadow 600, запуск аудита
- `cloudos-audit`: проверки ssh, root, faillock, modprobe, ptrace, mmap_min_addr
- сборка: attestation происхождения для архива stage 3 и iso в github actions

iso:

- live: пользователь `cloudos` (wheel, пароль cloudos), у root пароль cloudos, автовход на tty1 под cloudos, а не под root. хэши sha512 со случайной солью, при сборке проверяются. ssh для обоих закрыт
- ядро: seccomp, landlock, `INIT_STACK_ALL_ZERO`, `ZERO_CALL_USED_REGS`, `RANDOM_KMALLOC_CACHES`, pti, отключены `PROC_KCORE`, `ACPI_CUSTOM_METHOD`, `X86_X32_ABI`, в cmdline `debugfs=off pti=on`
- `rootfs.squashfs.sha256` и пункт загрузки `cloudos.verify`: initramfs сверяет образ перед монтированием

форум:

- csp в `forum/index.html` (скрипты только с себя и turnstile, соединения только с supabase), referrer policy, защита от встраивания во фрейм (`guard.js`), inline-скрипт вынесен в файл
- личные сообщения: кнопки «заблокировать» и «разблокировать», заблокированный не может писать (запрет в триггере базы, а не только в браузере), блокирующий не видит, кто его заблокировал. «удалить» у своего сообщения (у обоих) и «удалить переписку» (только у себя). база: `tools/forum-dm-block.sql`
- `cloudpkg.c`: убраны `system()` и `popen()` из разбора ошибок сборки (лог ищется через `nftw`, хвост читается самой программой), имя команды в `probe_ver` проверяется по белому списку символов
- `.github/workflows/check.yml`: проверка при каждом push и pull request (синтаксис скриптов, сборка cloudpkg с `-Werror`, тест форума, json, yaml, js), `dependabot.yml` для обновления actions, `SECURITY.md`
- `tools/test-forum.sh`: проверка форума в actions (csp, нет inline-скриптов, ссылки только http и https)
- `tools/forum-audit.sql`: запросы для supabase sql editor, проверяют rls, политики для anon, функции security definer, лимиты бакетов

## 1.4, безопасность и фаервол, стабильный выпуск

новое:

- `tools/stage3/nftables.conf`, `nftables.initd`, `nftables.local`: фаервол nftables включён по умолчанию (input и forward drop, output accept, icmp с лимитом, dhcp, лог отброшенного в `nft-drop:`), свои правила в `/etc/nftables.d/*.nft`
- `tools/stage3/cloudos-firewall`: `status`, `check`, `reload`, `on`, `off`, `list`, `allow`, `remove`, `log`. порт и адрес проверяются строго, плохое правило откатывается
- `tools/stage3/cloudos-audit`: проверка системы (фаервол, sysctl, пустые пароли, uid 0, setuid, слушающие порты, sshd), код выхода 1 при ошибках
- `tools/stage3/sysctl-cloudos.conf`: kptr_restrict, dmesg_restrict, protected_*, rp_filter, syncookies и другое
- `tools/stage3/sshd-cloudos.conf`: root по ssh закрыт, MaxAuthTries 3, без X11 и проброса
- `tools/test-firewall.sh`: проверка фаервола в изолированном netns, запускается в github actions

изменения:

- `build-inside.sh`: шаг `firewall` (ставит `net-firewall/nftables`), проверки в `do_verify`
- `cloudos-users.sh`: UMASK 027, HOME_MODE 0750, LOGIN_RETRIES, rounds для sha512, `su` только для wheel (pam_wheel)
- `mkiso-inside.sh`: ядро с nf_tables и харденингом, cmdline с `slab_nomerge init_on_alloc=1 page_alloc.shuffle=1 randomize_kstack_offset=on vsyscall=none`
- `mkiso.sh`: проверка gpg-подписи ядра (`KERNEL_GPG=auto|1|0`)
- `cloudpkg.c`: путь лога с кавычкой или переводом строки не уходит в `system()`
- workflows: `persist-credentials: false`, проверка `version` и `kernel`, данные из inputs только через env, проверка фаервола в stage3, проверка nftables в smoke iso
- документация: в stage3 нет iptables в списке пакетов, поэтому упоминания iptables заменены на nftables

## 1.3, живой iso

новое:

- `tools/mkiso.sh`, `tools/iso/mkiso-inside.sh`, `tools/iso/init`: сборка гибридного iso (bios и uefi) на limine из stage 3. ядро собирается из исходников kernel.org, initramfs свой (без dracut), корень это squashfs из stage 3 с overlay в tmpfs
- `.github/workflows/iso.yml`: сборка iso в github actions, проверочная загрузка в qemu, выкладывание `cloudos-live-amd64-1.3.iso` и `.sha256` в релиз `1.3`. `docs/` не затрагивается

## 1.3, сайт и справочник

- версия 1.3 везде: `docs/index.html`, справочник (ru и en), мастер установки, страница пакетов, страница stage 3, имена файлов и ссылки на релиз `1.3`
- в stage 3 1.3 есть `openssh`, `iptables`, `man-db`, `man-pages`, `rsync`, `wget`, `gnupg`, `iputils`, `net-tools`, а на сайте и в `README.md` было написано, что ssh-сервера, фаервола и man-страниц нет. исправлено в `README.md`, `docs/index.html`, справочнике (разделы 1.2, 1.3, 13 и вопрос про man, ru и en). sshd и фаервол установлены, но выключены, как их включить написано в главе 13
- `docs/packages/packages.json`: добавлены пакеты из stage 3 1.3
- `docs/news`, `docs/rss.xml`, `docs/i18n.js`: запись про 1.3
- `docs/sitemap.xml`: адреса вели на старый домен `cloudos-repo.pages.dev`, теперь `https://wh1laye.github.io/cloudos-repo/`, добавлен `lastmod`
- `docs/stage3/stage3.js`: карта берётся из `docs/stage3/map.json`, если файла нет, из релиза `1.3`

## 1.3 (stage 3 и cloudpkg 0.7), правка 2

исправлено (шаг gentoo-stage3-set, упали `dev-util/debugedit` и `net-mail/mailbase`, `STRICT=1` остановил сборку):

- `build-inside.sh`: новый шаг `elfutils`. `dev-libs/elfutils` был в `package.provided`, но `libdw.pc` нет, поэтому у `debugedit` configure падал с `Package 'libdw' not found`. шаг проверяет `pkg-config --exists libdw`, если нет, убирает запись из `package.provided`, ставит настоящий elfutils через cloudpkg и снова проверяет `libdw`
- `build-inside.sh`: новый шаг `maildir` (`fix_maildir`). в lfs `/var/mail` каталог, а `mailbase-1.8.1` ставит `/var/mail -> spool/mail`, portage запрещает такую коллизию (PMS 13.4). шаг переносит почту в `/var/spool/mail` и делает `/var/mail` симлинком. `apply_fix` вызывает его сам, если в логе коллизия на `/var/mail`

### правка 1

исправлено (шаг pam, `dev-python/more-itertools`: `python_setup: no enabled implementation satisfy requirements`):

- `build-inside.sh`: новый шаг `python-vdb` после `autotools-vdb`. `has_version` в eclass `python-utils-r1` не видит `package.provided`, поэтому python 3.13 из lfs считался не установленным и `python_setup` не находил ни одной реализации. шаг записывает `dev-lang/python-<версия>` (slot `3.13`, флаги `USE` определяются проверкой импорта модулей: ssl, sqlite, readline, xml, gdbm, ncurses, threads, ensurepip) в `/var/db/pkg` с файлом `CLOUDOS_STUB`, потом проверяет `portageq has_version / dev-lang/python:3.13` и `python3_13` в `make.conf`

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
