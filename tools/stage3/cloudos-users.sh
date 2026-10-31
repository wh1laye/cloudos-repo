#!/bin/bash
set -u
R=${CLOUDOS_ROOT:-}
bad=0
say() { printf '==> %s\n' "$*"; }
err() { printf '!! %s\n' "$*" >&2; bad=1; }
[ -n "$R" ] || [ "$(id -u)" = 0 ] || { echo "нужен root" >&2; exit 1; }
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

find_bin() {
  local d
  for d in /usr/sbin /usr/bin /sbin /bin; do [ -x "$R$d/$1" ] && { printf '%s' "$R$d/$1"; return 0; }; done
  return 1
}

MOD=""
for d in /usr/lib/security /usr/lib64/security /lib/security /lib64/security /usr/lib/*/security; do
  [ -e "$R$d/pam_unix.so" ] && { MOD=$R$d; break; }
done

say "утилиты shadow"
for t in useradd userdel usermod groupadd passwd chpasswd su login newgrp chage; do
  find_bin "$t" >/dev/null || err "нет $t"
done
[ -n "$MOD" ] || err "нет pam_unix.so: без pam вход и su не работают"

say "setuid"
for t in su passwd chsh chfn newgrp; do
  f=$(find_bin "$t") || continue
  [ -L "$f" ] && f=$(readlink -f "$f")
  chown 0:0 "$f" && chmod 4755 "$f" || err "не смог выставить setuid на $f"
done
f=$(find_bin unix_chkpwd) && { chown 0:0 "$f"; chmod 4755 "$f"; }

pam() {
  local n=$1 f=$R/etc/pam.d/$1
  install -d "$R/etc/pam.d"
  if [ -e "$f" ] && ! head -n 1 "$f" | grep -q '^# cloudos$' && [ ! -e "$f.pre-1.2" ]; then mv "$f" "$f.pre-1.2"; fi
  { echo '# cloudos'; cat; } > "$f"
  chmod 644 "$f"
}

say "pam"
has() { [ -n "$MOD" ] && [ -e "$MOD/$1" ]; }
{
  echo 'auth      required    pam_unix.so'
  echo 'account   required    pam_unix.so'
  echo 'password  required    pam_unix.so sha512 shadow try_first_pass'
  echo 'session   required    pam_unix.so'
  has pam_limits.so && echo 'session   required    pam_limits.so'
  has pam_env.so && echo 'session   optional    pam_env.so'
} | pam system-auth

printf '%s\n' 'auth      requisite   pam_nologin.so' 'auth      include     system-auth' 'account   include     system-auth' 'password  include     system-auth' 'session   include     system-auth' | pam login
for n in su su-l runuser runuser-l; do
  printf '%s\n' 'auth      sufficient  pam_rootok.so' 'auth      include     system-auth' 'account   include     system-auth' 'session   include     system-auth' | pam $n
done
printf '%s\n' 'auth      include     system-auth' 'account   include     system-auth' 'session   include     system-auth' | pam doas
printf '%s\n' 'password  include     system-auth' | pam passwd
for n in chpasswd newusers; do printf '%s\n' 'auth      sufficient  pam_rootok.so' 'account   include     system-auth' 'password  include     system-auth' | pam $n; done
for n in chage chfn chsh; do
  printf '%s\n' 'auth      sufficient  pam_rootok.so' 'auth      include     system-auth' 'account   include     system-auth' 'password  include     system-auth' | pam $n
done
[ -e "$R/etc/pam.d/other" ] || printf '%s\n' 'auth      required    pam_deny.so' 'account   required    pam_deny.so' 'password  required    pam_deny.so' 'session   required    pam_deny.so' | pam other

if [ -n "$MOD" ]; then
  for f in "$R"/etc/pam.d/*; do
    grep -q '^# cloudos$' "$f" || continue
    for m in $(grep -o 'pam_[a-z_]*\.so' "$f" | sort -u); do
      [ -e "$MOD/$m" ] || err "$f: нет модуля $m"
    done
  done
fi

say "login.defs"
LD=$R/etc/login.defs
[ -e "$LD" ] || { install -d "$R/etc"; : > "$LD"; }
setkey() {
  if grep -qE "^[# ]*$1[[:space:]]" "$LD"; then sed -i -E "s|^[# ]*$1[[:space:]].*|$1 $2|" "$LD"; else echo "$1 $2" >> "$LD"; fi
}
setkey ENCRYPT_METHOD SHA512
setkey USERGROUPS_ENAB yes
setkey CREATE_HOME yes
setkey ENV_PATH PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
setkey ENV_SUPATH PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
setkey SU_NAME su

say "useradd по умолчанию"
install -d "$R/etc/default" "$R/etc/skel" "$R/home"
[ -e "$R/etc/default/useradd" ] || printf '%s\n' 'HOME=/home' 'INACTIVE=-1' 'SHELL=/bin/bash' 'SKEL=/etc/skel' 'CREATE_MAIL_SPOOL=no' > "$R/etc/default/useradd"
grep -q '^SHELL=' "$R/etc/default/useradd" || echo 'SHELL=/bin/bash' >> "$R/etc/default/useradd"

say "shells"
touch "$R/etc/shells"
for s in /bin/sh /bin/bash /usr/bin/bash; do grep -qxF "$s" "$R/etc/shells" || echo "$s" >> "$R/etc/shells"; done

say "PATH для всех"
install -d "$R/etc/profile.d"
printf '%s\n' 'case ":$PATH:" in' '  *:/usr/sbin:*) ;;' '  *) PATH=$PATH:/usr/local/sbin:/usr/sbin:/sbin ;;' 'esac' 'export PATH' > "$R/etc/profile.d/cloudos-path.sh"
chmod 644 "$R/etc/profile.d/cloudos-path.sh"
if [ ! -e "$R/etc/profile" ]; then
  printf '%s\n' 'export PATH=/usr/local/bin:/usr/bin:/bin' > "$R/etc/profile"
fi
grep -q 'profile\.d' "$R/etc/profile" || printf '%s\n' '' 'for f in /etc/profile.d/*.sh; do [ -r "$f" ] && . "$f"; done' 'unset f' >> "$R/etc/profile"

say "skel"
[ -e "$R/etc/skel/.bash_profile" ] || printf '%s\n' '[ -f ~/.bashrc ] && . ~/.bashrc' > "$R/etc/skel/.bash_profile"
[ -e "$R/etc/skel/.bashrc" ] || printf '%s\n' '[[ $- != *i* ]] && return' "PS1='\\[\\e[38;5;110m\\]\\u\\[\\e[0m\\]@\\[\\e[38;5;153m\\]\\h\\[\\e[0m\\] \\[\\e[38;5;68m\\]\\w\\[\\e[0m\\] \\\$ '" "alias ls='ls --color=auto'" "alias ll='ls -la'" "alias grep='grep --color=auto'" > "$R/etc/skel/.bashrc"

if [ -z "$R" ]; then
  say "группы"
  getent group wheel >/dev/null || groupadd -g 10 wheel 2>/dev/null || groupadd wheel || err "не создалась группа wheel"
  getent group users >/dev/null || groupadd users || err "не создалась группа users"
  getent group video >/dev/null || groupadd video
  getent group audio >/dev/null || groupadd audio
fi

say "doas"
if [ ! -e "$R/etc/doas.conf" ]; then
  printf '%s\n' 'permit persist :wheel' 'permit nopass root' > "$R/etc/doas.conf"
  chmod 600 "$R/etc/doas.conf"
fi

if [ -z "$R" ] && [ -r /etc/shadow ]; then
  p=$(awk -F: '$1=="root"{print $2}' /etc/shadow)
  case $p in ''|'!'|'*'|'!!') printf '!! у root нет пароля: задай его командой passwd (иначе su и вход под root не работают)\n' >&2 ;; esac
fi

if [ "$bad" = 0 ]; then say "пользователи и вход настроены"; else echo "есть ошибки" >&2; fi
exit "$bad"
