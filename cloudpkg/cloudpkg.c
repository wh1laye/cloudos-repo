#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <errno.h>
#include <dirent.h>
#include <sys/stat.h>
#include <sys/wait.h>

#define VERSION "0.2"
#define CONF "/etc/cloudpkg/cloudpkg.conf"
#define MAXM 16
#define BUF 600

static char *mirrors[MAXM];
static int nmir;
static char repo[256] = "/var/db/repos/gentoo";
static char snap[160] = "snapshots/portage-latest.tar.xz";
static char dist[256] = "/var/cache/distfiles";

static int run(char *const av[])
{
	pid_t p = fork();
	int st;

	if (p < 0)
		return -1;
	if (p == 0) {
		execvp(av[0], av);
		fprintf(stderr, "cloudpkg: не найдена команда %s\n", av[0]);
		_exit(127);
	}
	if (waitpid(p, &st, 0) < 0)
		return -1;
	return WIFEXITED(st) ? WEXITSTATUS(st) : -1;
}

static char *trim(char *s)
{
	char *e;

	while (*s == ' ' || *s == '\t')
		s++;
	e = s + strlen(s);
	while (e > s && (e[-1] == '\n' || e[-1] == '\r' || e[-1] == ' ' || e[-1] == '\t'))
		*--e = 0;
	return s;
}

static void loadconf(void)
{
	FILE *f = fopen(CONF, "r");
	char line[BUF], *k, *v, *eq;

	if (f) {
		while (fgets(line, sizeof line, f)) {
			k = trim(line);
			if (!*k || *k == '#')
				continue;
			eq = strchr(k, '=');
			if (!eq)
				continue;
			*eq = 0;
			v = trim(eq + 1);
			k = trim(k);
			if (!strcmp(k, "mirror") && nmir < MAXM)
				mirrors[nmir++] = strdup(v);
			else if (!strcmp(k, "repo"))
				snprintf(repo, sizeof repo, "%s", v);
			else if (!strcmp(k, "snapshot"))
				snprintf(snap, sizeof snap, "%s", v);
			else if (!strcmp(k, "distdir"))
				snprintf(dist, sizeof dist, "%s", v);
		}
		fclose(f);
	}
	if (!nmir) {
		mirrors[nmir++] = strdup("https://mirrors.ustc.edu.cn/gentoo");
		mirrors[nmir++] = strdup("https://mirrors.aliyun.com/gentoo");
		mirrors[nmir++] = strdup("https://mirror.yandex.ru/gentoo-distfiles");
		mirrors[nmir++] = strdup("https://distfiles.gentoo.org");
	}
}

static int need_root(void)
{
	if (geteuid() != 0) {
		fprintf(stderr, "cloudpkg: нужны права root\n");
		return 0;
	}
	return 1;
}

static int exists(const char *p)
{
	struct stat st;

	return stat(p, &st) == 0;
}

static int emerge(char **pre, int npre, char **pk, int npk)
{
	char **av = calloc(npre + npk + 2, sizeof *av);
	int i, n = 0, r;

	av[n++] = "emerge";
	for (i = 0; i < npre; i++)
		av[n++] = pre[i];
	for (i = 0; i < npk; i++)
		av[n++] = pk[i];
	av[n] = NULL;
	r = run(av);
	free(av);
	return r;
}

