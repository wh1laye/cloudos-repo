# cloudpkg 2.2
Автономный пакетный менеджер CloudOS: сборка из исходников, учёт файлов, мир-сет, снимки, самообновление. Один бинарник на C, без чужих движков.
## Команды
cloudpkg sync, update, fix, install, remove, upgrade, clean, search, info, list, files, owns, doctor, snapshot, rollback.
## Как это работает
Рецепты берутся из отдельного репозитория cloudpkg-recipes. Сборка идет в /var/tmp/cloudpkg-build, установка через DESTDIR с проверкой конфликтов. База: /var/db/cloudpkg/installed.
## Лицензия
Код: MIT. Рецепты: лицензия проекта.
