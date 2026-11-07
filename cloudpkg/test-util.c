#include "cloudpkg.h"

static int fails;

static void want(const char *p, int ok)
{
	if (safe_dir(p) != ok) {
		fprintf(stderr, "ошибка: safe_dir(\"%s\") вернул %d, ожидалось %d\n", p, !ok, ok);
		fails++;
	}
}

int main(void)
{
	want("/var/db/repos/gentoo", 1);
	want("/var/cache/distfiles", 1);
	want("/srv/cloudos/repo", 1);
	want("/", 0);
	want("", 0);
	want("relative/path/x", 0);
	want("/usr", 0);
	want("/usr/", 0);
	want("/etc/portage", 0);
	want("/var/db/repos", 0);
	want("/var/db/repos/../..", 0);
	want("/home", 0);
	want("/home/", 0);
	want("/tmp", 0);
	want("/var//db", 0);
	if (fails)
		return 1;
	puts("ok: safe_dir");
	return 0;
}
