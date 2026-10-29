#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <errno.h>
#include <dirent.h>
#include <pwd.h>
#include <sys/stat.h>
#include <sys/wait.h>

#define VERSION "0.4"
#define CONF "/etc/cloudpkg/cloudpkg.conf"
#define INSTALL_URL "https://raw.githubusercontent.com/wh1laye/cloudos-repo/main/cloudpkg/install.sh"
#define OVERLAY "/var/db/repos/cloudos"
#define MAXM 16
#define BUF 600

static char *mirrors[MAXM];
static int nmir;
static char *falls[MAXM];
static int nfall;
static char repo[256] = "/var/db/repos/gentoo";
static char snap[160] = "snapshots/portage-latest.tar.xz";
static char dist[256] = "/var/cache/distfiles";
static char prof[160] = "default/linux/amd64/23.0";
static int allow_host;

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

static int safe_dir(const char *p)
{
	static const char *bad[] = {
		"/", "/usr", "/etc", "/bin", "/sbin", "/lib", "/lib64", "/boot",
		"/root", "/home", "/dev", "/proc", "/sys", "/var", "/run", "/opt",
		"/tmp", "/srv", "/mnt", NULL
	};
	size_t n = strlen(p);
	int i;

	while (n > 1 && p[n - 1] == '/')
		n--;
	if (p[0] != '/' || strstr(p, ".."))
		return 0;
	for (i = 0; bad[i]; i++)
		if (strlen(bad[i]) == n && !strncmp(p, bad[i], n))
			return 0;
	return 1;
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
			else if (!strcmp(k, "fallback") && nfall < MAXM)
				falls[nfall++] = strdup(v);
			else if (!strcmp(k, "repo"))
				snprintf(repo, sizeof repo, "%s", v);
			else if (!strcmp(k, "snapshot"))
				snprintf(snap, sizeof snap, "%s", v);
			else if (!strcmp(k, "distdir"))
				snprintf(dist, sizeof dist, "%s", v);
			else if (!strcmp(k, "profile"))
				snprintf(prof, sizeof prof, "%s", v);
			else if (!strcmp(k, "allow_host"))
				allow_host = !strcmp(v, "yes") || !strcmp(v, "1");
		}
		fclose(f);
	}
	if (!nmir) {
		mirrors[nmir++] = strdup("https://mirrors.ustc.edu.cn/gentoo");
		mirrors[nmir++] = strdup("https://mirrors.aliyun.com/gentoo");
		mirrors[nmir++] = strdup("https://mirror.yandex.ru/gentoo-distfiles");
		mirrors[nmir++] = strdup("https://distfiles.gentoo.org");
	}
	if (!nfall)
		falls[nfall++] = strdup("https://codeload.github.com/gentoo-mirror/gentoo/tar.gz/refs/heads/master");
	if (!safe_dir(repo) || !safe_dir(dist)) {
		fprintf(stderr, "cloudpkg: небезопасный путь в %s (repo=%s distdir=%s)\n", CONF, repo, dist);
		exit(1);
	}
}

static void osid(char *out, size_t n)
{
	FILE *f = fopen("/etc/os-release", "r");
	char line[BUF], *v;
	size_t l;

	snprintf(out, n, "unknown");
	if (!f)
		return;
	while (fgets(line, sizeof line, f)) {
		if (strncmp(line, "ID=", 3))
			continue;
		v = trim(line + 3);
		l = strlen(v);
		if (l >= 2 && (v[0] == '"' || v[0] == '\'') && v[l - 1] == v[0]) {
			v[l - 1] = 0;
			v++;
		}
		snprintf(out, n, "%s", v);
		break;
	}
	fclose(f);
}

static int host_allowed(char *id, size_t n)
{
	const char *f = getenv("CLOUDPKG_FORCE");

	osid(id, n);
	if (allow_host || (f && *f && strcmp(f, "0")))
		return 1;
	return !strcmp(id, "cloudos");
}

