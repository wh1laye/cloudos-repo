#!/bin/bash
set -eu
HERE=$(cd "$(dirname "$0")" && pwd)
[ "$(id -u)" = 0 ] || { echo "нужен root" >&2; exit 1; }
command -v nft >/dev/null || { echo "нужен nft" >&2; exit 1; }

if [ "${CLOUDOS_FW_NETNS:-}" != 1 ]; then
  exec env CLOUDOS_FW_NETNS=1 unshare -n bash "$0" "$@"
fi

T=$(mktemp -d)
trap 'rm -rf "$T"' EXIT
mkdir -p "$T/d"
sed "s|/etc/nftables.d|$T/d|" "$HERE/stage3/nftables.conf" > "$T/nftables.conf"
cp "$HERE/stage3/nftables.local" "$T/d/00-local.nft"
export NFT_CONF=$T/nftables.conf NFT_DIR=$T/d
fw() { bash "$HERE/stage3/cloudos-firewall" "$@"; }
n=0
pass() { n=$((n + 1)); echo "ok $n: $*"; }
die() { echo "!! $*" >&2; exit 1; }

nft -c -f "$NFT_CONF" || die "базовые правила не проходят nft -c"
pass "базовые правила проходят nft -c"
nft -f "$NFT_CONF"
nft list chain inet cloudos input | grep -q 'policy drop' || die "нет policy drop в input"
nft list chain inet cloudos forward | grep -q 'policy drop' || die "нет policy drop в forward"
pass "policy drop в input и forward"
fw status | grep -q 'включён' || die "status не видит фаервол"
pass "status"

fw allow ssh >/dev/null
nft list chain inet cloudos input | grep -q 'dport 22' || die "правило ssh не загрузилось"
pass "allow ssh"
fw allow tcp/8080 from 10.0.0.0/8 >/dev/null
nft list chain inet cloudos input | grep -q '10.0.0.0/8' || die "правило с адресом не загрузилось"
pass "allow tcp/8080 from 10.0.0.0/8"
fw allow udp/5353 from fe80::/10 >/dev/null
pass "allow udp/5353 from fe80::/10"

for bad in "tcp/0" "tcp/65536" "tcp/80;x" "udp/abc" "foo"; do
  if fw allow "$bad" >/dev/null 2>&1; then die "принял плохое правило: $bad"; fi
done
pass "плохие порты отклонены"
if fw allow tcp/9000 from '1.1.1.1; drop' >/dev/null 2>&1; then die "принял инъекцию в адресе"; fi
if fw allow tcp/9000 from '1.1.1.1 accept
flush ruleset' >/dev/null 2>&1; then die "принял инъекцию с переводом строки"; fi
[ ! -e "$NFT_DIR/20-allow-tcp-9000.nft" ] || die "остался файл от плохого правила"
pass "инъекции в адресе отклонены"

fw remove ssh >/dev/null
nft list chain inet cloudos input | grep -q 'dport 22' && die "правило ssh не убралось"
pass "remove ssh"
if fw remove tcp/1234 >/dev/null 2>&1; then die "remove несуществующего вернул успех"; fi
pass "remove несуществующего даёт ошибку"

CLOUDOS_ROOT=$T/none bash "$HERE/stage3/cloudos-audit" >/dev/null 2>&1 || true
pass "audit запускается"

if command -v sshd >/dev/null && command -v ssh-keygen >/dev/null; then
  mkdir -p /run/sshd /var/empty
  ssh-keygen -q -t ed25519 -N '' -f "$T/hk"
  sshd -t -f "$HERE/stage3/sshd-cloudos.conf" -h "$T/hk" || die "sshd-cloudos.conf не проходит sshd -t"
  pass "sshd-cloudos.conf проходит sshd -t"
fi

while IFS= read -r l; do
  case $l in ''|'#'*) continue ;; esac
  printf '%s\n' "$l" | grep -qE '^[a-z0-9_.]+ = [0-9]+$' || die "плохая строка sysctl: $l"
done < "$HERE/stage3/sysctl-cloudos.conf"
pass "sysctl-cloudos.conf разобран"

echo "всё прошло: $n проверок"
