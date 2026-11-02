# changelog

## 1.4.2, wifi

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
