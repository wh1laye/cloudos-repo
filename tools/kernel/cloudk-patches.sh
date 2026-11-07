CLOUDK_PATCH_URL=${CLOUDK_PATCH_URL:-https://raw.githubusercontent.com/CachyOS/kernel-patches}
CLOUDK_PATCH_API=${CLOUDK_PATCH_API:-https://api.github.com/repos/CachyOS/kernel-patches/commits/master}
CLOUDK_PATCH_PROTO=${CLOUDK_PATCH_PROTO:-=https}
CLOUDK_PIN=${CLOUDK_PIN:-0}
CLOUDK_PATCHES=""

cloudk_pcurl() { curl -fL --proto "$CLOUDK_PATCH_PROTO" --retry 3 --connect-timeout 20 -sS "$@"; }

cloudk_fetch_patches() {
  local lock=$HERE/patches.lock dir=$WORK/patches-fetched newlock=$WORK/patches.lock.new
  local kmm ref sum path orig file got n=0
  [ -f "$lock" ] || return 0
  case $CLOUDK_PIN in 0|1) ;; *) die "CLOUDK_PIN: 0 или 1" ;; esac
  kmm=$(printf '%s' "$KVER" | cut -d. -f1,2)
  ref=$(awk '$1 == "ref" { print $2 }' "$lock")
  if [ -z "$ref" ]; then
    [ "$CLOUDK_PIN" = 1 ] || die "в $lock не закреплён коммит патчей, запусти сборку с pin_patches"
    ref=$(cloudk_pcurl -H 'Accept: application/vnd.github.sha' "$CLOUDK_PATCH_API") || die "не получен коммит патчей"
  fi
  case $ref in *[!0-9a-f]*) die "неверный коммит патчей" ;; esac
  [ "${#ref}" = 40 ] || die "неверный коммит патчей"
  rm -rf "$dir"
  mkdir -p "$dir"
  printf 'ref %s\n' "$ref" > "$newlock"
  while read -r sum orig; do
    case $sum in ''|ref) continue ;; esac
    [ -n "$orig" ] || die "строка без пути в $lock"
    path=${orig//@KMM@/$kmm}
    case $path in /*|*..*|*[!0-9A-Za-z._/-]*) die "неверный путь патча: $orig" ;; esac
    n=$((n + 1))
    file=$dir/$(printf '%02d' "$n")-$(basename "$path")
    cloudk_pcurl -o "$file" "$CLOUDK_PATCH_URL/$ref/$path" || die "не скачался патч $path"
    got=$(sha256sum "$file" | cut -d' ' -f1)
    if [ "$sum" = - ]; then
      [ "$CLOUDK_PIN" = 1 ] || die "для $orig нет sha256 в $lock, запусти сборку с pin_patches"
    elif [ "$got" != "$sum" ]; then
      die "sha256 патча $path не совпал"
    fi
    printf '%s %s\n' "$got" "$orig" >> "$newlock"
    CLOUDK_PATCHES="$CLOUDK_PATCHES $file"
  done < "$lock"
  [ "$n" -gt 0 ] || die "в $lock нет патчей"
  if [ "$CLOUDK_PIN" = 1 ]; then
    mkdir -p "$OUT"
    install -m644 "$newlock" "$OUT/patches.lock"
    say "закрепление: готовый patches.lock в $OUT/patches.lock, положи его в tools/kernel/"
  fi
  say "патчи cloudk скачаны и проверены: $n"
}