static int cmd_sync(void)
{
	char part[BUF], fin[BUF], url[BUF + 32], nw[BUF], old[BUF];
	char *a[16];
	int i, ok = 0;

	if (!need_root())
		return 1;
	snprintf(part, sizeof part, "%s/portage-latest.part", dist);
	snprintf(fin, sizeof fin, "%s/portage-latest.tar.xz", dist);
	snprintf(nw, sizeof nw, "%s.new", repo);
	snprintf(old, sizeof old, "%s.old", repo);
	a[0] = "mkdir"; a[1] = "-p"; a[2] = dist; a[3] = NULL;
	run(a);
	unlink(part);
	for (i = 0; i < nmir && !ok; i++) {
		snprintf(url, sizeof url, "%s/%s", mirrors[i], snap);
		printf("cloudpkg: загрузка %s\n", url);
		a[0] = "curl"; a[1] = "-fL"; a[2] = "--retry"; a[3] = "3";
		a[4] = "--connect-timeout"; a[5] = "20"; a[6] = "-o"; a[7] = part;
		a[8] = url; a[9] = NULL;
		if (run(a) == 0)
			ok = 1;
	}
	if (!ok) {
		fprintf(stderr, "cloudpkg: ни одно зеркало не ответило\n");
		fprintf(stderr, "cloudpkg: положи снимок в %s и запусти sync снова\n", fin);
		if (!exists(fin))
			return 1;
	} else {
		unlink(fin);
		if (rename(part, fin) != 0) {
			perror("cloudpkg: rename");
			return 1;
		}
	}
	a[0] = "rm"; a[1] = "-rf"; a[2] = nw; a[3] = NULL;
	run(a);
	a[0] = "mkdir"; a[1] = "-p"; a[2] = nw; a[3] = NULL;
	run(a);
	a[0] = "tar"; a[1] = "xf"; a[2] = fin; a[3] = "--strip-components=1";
	a[4] = "-C"; a[5] = nw; a[6] = NULL;
	if (run(a) != 0) {
		fprintf(stderr, "cloudpkg: не удалось распаковать снимок\n");
		return 1;
	}
	snprintf(url, sizeof url, "%s/profiles", nw);
	if (!exists(url)) {
		fprintf(stderr, "cloudpkg: в снимке нет profiles, дерево не заменено\n");
		return 1;
	}
	a[0] = "mkdir"; a[1] = "-p"; a[2] = "/var/db/repos"; a[3] = NULL;
	run(a);
	a[0] = "rm"; a[1] = "-rf"; a[2] = old; a[3] = NULL;
	run(a);
	if (exists(repo) && rename(repo, old) != 0) {
		perror("cloudpkg: rename");
		return 1;
	}
	if (rename(nw, repo) != 0) {
		perror("cloudpkg: rename");
		return 1;
	}
	a[0] = "rm"; a[1] = "-rf"; a[2] = old; a[3] = NULL;
	run(a);
	printf("cloudpkg: дерево обновлено\n");
	return 0;
}

static int cmd_install(int argc, char **argv)
{
	char *pre[8];
	char *pk[64];
	int npre = 0, npk = 0, i;

	pre[npre++] = "--verbose";
	pre[npre++] = "--noreplace";
	for (i = 0; i < argc; i++) {
		if (!strcmp(argv[i], "-p") || !strcmp(argv[i], "--pretend"))
			pre[npre++] = "--pretend";
		else if (!strcmp(argv[i], "-o") || !strcmp(argv[i], "--oneshot"))
			pre[npre++] = "--oneshot";
		else if (!strcmp(argv[i], "-t") || !strcmp(argv[i], "--testing"))
			setenv("ACCEPT_KEYWORDS", "~amd64", 1);
		else if (npk < 64)
			pk[npk++] = argv[i];
	}
	if (!npk) {
		fprintf(stderr, "cloudpkg: укажи пакеты\n");
		return 1;
	}
	if (!need_root())
		return 1;
	return emerge(pre, npre, pk, npk);
}

static int cmd_remove(int argc, char **argv)
{
	char *pre[4];
	char *pk[64];
	int npre = 0, npk = 0, i;

	pre[npre++] = "--unmerge";
	pre[npre++] = "--verbose";
	for (i = 0; i < argc; i++) {
		if (!strcmp(argv[i], "-p") || !strcmp(argv[i], "--pretend"))
			pre[npre++] = "--pretend";
		else if (npk < 64)
			pk[npk++] = argv[i];
	}
	if (!npk) {
		fprintf(stderr, "cloudpkg: укажи пакеты\n");
		return 1;
	}
	if (!need_root())
		return 1;
	return emerge(pre, npre, pk, npk);
}

static int cmd_upgrade(int argc, char **argv)
{
	char *pre[8];
	int npre = 0, i;
	char *w = "@world";

	pre[npre++] = "--update";
	pre[npre++] = "--deep";
	pre[npre++] = "--newuse";
	pre[npre++] = "--verbose";
	for (i = 0; i < argc; i++)
		if (!strcmp(argv[i], "-p") || !strcmp(argv[i], "--pretend"))
			pre[npre++] = "--pretend";
	if (!need_root())
		return 1;
	return emerge(pre, npre, &w, 1);
}

static int cmd_clean(int argc, char **argv)
{
	char *pre[4];
	char *a[8];
	int npre = 0, i, pretend = 0, r;

	pre[npre++] = "--depclean";
	for (i = 0; i < argc; i++)
		if (!strcmp(argv[i], "-p") || !strcmp(argv[i], "--pretend")) {
			pre[npre++] = "--pretend";
			pretend = 1;
		}
	if (!need_root())
		return 1;
	r = emerge(pre, npre, NULL, 0);
	if (pretend)
		return r;
	a[0] = "find"; a[1] = dist; a[2] = "-mindepth"; a[3] = "1"; a[4] = "-delete"; a[5] = NULL;
	run(a);
	a[0] = "find"; a[1] = "/var/tmp/portage"; a[2] = "-mindepth"; a[3] = "1"; a[4] = "-delete"; a[5] = NULL;
	run(a);
	printf("cloudpkg: кеш исходников и временные файлы очищены\n");
	return r;
}