static int host_ok(void)
{
	char id[64];

	if (host_allowed(id, sizeof id))
		return 1;
	fprintf(stderr, "cloudpkg: эта система не cloudos (ID=%s)\n", id);
	fprintf(stderr, "cloudpkg: установка в / сломает менеджер пакетов этой системы\n");
	fprintf(stderr, "cloudpkg: изолированный режим: curl -fsSL %s | sh\n", INSTALL_URL);
	fprintf(stderr, "cloudpkg: если ты точно знаешь, что делаешь: CLOUDPKG_FORCE=1\n");
	return 0;
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

static int have(const char *cmd)
{
	const char *path = getenv("PATH");
	char *dup, *d, *save = NULL;
	char p[BUF];
	int ok = 0;

	if (!path || !*path)
		path = "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin";
	dup = strdup(path);
	for (d = strtok_r(dup, ":", &save); d && !ok; d = strtok_r(NULL, ":", &save)) {
		snprintf(p, sizeof p, "%s/%s", d, cmd);
		ok = access(p, X_OK) == 0;
	}
	free(dup);
	return ok;
}

static void mkparent(const char *path)
{
	char d[BUF], *s;
	char *a[4];

	snprintf(d, sizeof d, "%s", path);
	s = strrchr(d, '/');
	if (!s || s == d)
		return;
	*s = 0;
	a[0] = "mkdir"; a[1] = "-p"; a[2] = d; a[3] = NULL;
	run(a);
}

static int cmd_sync(void);
static int ensure_tree(void)
{
	char p[BUF];

	snprintf(p, sizeof p, "%s/profiles", repo);
	if (exists(p))
		return 1;
	if (geteuid() != 0) {
		fprintf(stderr, "cloudpkg: дерево рецептов не загружено, выполни от root: cloudpkg sync\n");
		return 0;
	}
	printf("cloudpkg: дерева рецептов ещё нет, загружаю\n");
	return cmd_sync() == 0;
}

static int is_dir(const char *p)
{
	struct stat st;

	return stat(p, &st) == 0 && S_ISDIR(st.st_mode);
}

static char *resolve(char *name)
{
	static const char *prefer[] = {
		"app-misc", "sys-apps", "app-admin", "app-editors", "app-text", "net-misc",
		"sys-process", "sys-fs", "sys-boot", "dev-vcs", "dev-util", "net-analyzer",
		"app-shells", "app-arch", "sys-libs", "dev-libs", "dev-lang", NULL
	};
	const char *roots[2] = { OVERLAY, repo };
	char found[24][320], p[BUF], *res;
	int nf = 0, r, i, j, best = -1, bi = 1000;
	DIR *d;
	struct dirent *e;

	if (strchr(name, '/') || strchr("@=<>~!", name[0]) || name[0] == '-')
		return name;
	for (r = 0; r < 2; r++) {
		d = opendir(roots[r]);
		if (!d)
			continue;
		while ((e = readdir(d)) && nf < 24) {
			if (e->d_name[0] == '.' || !strcmp(e->d_name, "profiles") || !strcmp(e->d_name, "metadata") ||
			    !strcmp(e->d_name, "eclass") || !strcmp(e->d_name, "licenses") || !strcmp(e->d_name, "scripts") ||
			    !strncmp(e->d_name, "acct-", 5) || !strcmp(e->d_name, "virtual"))
				continue;
			snprintf(p, sizeof p, "%s/%s/%s", roots[r], e->d_name, name);
			if (!is_dir(p))
				continue;
			snprintf(found[nf], sizeof found[nf], "%s/%s", e->d_name, name);
			for (j = 0; j < nf && strcmp(found[j], found[nf]); j++)
				;
			if (j == nf)
				nf++;
		}
		closedir(d);
	}
	if (!nf)
		return name;
	for (i = 0; i < nf; i++) {
		char cat[320], *sl;

		sl = strchr(found[i], '/');
		snprintf(cat, sizeof cat, "%.*s", (int)(sl - found[i]), found[i]);
		for (j = 0; prefer[j] && strcmp(prefer[j], cat); j++)
			;
		if (j < bi) {
			bi = j;
			best = i;
		}
	}
	if (best < 0)
		best = 0;
	res = strdup(found[best]);
	if (nf > 1) {
		printf("cloudpkg: %s -> %s (есть ещё:", name, res);
		for (i = 0; i < nf; i++)
			if (i != best)
				printf(" %s", found[i]);
		printf(")\n");
	}
	return res;
}

static void fail_hint(void)
{
	FILE *f = popen("find /var/tmp/portage -name build.log -mmin -120 -printf '%T@ %p\\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2-", "r");
	char path[BUF], cmd[BUF + 40];

	if (f && fgets(path, sizeof path, f)) {
		trim(path);
		if (*path) {
			fprintf(stderr, "\ncloudpkg: сборка не удалась. последние строки лога %s:\n", path);
			snprintf(cmd, sizeof cmd, "tail -n 25 '%s' >&2", path);
			if (system(cmd) < 0)
				perror("cloudpkg: tail");
		}
	}
	if (f)
		pclose(f);
	fprintf(stderr, "cloudpkg: проверь сеть (cloudpkg sync), имя пакета (cloudpkg search имя) и cloudpkg doctor\n");
}

static int need_portage(void)
{
	if (!have("emerge")) {
		fprintf(stderr, "cloudpkg: не найден emerge (portage не установлен)\n");
		fprintf(stderr, "cloudpkg: запусти cloudpkg-setup.sh или установщик: curl -fsSL %s | sh\n", INSTALL_URL);
		return 0;
	}
	return 1;
}

static int emerge(char **pre, int npre, char **pk, int npk)
{
	char **av = calloc(npre + npk + 2, sizeof *av);
	int i, n = 0, r;

	if (!need_portage()) {
		free(av);
		return 1;
	}
	av[n++] = "emerge";
	for (i = 0; i < npre; i++)
		av[n++] = pre[i];
	for (i = 0; i < npk; i++)
		av[n++] = pk[i];
	av[n] = NULL;
	r = run(av);
	free(av);
	if (r != 0 && geteuid() == 0)
		fail_hint();
	return r;
}

static void parse(int argc, char **argv, char **pre, int *npre, char **pk, int *npk)
{
	int i;

	for (i = 0; i < argc; i++) {
		if (!strcmp(argv[i], "-p") || !strcmp(argv[i], "--pretend"))
			pre[(*npre)++] = "--pretend";
		else if (!strcmp(argv[i], "-a") || !strcmp(argv[i], "--ask"))
			pre[(*npre)++] = "--ask";
		else if (!strcmp(argv[i], "-o") || !strcmp(argv[i], "--oneshot"))
			pre[(*npre)++] = "--oneshot";
		else if (!strcmp(argv[i], "-t") || !strcmp(argv[i], "--testing"))
			setenv("ACCEPT_KEYWORDS", "~amd64", 1);
		else if (argv[i][0] == '-')
			pre[(*npre)++] = argv[i];
		else
			pk[(*npk)++] = resolve(argv[i]);
	}
}

static int fetch(const char *url, const char *out)
{
	char *a[20];
	int n = 0;

	a[n++] = "curl";
	a[n++] = "-fL";
	if (!isatty(2))
		a[n++] = "-sS";
	a[n++] = "--retry"; a[n++] = "2";
	a[n++] = "--connect-timeout"; a[n++] = "15";
	a[n++] = "--speed-limit"; a[n++] = "10000";
	a[n++] = "--speed-time"; a[n++] = "30";
	a[n++] = "-o"; a[n++] = (char *)out;
	a[n++] = (char *)url;
	a[n] = NULL;
	return run(a);
}

static void ensure_profile(void)
{
	char tgt[BUF];
	const char *lnk = "/etc/portage/make.profile";
	char *a[4];

	if (exists(lnk))
		return;
	snprintf(tgt, sizeof tgt, "%s/profiles/%s", repo, prof);
	if (!exists(tgt)) {
		if (exists(repo))
			fprintf(stderr, "cloudpkg: профиль %s не найден в дереве\n", prof);
		return;
	}
	a[0] = "mkdir"; a[1] = "-p"; a[2] = "/etc/portage"; a[3] = NULL;
	run(a);
	unlink(lnk);
	if (symlink(tgt, lnk) == 0)
		printf("cloudpkg: профиль %s\n", prof);
	else
		perror("cloudpkg: make.profile");
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
		fflush(stdout);
		if (fetch(url, part) == 0)
			ok = 1;
		else
			unlink(part);
	}
	for (i = 0; i < nfall && !ok; i++) {
		printf("cloudpkg: зеркала не ответили, запасной канал: %s\n", falls[i]);
		fflush(stdout);
		if (fetch(falls[i], part) == 0)
			ok = 1;
		else
			unlink(part);
	}
	if (!ok) {
		fprintf(stderr, "cloudpkg: ни одно зеркало не ответило\n");
		fprintf(stderr, "cloudpkg: положи снимок в %s и запусти sync снова\n", fin);
		if (!exists(fin))
			return 1;
		fprintf(stderr, "cloudpkg: беру старый снимок %s\n", fin);
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
	printf("cloudpkg: распаковка дерева\n");
	fflush(stdout);
	a[0] = "tar"; a[1] = "xf"; a[2] = fin; a[3] = "--strip-components=1";
	a[4] = "--no-same-owner"; a[5] = "-C"; a[6] = nw; a[7] = NULL;
	if (run(a) != 0) {
		fprintf(stderr, "cloudpkg: не удалось распаковать снимок\n");
		return 1;
	}
	snprintf(url, sizeof url, "%s/profiles", nw);
	if (!exists(url)) {
		fprintf(stderr, "cloudpkg: в снимке нет profiles, дерево не заменено\n");
		return 1;
	}
	mkparent(repo);
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
	ensure_profile();
	printf("cloudpkg: дерево обновлено\n");
	return 0;
}

static int cmd_install(int argc, char **argv)
{
	char **pre = calloc(argc + 12, sizeof *pre);
	char **pk = calloc(argc + 1, sizeof *pk);
	int npre = 0, npk = 0, r;

	pre[npre++] = "--verbose";
	pre[npre++] = "--noreplace";
	pre[npre++] = "--autounmask=y";
	pre[npre++] = "--autounmask-continue";
	pre[npre++] = "--autounmask-keep-masks";
	parse(argc, argv, pre, &npre, pk, &npk);
	if (!npk) {
		fprintf(stderr, "cloudpkg: укажи пакеты\n");
		r = 1;
	} else if (!need_root())
		r = 1;
	else if (!ensure_tree())
		r = 1;
	else {
		ensure_profile();
		r = emerge(pre, npre, pk, npk);
	}
	free(pre);
	free(pk);
	return r;
}

static int cmd_remove(int argc, char **argv)
{
	char **pre = calloc(argc + 12, sizeof *pre);
	char **pk = calloc(argc + 1, sizeof *pk);
	int npre = 0, npk = 0, r;

	pre[npre++] = "--unmerge";
	pre[npre++] = "--verbose";
	parse(argc, argv, pre, &npre, pk, &npk);
	if (!npk) {
		fprintf(stderr, "cloudpkg: укажи пакеты\n");
		r = 1;
	} else if (!need_root())
		r = 1;
	else
		r = emerge(pre, npre, pk, npk);
	free(pre);
	free(pk);
	return r;
}

static int cmd_upgrade(int argc, char **argv)
{
	char **pre = calloc(argc + 12, sizeof *pre);
	char **pk = calloc(argc + 2, sizeof *pk);
	int npre = 0, npk = 0, r;

	pre[npre++] = "--update";
	pre[npre++] = "--deep";
	pre[npre++] = "--newuse";
	pre[npre++] = "--verbose";
	pre[npre++] = "--autounmask=y";
	pre[npre++] = "--autounmask-continue";
	pre[npre++] = "--autounmask-keep-masks";
	parse(argc, argv, pre, &npre, pk, &npk);
	npk = 0;
	
	pk[npk++] = "@selected";
	if (!need_root())
		r = 1;
	else if (!ensure_tree())
		r = 1;
	else {
		ensure_profile();
		r = emerge(pre, npre, pk, npk);
	}
	free(pre);
	free(pk);
	return r;
}

static int cmd_clean(int argc, char **argv)
{
	char *pre[4];
	char *a[8];
	int npre = 0, i, pretend = 0, r;

	pre[npre++] = "--depclean";
	for (i = 0; i < argc; i++)
		if (!strcmp(argv[i], "-p") || !strcmp(argv[i], "--pretend"))
			pretend = 1;
	if (pretend)
		pre[npre++] = "--pretend";
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
	if (!ensure_tree())
		return 1;
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
	if (!ensure_tree())
		return 1;
	argv[0] = resolve(argv[0]);
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
		if (cats[i]->d_name[0] == '.') {
			free(cats[i]);
			continue;
		}
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

static void row(const char *name, const char *val)
{
	int w = 0;
	const char *s;

	for (s = name; *s; s++)
		if (((unsigned char)*s & 0xC0) != 0x80)
			w++;
	printf("%s%*s %s\n", name, w < 28 ? 28 - w : 0, "", val);
}

static int check(const char *name, int ok)
{
	row(name, ok ? "ok" : "НЕТ");
	return ok;
}

static int cmd_doctor(void)
{
	char p[BUF], id[64];
	int bad = 0;

	osid(id, sizeof id);
	row("система (ID)", id);
	bad += !check("можно ставить в /", host_allowed(id, sizeof id));
	bad += !check("emerge в PATH", have("emerge"));
	bad += !check("пользователь portage", getpwnam("portage") != NULL);
	snprintf(p, sizeof p, "%s/profiles", repo);
	bad += !check("дерево рецептов", exists(p));
	bad += !check("make.conf", exists("/etc/portage/make.conf"));
	bad += !check("профиль (make.profile)", exists("/etc/portage/make.profile"));
	bad += !check("package.provided", exists("/etc/portage/profile/package.provided"));
	bad += !check("curl", have("curl"));
	bad += !check("tar", have("tar"));
	bad += !check("xz", have("xz"));
	printf("%s\n", bad ? "есть проблемы" : "всё в порядке");
	return bad ? 1 : 0;
}

static void usage(void)
{
	puts("cloudpkg " VERSION " (обёртка над portage)\n"
	     "использование: cloudpkg команда [параметры]\n\n"
	     "  sync                  обновить дерево рецептов (снимок gentoo)\n"
	     "  install [-p] [-a] [-o] [-t] пакет...   установить из исходников\n"
	     "  remove  [-p] [-a] пакет...  удалить\n"
	     "  upgrade [-p] [-a]     обновить все пакеты\n"
	     "  clean   [-p]          удалить лишние пакеты и очистить кеш\n"
	     "  search  строка        найти пакет\n"
	     "  info    пакет         показать, что будет установлено\n"
	     "  list                  список установленных пакетов\n"
	     "  doctor                проверить настройку\n"
	     "  version, help\n\n"
	     "-p пробный запуск, -a спросить перед установкой, -o не добавлять в world,\n"
	     "-t разрешить testing (~amd64). остальные параметры с дефисом уходят в emerge.");
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
		return host_ok() ? cmd_sync() : 1;
	if (!strcmp(c, "install"))
		return host_ok() ? cmd_install(argc - 2, argv + 2) : 1;
	if (!strcmp(c, "remove"))
		return host_ok() ? cmd_remove(argc - 2, argv + 2) : 1;
	if (!strcmp(c, "upgrade"))
		return host_ok() ? cmd_upgrade(argc - 2, argv + 2) : 1;
	if (!strcmp(c, "clean"))
		return host_ok() ? cmd_clean(argc - 2, argv + 2) : 1;
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
