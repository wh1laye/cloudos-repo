CC ?= gcc
CFLAGS ?= -O2
CFLAGS += -std=gnu17 -Wall -Wextra -Wsign-conversion -Wformat=2 -Werror -Wno-format-truncation -fstack-protector-strong -fPIE -U_FORTIFY_SOURCE -D_FORTIFY_SOURCE=3
LDFLAGS += -pie -Wl,-z,relro,-z,now
PREFIX ?= /usr
DESTDIR ?=

all: cloudpkg

SRCS := cloudpkg.c util.c lock.c recipe.c db.c build.c cmds.c snap.c update.c

cloudpkg: $(SRCS) cloudpkg.h
	$(CC) $(CFLAGS) $(LDFLAGS) -o $@ $(SRCS)

install: cloudpkg
	@if [ -z "$(DESTDIR)" ] && [ -z "$$CLOUDPKG_FORCE" ] && ! grep -q '^ID="\?cloudos' /etc/os-release 2>/dev/null; then \
	  echo "cloudpkg: refusing to install into a non-CloudOS system; use DESTDIR for stage3/iso staging" >&2; \
	  exit 1; \
	fi
	install -Dm755 cloudpkg $(DESTDIR)$(PREFIX)/bin/cloudpkg

install-box:
	install -Dm755 cloudpkg-box.sh $(DESTDIR)/usr/local/bin/cloudpkg

conf:
	install -d $(DESTDIR)/etc/cloudpkg
	@if [ -f etc/cloudpkg/cloudos.pub ]; then install -m644 etc/cloudpkg/cloudos.pub $(DESTDIR)/etc/cloudpkg/cloudos.pub; fi
	@if [ ! -e $(DESTDIR)/etc/cloudpkg/cloudpkg.conf ]; then \
	  install -m644 etc/cloudpkg/cloudpkg.conf $(DESTDIR)/etc/cloudpkg/cloudpkg.conf; \
	elif ! cmp -s etc/cloudpkg/cloudpkg.conf $(DESTDIR)/etc/cloudpkg/cloudpkg.conf; then \
	  install -m644 etc/cloudpkg/cloudpkg.conf $(DESTDIR)/etc/cloudpkg/cloudpkg.conf.dist; \
	  echo "kept existing cloudpkg.conf, new version: cloudpkg.conf.dist"; \
	fi

clean:
	rm -f cloudpkg

.PHONY: all install install-box conf clean
