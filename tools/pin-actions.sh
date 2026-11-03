#!/usr/bin/env bash
set -eu
cd "$(dirname "$0")/.."
MODE=pin
case "${1:-}" in
	--check) MODE=check ;;
	--strict) MODE=strict ;;
	"") ;;
	*) echo "использование: $0 [--check|--strict]" >&2; exit 2 ;;
esac

list() {
	grep -hoE 'uses:[[:space:]]*[A-Za-z0-9_.-]+/[A-Za-z0-9_./-]+@[A-Za-z0-9_.-]+' .github/workflows/*.yml \
		| sed -E 's/^uses:[[:space:]]*//' | sort -u | grep -vE '@[0-9a-f]{40}$' || true
}

todo=$(list)
if [ -z "$todo" ]; then
	echo "все actions закреплены по sha"
	exit 0
fi

if [ "$MODE" != pin ]; then
	while IFS= read -r x; do
		echo "::warning::action не закреплён по sha: $x"
	done <<< "$todo"
	[ "$MODE" = strict ] && exit 1
	exit 0
fi

command -v git >/dev/null || { echo "нет git" >&2; exit 1; }
while IFS= read -r x; do
	act=${x%@*}
	tag=${x##*@}
	repo=$(printf '%s' "$act" | cut -d/ -f1-2)
	out=$(git ls-remote "https://github.com/$repo.git" "refs/tags/$tag" "refs/tags/$tag^{}" "refs/heads/$tag" || true)
	sha=$(printf '%s\n' "$out" | awk '/\^\{\}$/ { p = $1 } NF { if (!a) a = $1 } END { print (p != "" ? p : a) }')
	printf '%s' "$sha" | grep -qE '^[0-9a-f]{40}$' || { echo "не удалось найти sha для $x" >&2; exit 1; }
	esc=${act//./\\.}
	sed -i -E "s~(uses:[[:space:]]*)$esc@$tag([[:space:]]|\$)~\1$act@$sha # $tag\2~" .github/workflows/*.yml
	echo "$x -> $sha"
done <<< "$todo"
echo "готово, проверь git diff и запушь"
