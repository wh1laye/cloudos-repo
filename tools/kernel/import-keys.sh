#!/bin/bash
set -u
fpr=${1:-}
[ -n "$fpr" ] || exit 1
for url in \
  "https://keys.openpgp.org/vks/v1/by-fingerprint/$fpr" \
  "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x$fpr" \
  "https://pgp.mit.edu/pks/lookup?op=get&search=0x$fpr"\; do
  if curl -fsSL --connect-timeout 15 --retry 3 --retry-delay 5 "$url" | gpg --batch --quiet --import - 2>/dev/null; then
    exit 0
  fi
done
exit 1