static int cmd_search(int argc, char **argv)
{
	char *pre[2];

	if (!argc) {
		fprintf(stderr, "cloudpkg: укажи строку поиска\n");
		return 1;
	}
	pre[0] = "--search";
	return emerge(pre, 1, argv, argc);
}

static int cmd_info(int argc, char **argv)
{
	char *pre[4];

	if (!argc) {
		fprintf(stderr, "cloudpkg: укажи пакет\n");
		return 1;
	}
	pre[0] = "--pretend";
	pre[1] = "--verbose";
	pre[2] = "--nodeps";
	return emerge(pre, 3, argv, argc);
}

static int cmd_list(void)
{
	struct dirent **cats, **pkgs;
	char path[BUF];
	int nc, np, i, j;

	nc = scandir("/var/db/pkg", &cats, NULL, alphasort);
	if (nc < 0) {
		fprintf(stderr, "cloudpkg: нет /var/db/pkg\n");
		return 1;
	}
	for (i = 0; i < nc; i++) {
		if (cats[i]->d_name[0] == '.')
			continue;
		snprintf(path, sizeof path, "/var/db/pkg/%s", cats[i]->d_name);
		np = scandir(path, &pkgs, NULL, alphasort);
		for (j = 0; j < np; j++) {
			if (pkgs[j]->d_name[0] != '.')
				printf("%s/%s\n", cats[i]->d_name, pkgs[j]->d_name);
			free(pkgs[j]);
		}
		if (np >= 0)
			free(pkgs);
		free(cats[i]);
	}
	free(cats);
	return 0;
}

static int check(const char *name, int ok)
{
	printf("%-28s %s\n", name, ok ? "ok" : "НЕТ");
	return ok;
}

static int cmd_doctor(void)
{
	char p[BUF];
	int bad = 0;

	bad += !check("emerge в PATH", access("/usr/bin/emerge", X_OK) == 0);
	bad += !check("пользователь portage", system("getent passwd portage >/dev/null") == 0);
	snprintf(p, sizeof p, "%s/profiles", repo);
	bad += !check("дерево рецептов", exists(p));
	bad += !check("make.conf", exists("/etc/portage/make.conf"));
	bad += !check("профиль (make.profile)", exists("/etc/portage/make.profile"));
	bad += !check("package.provided", exists("/etc/portage/profile/package.provided"));
	bad += !check("curl", system("command -v curl >/dev/null") == 0);
	bad += !check("tar", system("command -v tar >/dev/null") == 0);
	printf("%s\n", bad ? "есть проблемы" : "всё в порядке");
	return bad ? 1 : 0;
}

static void usage(void)
{
	puts("cloudpkg " VERSION " (обёртка над portage)\n"
	     "использование: cloudpkg команда [параметры]\n\n"
	     "  sync                  обновить дерево рецептов (снимок gentoo)\n"
	     "  install [-p] [-o] [-t] пакет...   установить из исходников\n"
	     "  remove  [-p] пакет...  удалить\n"
	     "  upgrade [-p]          обновить все пакеты\n"
	     "  clean   [-p]          удалить лишние пакеты и очистить кеш\n"
	     "  search  строка        найти пакет\n"
	     "  info    пакет         показать, что будет установлено\n"
	     "  list                  список установленных пакетов\n"
	     "  doctor                проверить настройку\n"
	     "  version, help\n\n"
	     "-p пробный запуск, -o не добавлять в world, -t разрешить testing (~amd64)");
}

int main(int argc, char **argv)
{
	const char *c;

	if (argc < 2) {
		usage();
		return 1;
	}
	c = argv[1];
	loadconf();
	if (!strcmp(c, "sync"))
		return cmd_sync();
	if (!strcmp(c, "install"))
		return cmd_install(argc - 2, argv + 2);
	if (!strcmp(c, "remove"))
		return cmd_remove(argc - 2, argv + 2);
	if (!strcmp(c, "upgrade"))
		return cmd_upgrade(argc - 2, argv + 2);
	if (!strcmp(c, "clean"))
		return cmd_clean(argc - 2, argv + 2);
	if (!strcmp(c, "search"))
		return cmd_search(argc - 2, argv + 2);
	if (!strcmp(c, "info"))
		return cmd_info(argc - 2, argv + 2);
	if (!strcmp(c, "list"))
		return cmd_list();
	if (!strcmp(c, "doctor"))
		return cmd_doctor();
	if (!strcmp(c, "version") || !strcmp(c, "--version")) {
		puts("cloudpkg " VERSION);
		return 0;
	}
	if (!strcmp(c, "help") || !strcmp(c, "--help") || !strcmp(c, "-h")) {
		usage();
		return 0;
	}
	fprintf(stderr, "cloudpkg: неизвестная команда %s\n", c);
	usage();
	return 1;
}
