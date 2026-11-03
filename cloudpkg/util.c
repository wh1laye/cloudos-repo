#include "cloudpkg.h"

void *xcalloc(size_t n, size_t m)
{
	void *p = calloc(n, m);

	if (!p) {
		fputs("cloudpkg: нет памяти\n", stderr);
		exit(1);
	}
	return p;
}

char *xstrdup(const char *s)
{
	char *p = strdup(s);

	if (!p) {
		fputs("cloudpkg: нет памяти\n", stderr);
		exit(1);
	}
	return p;
}

char *mirrors[MAXM];
int nmir;
char *falls[MAXM];
int nfall;
char repo[256] = "/var/db/repos/gentoo";
char snap[160] = "snapshots/portage-latest.tar.xz";
char dist[256] = "/var/cache/distfiles";
char prof[160] = "default/linux/amd64/23.0";
int allow_host;

int safe_mode;
int sn_keep = 5;

int run(char *const av[])
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

char *trim(char *s)
{
	char *e;

	while (*s == ' ' || *s == '\t')
		s++;
	e = s + strlen(s);
	while (e > s && (e[-1] == '\n' || e[-1] == '\r' || e[-1] == ' ' || e[-1] == '\t'))
		*--e = 0;
	return s;
}

int safe_dir(const char *p)
{
	static const char *bad[] = {
		"/", "/usr", "/etc", "/bin", "/sbin", "/lib", "/lib64", "/boot",
		"/root", "/home", "/dev", "/proc", "/sys", "/var", "/run", "/opt",
		"/tmp", "/srv", "/mnt", "/var/db", "/var/lib", "/var/cache", "/var/log",
		"/var/tmp", "/var/db/pkg", "/var/db/repos", "/usr/local", "/usr/lib",
		"/usr/share", "/usr/bin", "/usr/sbin", "/etc/portage", NULL
	};
	size_t n = strlen(p), j, depth = 0;
	int i;

	while (n > 1 && p[n - 1] == '/')
		n--;
	if (p[0] != '/' || strstr(p, ".."))
		return 0;
	for (j = 0; j < n; j++)
		if (p[j] != '/' && (j == 0 || p[j - 1] == '/'))
			depth++;
	if (depth < 3)
		return 0;
	for (i = 0; bad[i]; i++)
		if (strlen(bad[i]) == n && !strncmp(p, bad[i], n))
			return 0;
	return 1;
}

void loadconf(void)
{
	FILE *f = fopen(CONF, "r");
	char line[BUF], *k, *v, *eq;
	size_t sl;

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
				mirrors[nmir++] = xstrdup(v);
			else if (!strcmp(k, "fallback") && nfall < MAXM)
				falls[nfall++] = xstrdup(v);
			else if (!strcmp(k, "repo"))
				snprintf(repo, sizeof repo, "%s", v);
			else if (!strcmp(k, "snapshot"))
				snprintf(snap, sizeof snap, "%s", v);
			else if (!strcmp(k, "distdir"))
				snprintf(dist, sizeof dist, "%s", v);
			else if (!strcmp(k, "profile"))
				snprintf(prof, sizeof prof, "%s", v);
			else if (!strcmp(k, "snapshots")) {
				long sv = strtol(v, NULL, 10);

				sn_keep = sv < 0 ? 0 : sv > 50 ? 50 : (int)sv;
			} else if (!strcmp(k, "allow_host"))
				allow_host = !strcmp(v, "yes") || !strcmp(v, "1");
		}
		fclose(f);
	}
	if (!nmir) {
		mirrors[nmir++] = xstrdup("https://distfiles.gentoo.org");
		mirrors[nmir++] = xstrdup("https://mirror.yandex.ru/gentoo-distfiles");
		mirrors[nmir++] = xstrdup("https://mirrors.ustc.edu.cn/gentoo");
		mirrors[nmir++] = xstrdup("https://mirrors.aliyun.com/gentoo");
	}
	if (!nfall)
		falls[nfall++] = xstrdup("https://codeload.github.com/gentoo-mirror/gentoo/tar.gz/refs/heads/master");
	for (sl = strlen(repo); sl > 1 && repo[sl - 1] == '/'; sl--)
		repo[sl - 1] = 0;
	for (sl = strlen(dist); sl > 1 && dist[sl - 1] == '/'; sl--)
		dist[sl - 1] = 0;
	if (!safe_dir(repo) || !safe_dir(dist)) {
		fprintf(stderr, "cloudpkg: небезопасный путь в %s (repo=%s distdir=%s)\n", CONF, repo, dist);
		exit(1);
	}
}

void osid(char *out, size_t n)
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

int host_allowed(char *id, size_t n)
{
	const char *f = getenv("CLOUDPKG_FORCE");

	osid(id, n);
	if (allow_host || (f && *f && strcmp(f, "0")))
		return 1;
	return !strcmp(id, "cloudos");
}

int host_ok(void)
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

int need_root(void)
{
	if (geteuid() != 0) {
		fprintf(stderr, "cloudpkg: нужны права root\n");
		return 0;
	}
	return 1;
}

int exists(const char *p)
{
	struct stat st;

	return stat(p, &st) == 0;
}

int have(const char *cmd)
{
	const char *path = getenv("PATH");
	char *dup, *d, *save = NULL;
	char p[BUF];
	int ok = 0;

	if (!path || !*path)
		path = "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin";
	dup = xstrdup(path);
	for (d = strtok_r(dup, ":", &save); d && !ok; d = strtok_r(NULL, ":", &save)) {
		snprintf(p, sizeof p, "%s/%s", d, cmd);
		ok = access(p, X_OK) == 0;
	}
	free(dup);
	return ok;
}

void mkparent(const char *path)
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

int fetch(const char *url, const char *out)
{
	char *a[24];
	int n = 0;

	a[n++] = "curl";
	a[n++] = "-fL";
	if (!isatty(2))
		a[n++] = "-sS";
	a[n++] = "--proto"; a[n++] = "=http,https";
	a[n++] = "--proto-redir"; a[n++] = "=https";
	a[n++] = "--retry"; a[n++] = "2";
	a[n++] = "--connect-timeout"; a[n++] = "15";
	a[n++] = "--speed-limit"; a[n++] = "10000";
	a[n++] = "--speed-time"; a[n++] = "30";
	a[n++] = "-o"; a[n++] = (char *)out;
	a[n++] = (char *)url;
	a[n] = NULL;
	return run(a);
}
