<div align="center">

# ☁️ CloudOS

**Своя Linux система, собранная с нуля.**
Простая, лёгкая и без ничего лишнего.

[![Версия](https://img.shields.io/badge/версия-2.1-9cc8f2?style=for-the-badge)](https://github.com/wh1laye/cloudos-repo/releases)
[![Лицензия](https://img.shields.io/badge/лицензия-MIT-3b5fa8?style=for-the-badge)](#-лицензия)
[![Система](https://img.shields.io/badge/система-x86__64-cfe3f8?style=for-the-badge&labelColor=3b5fa8)](#-что-внутри)

[![iso](https://github.com/wh1laye/cloudos-repo/actions/workflows/iso.yml/badge.svg)](https://github.com/wh1laye/cloudos-repo/actions/workflows/iso.yml)

[🌐 Сайт и handbook](https://wh1laye.github.io/cloudos-repo/) · [📦 Скачать](https://wh1laye.github.io/cloudos-repo/releases/) · [💬 Форум](https://wh1laye.github.io/cloudos-repo/forum/) · [🔐 Проверка файлов](https://wh1laye.github.io/cloudos-repo/verify/) · [📊 Статус сборок](https://wh1laye.github.io/cloudos-repo/status/) · [🛡 Безопасность](https://wh1laye.github.io/cloudos-repo/security/)

</div>

---

## 👋 Что это

CloudOS это Linux система, которую я собираю сам, шаг за шагом, по книге [LFS](https://www.linuxfromscratch.org/).
Это не копия другого дистрибутива.
Ты ставишь систему сам и понимаешь, что где лежит.

После установки у тебя чистая консоль и обычный пользователь с `doas`.
Всё остальное ты добавляешь сам, так как хочешь.

> 🚧 Проект живёт в моём темпе. Сроков выхода версий нет. Готовится **live iso 2.1**: установка одной командой, без stage 3.

---

## 🧩 Что внутри

| | Что | Как у нас |
|---|---|---|
| 🏗️ | **База** | LFS с нуля, библиотека `glibc` |
| 🚀 | **Запуск системы** | `openrc` |
| 🥾 | **Загрузчик** | `limine` (ставит установщик) |
| 📦 | **Загрузка ядра** | без initramfs, драйверы дисков и файловые системы встроены в ядро |
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
- ❌ нет графического установщика (есть консольный установщик `cloudos-install`)

---

## 🚀 Как поставить

Подробно всё написано в [handbook](https://wh1laye.github.io/cloudos-repo/handbook/), здесь только общий путь:

1. 💿 Скачай live iso со [страницы релизов](https://wh1laye.github.io/cloudos-repo/releases/) и проверь сумму.
2. 🔌 Запиши на флешку и загрузись с неё. Вход в live: `cloudos` / `cloudos`.
3. ⚡ Выполни `doas cloudos-install`: режим `auto` стирает выбранный диск целиком, режим `manual` даёт разметить диск через cfdisk, fdisk или sfdisk и трогает только выбранные разделы root и boot. дальше он форматирует, монтирует в `/mnt/cloudos`, распаковывает систему из iso, ставит limine и создаёт пользователей.
4. 🔁 `reboot`.

Вручную то же самое описано в handbook, раздел «установка вручную».

### ✅ Проверка файла

```bash
sha256sum -c cloudos-live-amd64-2.1.iso.sha256
```

Подпись minisign (если в релизе есть `.minisig`):

```bash
curl -LO https://wh1laye.github.io/cloudos-repo/cloudos.pub
minisign -V -p cloudos.pub -m cloudos-live-amd64-2.1.iso
```

Шифрование диска luks2 есть в установщике (`CLOUDOS_LUKS=1`), iso можно собрать под x86-64-v3. Secure boot на своих ключах: `CLOUDOS_SECUREBOOT=1`, подробности в `cloudos-secureboot`. Профили установки: `CLOUDOS_PROFILE=balanced|secure|fast`. Проверка защиты: `doas cloudos-audit`.

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

## 🛡️ Защита в live iso 2.1

- 🔏 `cloudpkg update` и `install.sh` проверяют подпись minisign
- 🧱 `cloudos-uki`: подписанный unified kernel image, параметры ядра зашиты (`CLOUDOS_UKI=1`)
- 🔑 `cloudos-tpm2`: разблокировка luks через tpm2 по pcr 7, пароль остаётся запасным
- 🛡️ apparmor в ядре, профили в режиме complain, `aa-enforce` включает их
- 📋 `cloudos-audit --cis`: проверки по мотивам cis benchmark

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
