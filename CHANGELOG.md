ошибки пакетного менеджера в версии 1.1
ошибка синтаксиса в `/etc/portage/env/cloudos-noreconf`
чтобы ее исправить введите команду
mv /etc/portage/env/cloudos-noreconf /etc/portage/env/cloudos-noreconf.bak && cloudpkg sync
в следующем обновлении этот баг будет исправлен
