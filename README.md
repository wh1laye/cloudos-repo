<div align="center">

# ☁️ CloudOS

**Своя Linux система, собранная с нуля.**
Простая, лёгкая и без ничего лишнего.

[![Версия](https://img.shields.io/badge/версия-1.4-9cc8f2?style=for-the-badge)](https://github.com/wh1laye/cloudos-repo/releases)
[![Лицензия](https://img.shields.io/badge/лицензия-MIT-3b5fa8?style=for-the-badge)](#-лицензия)
[![Система](https://img.shields.io/badge/система-x86__64-cfe3f8?style=for-the-badge&labelColor=3b5fa8)](#-что-внутри)

[🌐 Сайт и handbook](https://wh1laye.github.io/cloudos-repo/) · [📦 Скачать](https://wh1laye.github.io/cloudos-repo/releases/) · [💬 Форум](https://wh1laye.github.io/cloudos-repo/forum/)

</div>

---

## 👋 Что это

CloudOS это Linux система, которую я собираю сам, шаг за шагом, по книге [LFS](https://www.linuxfromscratch.org/).
Это не копия другого дистрибутива.
Ты ставишь систему сам и понимаешь, что где лежит.

После установки у тебя будет чистая консоль и пользователь `root`.
Всё остальное ты добавляешь сам, так как хочешь.

> 🚧 Проект живёт в моём темпе. Сроков выхода версий нет. Сейчас актуальная версия: **1.4**.

---

## 🧩 Что внутри

| | Что | Как у нас |
|---|---|---|
| 🏗️ | **База** | LFS с нуля, библиотека `glibc` |
| 🚀 | **Запуск системы** | `openrc` |
| 🥾 | **Загрузчик** | `limine` (ставишь сам или через мастер) |
| 📦 | **Initramfs** | `dracut` |
| 💽 | **Файловые системы** | `ext4` и `btrfs` |
| 🖥️ | **Железо** | только `x86_64`, UEFI и старый BIOS |
| 🌐 | **Сеть** | `dhcpcd`, wifi: `iwd` |
| 📜 | **Логи** | системный лог `syslog-ng` |
| 🔐 | **Права** | `doas` вместо `sudo` |
| 🔑 | **Удалённый доступ** | `openssh`, `rsync`, `wget` |
| 🛡️ | **Фаервол** | `nftables`: входящие закрыты, исходящие открыты, управление через `cloudos-firewall`, проверка через `cloudos-audit` |
| 📖 | **Справка** | `man-db` и `man-pages` |
| 🐚 | **Оболочка** | `bash` |
| ⚙️ | **Компиляторы** | `gcc` и `clang`, выбираешь сам |

А чего нет специально:

- ❌ нет графики и окружений рабочего стола
- ❌ sshd выключен по умолчанию (`openssh` стоит, включается через `rc-update add sshd default` и `cloudos-firewall allow ssh`), root по ssh закрыт
- ❌ нет графического установщика (есть [мастер установки](https://wh1laye.github.io/cloudos-repo/wizard/): он выдаёт готовый скрипт)

---

## 🚀 Как поставить

Установка примерно как в Gentoo: вручную по справочнику или одним скриптом из [мастера установки](https://wh1laye.github.io/cloudos-repo/wizard/). Подробно всё написано в [handbook](https://wh1laye.github.io/cloudos-repo/), здесь только общий путь:

1. 💿 Загрузись с живого образа.
2. 🗂️ Размети диск (`cfdisk`).
3. 📥 Скачай архив системы `stage 3` со [страницы релизов](https://wh1laye.github.io/cloudos-repo/releases/).
4. ✅ Проверь, что файл целый (команда ниже).
5. 📂 Распакуй его в новый раздел.
6. 🔧 Настрой ядро, загрузчик и сеть по handbook.

### ✅ Проверка файла

Положи архив и файл `.sha256` в одну папку и выполни:

```bash
sha256sum -c cloudos-stage3-amd64-1.4.tar.xz.sha256
```

Если написано `OK`, всё хорошо.

Подпись minisign (если в релизе есть `.minisig`):

```bash
curl -LO https://wh1laye.github.io/cloudos-repo/cloudos.pub
minisign -V -p cloudos.pub -m cloudos-stage3-amd64-1.4.tar.xz
```

---

## 📦 Пакеты

Программы ставятся **только из исходников** через наш менеджер `cloudpkg`:

```bash
cloudpkg sync      # обновить список пакетов
cloudpkg install   # поставить пакет
cloudpkg remove    # удалить пакет
cloudpkg upgrade   # обновить то, что устарело
cloudpkg clean     # почистить кэш
```

Рецепты пакетов мы берём из Gentoo (они под лицензией GPL-2).

### Установка cloudpkg одной командой

```bash
curl -fsSL https://raw.githubusercontent.com/wh1laye/cloudos-repo/main/cloudpkg/install.sh | sh
```

- **В CloudOS** скрипт соберёт `cloudpkg`, поставит portage и загрузит дерево рецептов.
- **На любом другом дистрибутиве** (Arch, Debian, Ubuntu, Fedora и другие, x86_64) система не трогается: скрипт скачает stage 3, проверит sha256 и положит отдельный корень CloudOS в `/var/lib/cloudpkg/box`. Пакеты ставятся туда, а `cloudpkg run`, `cloudpkg export` и `cloudpkg shell` дают к ним доступ. Нужно 4 ГБ свободного места.

Подробнее в [cloudpkg/README.md](cloudpkg/README.md).

---

## 🗺️ Что в этом репозитории

```
cloudos-repo/
├── docs/              🌐 сайт и handbook
│   ├── forum/         💬 форум
│   └── releases/      📦 страница загрузок
└── cloudpkg/          🛠️ пакетный менеджер (язык C)
```

- 🌐 **Сайт** работает на GitHub Pages.
- 💬 **Форум** работает на бесплатном Supabase: можно войти через github, по почте или анонимно.
- 📦 **Файлы системы** лежат в [Releases](https://github.com/wh1laye/cloudos-repo/releases), страница загрузок берёт их оттуда сама.

---

## 🤝 Как помочь

- 🐛 Нашёл ошибку? Напиши на [форуме](https://wh1laye.github.io/cloudos-repo/forum/) или открой issue.
- 💡 Есть идея? Её место в разделе «предложения» на форуме.
- 🔀 Хочешь поправить код? Присылай pull request.

---

## 📄 Лицензия

- Мой код и тексты: **MIT**. Только оставь имя автора и название проекта.
- Рецепты пакетов из Gentoo остаются под **GPL-2**.

---

<div align="center">

Автор [wh1laye](https://github.com/wh1laye)

</div>
