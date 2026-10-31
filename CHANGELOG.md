# changelog

#BUG решение - rm /etc/portage/env/cloudos-noreconf

## 1.2 (stage 3 и cloudpkg 0.6)

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
