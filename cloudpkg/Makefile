CC ?= gcc
CFLAGS ?= -O2
CFLAGS += -std=gnu17 -Wall
PREFIX ?= /usr
DESTDIR ?=
JOBS := $(shell nproc 2>/dev/null || echo 2)
CONFS := cloudpkg.conf portage/make.conf portage/repos.conf/gentoo.conf portage/repos.conf/cloudos.conf portage/profile/package.provided

all: cloudpkg

cloudpkg: cloudpkg.c
	$(CC) $(CFLAGS) -o $@ $<

install: cloudpkg
	install -Dm755 cloudpkg $(DESTDIR)$(PREFIX)/bin/cloudpkg

install-box:
	install -Dm755 cloudpkg-box.sh $(DESTDIR)/usr/local/bin/cloudpkg

overlay:
	rm -rf $(DESTDIR)/var/db/repos/cloudos
	install -d $(DESTDIR)/var/db/repos
	cp -R overlay $(DESTDIR)/var/db/repos/cloudos

conf:
	install -d $(DESTDIR)/etc/cloudpkg $(DESTDIR)/etc/portage/repos.conf $(DESTDIR)/etc/portage/profile
	@for f in $(CONFS); do \
	  d=$(DESTDIR)/etc/$$f; \
	  if [ ! -e $$d ]; then \
	    install -m644 etc/$$f $$d; \
	    if [ $$f = portage/make.conf ]; then sed -i 's/^MAKEOPTS=.*/MAKEOPTS="-j$(JOBS)"/' $$d; fi; \
	  elif ! cmp -s etc/$$f $$d; then \
	    install -m644 etc/$$f $$d.dist; \
	    echo "оставил $$d как есть, новый вариант: $$d.dist"; \
	  fi; \
	done

clean:
	rm -f cloudpkg

.PHONY: all install install-box overlay conf clean
