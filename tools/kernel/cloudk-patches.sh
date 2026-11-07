CLOUDK_PATCH_URL=${CLOUDK_PATCH_URL:-https://raw.githubusercontent.com/CachyOS/kernel-patches}
CLOUDK_PATCH_LIST=${CLOUDK_PATCH_LIST:-https://api.github.com/repos/CachyOS/kernel-patches/commits}
CLOUDK_PATCH_PROTO=${CLOUDK_PATCH_PROTO:-=https}
CLOUDK_PATCH_UNTIL=${CLOUDK_PATCH_UNTIL:-}
CLOUDK_PATCH_DEPTH=${CLOUDK_PATCH_DEPTH:-100}
CLOUDK_PIN=${CLOUDK_PIN:-0}
CLOUDK_PATCHES=""

cloudk_pcurl() { curl -fL --proto "$CLOUDK_PATCH_PROTO" --retry 3 --connect-timeout 20 -sS "$@"; }

cloudk_pick_ref() {
  local kmm=$1 url c p f i okc tried=0 sc=$WORK/scratch
  shift
  url="$CLOUDK_PATCH_LIST?path=$kmm&per_page=$CLOUDK_PATCH_DEPTH"
  if [ -n "$CLOUDK_PATCH_UNTIL" ]; then
    case $CLOUDK_PATCH_UNTIL in [0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]) ;; *) die "patches_until: гггг-мм-дд" ;; esac
    url="$url&until=${CLOUDK_PATCH_UNTIL}T23:59:59Z"
  fi
  mkdir -p "$WORK"
  cloudk_pcurl -o "$WORK/commits.json" "$url" || die "не получен список коммитов патча"
  grep -Eo '^ {4}"sha": *"[0-9a-f]{40}"' "$WORK/commits.json" | sed 's/.*"\([0-9a-f]\{40\}\)".*/\1/' > "$WORK/commits.sha" || die "нет коммитов патча"
  [ -s "$WORK/commits.sha" ] || die "нет коммитов патча"
  while read -r c; do
    tried=$((tried + 1))
    rm -rf "$WORK/probe" "$sc"
    mkdir -p "$WORK/probe" "$sc"
    okc=1
    i=0
    for p in "$@"; do
      i=$((i + 1))
      if ! cloudk_pcurl -o "$WORK/probe/$i.patch" "$CLOUDK_PATCH_URL/$c/$p"; then okc=0; break; fi
    done
    [ "$okc" = 1 ] || continue
    sed -n 's#^+++ b/\([^[:space:]]*\).*#\1#p' "$WORK"/probe/*.patch | sort -u > "$WORK/probe/files"
    while read -r f; do
      if [ -f "$f" ]; then cp --parents "$f" "$sc"/; fi
    done < "$WORK/probe/files"
    for i in $(seq 1 $#); do
      if ! patch -p1 -s -d "$sc" < "$WORK/probe/$i.patch" >/dev/null 2>&1; then okc=0; break; fi
    done
    if [ "$okc" = 1 ]; then
      rm -rf "$WORK/probe" "$sc"
      say "патчи из коммита $c ложатся на $KVER друг за другом (проверено коммитов: $tried)"
      CLOUDK_PICKED=$c
      return 0
    fi
  done < "$WORK/commits.sha"
  rm -rf "$WORK/probe" "$sc"
  die "ни один из $tried последних коммитов ($kmm) не даёт патчи, которые ложатся на $KVER, возьми другую версию ядра"
}

cloudk_fetch_patches() {
  local lock=$HERE/patches.lock dir=$WORK/patches-fetched newlock=$WORK/patches.lock.new
  local kmm ref sum path orig file got first plist n=0
  [ -f "$lock" ] || return 0
  case $CLOUDK_PIN in 0|1) ;; *) die "CLOUDK_PIN: 0 или 1" ;; esac
  kmm=$(printf '%s' "$KVER" | cut -d. -f1,2)
  ref=$(awk '$1 == "ref" { print $2 }' "$lock")
  if [ -z "$ref" ]; then
    [ "$CLOUDK_PIN" = 1 ] || die "в $lock не закреплён коммит патчей, запусти сборку с pin_patches"
    plist=$(awk '$1 != "ref" && $1 != "" { print $2 }' "$lock")
    set --
    for first in $plist; do
      first=${first//@KMM@/$kmm}
      case $first in ''|/*|*..*|*[!0-9A-Za-z._/-]*) die "неверный путь патча в $lock" ;; esac
      set -- "$@" "$first"
    done
    [ "$#" -gt 0 ] || die "в $lock нет патчей"
    cloudk_pick_ref "$kmm" "$@"
    ref=$CLOUDK_PICKED
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
    say "закрепление: готовый tools/kernel/patches.lock"
    printf '%s\n' '----- patches.lock -----'
    cat "$newlock"
    printf '%s\n' '----- конец -----'
  fi
  say "патчи cloudk скачаны и проверены: $n"
}
