# changelog

## 1.2 (stage 3 и cloudpkg 0.6)

исправлено:

- пакетник: сломанные файлы в `/etc/portage/env` (ошибка синтаксиса в `cloudos-noreconf`) больше не рушат сборку. cloudpkg 0.6 проверяет их через `bash -n` перед `sync`, `install` и `upgrade`, сломанный файл уходит в `.bak`, а хук `cloudos-noreconf` пересоздаётся рабочим. `cloudpkg doctor` показывает, всё ли в порядке
- сборка stage 3: хук `cloudos-noreconf` пишется построчно и проверяется `bash -n` сразу при создании, если не прошёл, сборка не использует его
- su: добавлены настройки pam (`system-auth`, `su`, `su-l`, `login`, `passwd`, `doas` и другие), setuid на `su`, `passwd` и `unix_chkpwd`, поэтому вход через `su` и `su -` работает
- useradd: `/usr/sbin` теперь в PATH у всех (`/etc/profile.d/cloudos-path.sh`, `ENV_PATH` и `ENV_SUPATH` в `login.defs`), если shadow не установлен, сборка ставит его через cloudpkg
- версия в `/etc/os-release` и `/etc/issue` обновляется с любой прошлой версии, не только с 1.0

новое:

- `neofetch`: команда на чистом bash с облаком cloudos, память и диск с полосками, `--ff` запускает fastfetch, `--plain` без цветов
- fastfetch: строки init, cloudpkg и locale
- `cloudos-users`: проверяет и чинит вход и пользователей, безопасно запускать повторно
- `cloudos-adduser имя`: пользователь с домашней папкой, группой wheel и паролем
- шаблон `/etc/skel` с цветным приглашением, `/etc/doas.conf` (`permit persist :wheel`)
- проверка сборки теперь смотрит pam, setuid, группу wheel, useradd в PATH обычного входа и неработающие библиотеки

как починить систему на 1.1 без пересборки:

    mv /etc/portage/env/cloudos-noreconf /etc/portage/env/cloudos-noreconf.bak && cloudpkg sync
    curl -fsSL https://raw.githubusercontent.com/wh1laye/cloudos-repo/main/tools/stage3/cloudos-users.sh | bash

первая команда убирает сломанный файл, вторая настраивает pam, su и пользователей. если у root нет пароля, задай его: `passwd`.

## 1.1

ошибки пакетного менеджера в версии 1.1: ошибка синтаксиса в `/etc/portage/env/cloudos-noreconf`. исправлено в 1.2, обход для 1.1 описан выше.
