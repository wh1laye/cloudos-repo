CC ?= gcc
CFLAGS ?= -O2
CFLAGS += -std=gnu17 -Wall
PREFIX ?= /usr
DESTDIR ?=
JOBS := $(shell nproc 2>/dev/null || echo 2)

all: cloudpkg

cloudpkg: cloudpkg.c
	$(CC) $(CFLAGS) -o $@ $<

install: cloudpkg
	install -Dm755 cloudpkg $(DESTDIR)$(PREFIX)/bin/cloudpkg

conf:
	install -d $(DESTDIR)/etc/cloudpkg $(DESTDIR)/etc/portage/repos.conf $(DESTDIR)/etc/portage/profile
	for f in cloudpkg.conf portage/make.conf portage/repos.conf/gentoo.conf portage/profile/package.provided; do \
	  if [ -f $(DESTDIR)/etc/$$f ] && ! cmp -s etc/$$f $(DESTDIR)/etc/$$f; then cp $(DESTDIR)/etc/$$f $(DESTDIR)/etc/$$f.old; fi; \
	  install -m644 etc/$$f $(DESTDIR)/etc/$$f; \
	done
	sed -i 's/^MAKEOPTS=.*/MAKEOPTS="-j$(JOBS)"/' $(DESTDIR)/etc/portage/make.conf

clean:
	rm -f cloudpkg

.PHONY: all install conf clean
