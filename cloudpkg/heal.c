#include "cloudpkg.h"

int env_bad(const char *p)
{
	pid_t pid = fork();
	int st, fd;

	if (pid < 0)
		return 0;
	if (pid == 0) {
		fd = open("/dev/null", O_RDWR);
		if (fd >= 0) {
			dup2(fd, 1);
			dup2(fd, 2);
		}
		execlp("bash", "bash", "-n", p, (char *)NULL);
		_exit(127);
	}
	if (waitpid(pid, &st, 0) < 0 || !WIFEXITED(st))
		return 0;
	return WEXITSTATUS(st) == 1 || WEXITSTATUS(st) == 2;
}

int file_has(const char *p, const char *needle)
{
	char b[4096];
	size_t n;
	FILE *f = fopen(p, "r");

	if (!f)
		return 0;
	n = fread(b, 1, sizeof b - 1, f);
	fclose(f);
	b[n] = 0;
	return strstr(b, needle) != NULL;
}

int env_is_legacy(const char *name, const char *p)
{
	if (!strcmp(name, NOHOOK))
		return 1;
	return file_has(p, "pre_src_prepare") && file_has(p, "eautoreconf() { :; }");
}

int env_scan(const char *dir, int fix, int depth)
{
	DIR *d = opendir(dir);
	struct dirent *e;
	struct stat st;
	char p[BUF], bak[BUF + 8];
	size_t n;
	int bad = 0, legacy;

	if (!d)
		return 0;
	while ((e = readdir(d))) {
		if (e->d_name[0] == '.')
			continue;
		n = strlen(e->d_name);
		if (n > 4 && !strcmp(e->d_name + n - 4, ".bak"))
			continue;
		snprintf(p, sizeof p, "%s/%s", dir, e->d_name);
		if (stat(p, &st) != 0)
			continue;
		if (S_ISDIR(st.st_mode)) {
			if (depth < 2)
				bad += env_scan(p, fix, depth + 1);
			continue;
		}
		if (!S_ISREG(st.st_mode))
			continue;
		legacy = env_is_legacy(e->d_name, p);
		if (!legacy && !env_bad(p))
			continue;
		bad++;
		if (!fix || !legacy)
			continue;
		snprintf(bak, sizeof bak, "%s.bak", p);
		if (rename(p, bak) == 0)
			fprintf(stderr, "cloudpkg: убрал устаревший хук %s, копия: %s\n", p, bak);
	}
	closedir(d);
	return bad;
}

int penv_file(const char *p, int fix)
{
	char line[BUF], tmp[BUF + 4];
	FILE *f = fopen(p, "r"), *o = NULL;
	int hit = 0;

	if (!f)
		return 0;
	snprintf(tmp, sizeof tmp, "%s~", p);
	if (fix)
		o = fopen(tmp, "w");
	while (fgets(line, sizeof line, f)) {
		if (strstr(line, NOHOOK)) {
			hit++;
			continue;
		}
		if (o)
			fputs(line, o);
	}
	fclose(f);
	if (o) {
		if (fclose(o) != 0 || !hit)
			unlink(tmp);
		else if (rename(tmp, p) == 0)
			fprintf(stderr, "cloudpkg: убрал %d строк про %s из %s\n", hit, NOHOOK, p);
	}
	return hit;
}

int penv_clean(int fix)
{
	struct stat st;
	struct dirent *e;
	char p[BUF];
	DIR *d;
	int n = 0;

	if (stat(PENV, &st) != 0)
		return 0;
	if (!S_ISDIR(st.st_mode))
		return penv_file(PENV, fix);
	d = opendir(PENV);
	if (!d)
		return 0;
	while ((e = readdir(d))) {
		if (e->d_name[0] == '.')
			continue;
		snprintf(p, sizeof p, "%s/%s", PENV, e->d_name);
		if (stat(p, &st) == 0 && S_ISREG(st.st_mode))
			n += penv_file(p, fix);
	}
	closedir(d);
	return n;
}

struct stub {
	const char *name;
	const char *cmd;
	int comps;
};

static const struct stub stubs[] = {
	{ "autoconf", "autoconf", 2 },
	{ "automake", "automake", 2 },
	{ "libtool", "libtoolize", 1 },
};

#define NSTUB ((int)(sizeof stubs / sizeof *stubs))

int probe_ver(const char *cmd, char *ver, size_t n)
{
	char line[BUF], *t, *s;
	int p[2], ok = 0, st, z;
	pid_t pid;
	FILE *f;

	if (!*cmd || *cmd == '-')
		return 0;
	for (t = (char *)cmd; *t; t++)
		if (!((*t >= 'a' && *t <= 'z') || (*t >= '0' && *t <= '9') || *t == '-' || *t == '_'))
			return 0;
	if (pipe(p) < 0)
		return 0;
	pid = fork();
	if (pid < 0) {
		close(p[0]);
		close(p[1]);
		return 0;
	}
	if (pid == 0) {
		z = open("/dev/null", O_WRONLY);
		if (dup2(p[1], 1) < 0)
			_exit(127);
		if (z >= 0) {
			dup2(z, 2);
			close(z);
		}
		z = open("/dev/null", O_RDONLY);
		if (z >= 0) {
			dup2(z, 0);
			close(z);
		}
		close(p[0]);
		close(p[1]);
		execlp(cmd, cmd, "--version", (char *)NULL);
		_exit(127);
	}
	close(p[1]);
	f = fdopen(p[0], "r");
	if (!f) {
		close(p[0]);
		waitpid(pid, &st, 0);
		return 0;
	}
	if (fgets(line, sizeof line, f)) {
		t = trim(line);
		s = strrchr(t, ' ');
		if (s)
			t = s + 1;
		ok = *t >= '0' && *t <= '9' && strlen(t) < n && strspn(t, "0123456789.") == strlen(t);
		if (ok)
			snprintf(ver, n, "%s", t);
	}
	fclose(f);
	waitpid(pid, &st, 0);
	return ok;
}

int vdb_has(const char *name)
{
	char p[BUF], pre[128];
	struct dirent *e;
	DIR *d;
	size_t n;
	int r = 0;

	snprintf(p, sizeof p, "%s/dev-build", VDB);
	d = opendir(p);
	if (!d)
		return 0;
	n = (size_t)snprintf(pre, sizeof pre, "%s-", name);
	while ((e = readdir(d)))
		if (!strncmp(e->d_name, pre, n) && e->d_name[n] >= '0' && e->d_name[n] <= '9') {
			r = 1;
			break;
		}
	closedir(d);
	return r;
}

void put(const char *dir, const char *name, const char *val)
{
	char p[BUF + 64];
	FILE *f;

	snprintf(p, sizeof p, "%s/%s", dir, name);
	f = fopen(p, "w");
	if (!f)
		return;
	fputs(val, f);
	fclose(f);
}

static int stub_make(const struct stub *s, const char *ver)
{
	char dir[BUF], pf[128], slot[32], t[160];
	char *a[4];
	int i, k = 0;

	for (i = 0; ver[i] && i < (int)sizeof slot - 1; i++) {
		if (ver[i] == '.' && ++k == s->comps)
			break;
		slot[i] = ver[i];
	}
	slot[i] = 0;
	snprintf(pf, sizeof pf, "%s-%s", s->name, ver);
	snprintf(dir, sizeof dir, "%s/dev-build/%s", VDB, pf);
	a[0] = "mkdir"; a[1] = "-p"; a[2] = dir; a[3] = NULL;
	if (run(a) != 0)
		return 1;
	put(dir, "CATEGORY", "dev-build\n");
	snprintf(t, sizeof t, "%s\n", pf);
	put(dir, "PF", t);
	snprintf(t, sizeof t, "%s\n", slot);
	put(dir, "SLOT", t);
	put(dir, "EAPI", "8\n");
	put(dir, "repository", "gentoo\n");
	put(dir, "COUNTER", "1\n");
	snprintf(t, sizeof t, "%ld\n", (long)time(NULL));
	put(dir, "BUILD_TIME", t);
	put(dir, "SIZE", "0\n");
	put(dir, "DEFINED_PHASES", "-\n");
	put(dir, "KEYWORDS", "amd64\n");
	put(dir, "DESCRIPTION", "cloudos: собрано вручную в lfs, запись нужна eclass autotools\n");
	put(dir, "CONTENTS", "");
	put(dir, "USE", "");
	put(dir, "IUSE", "");
	put(dir, "DEPEND", "");
	put(dir, "RDEPEND", "");
	put(dir, "CLOUDOS_STUB", "1\n");
	return 0;
}

void heal_vdb(void)
{
	char ver[32];
	int i;

	if (geteuid() != 0)
		return;
	for (i = 0; i < NSTUB; i++) {
		if (vdb_has(stubs[i].name) || !probe_ver(stubs[i].cmd, ver, sizeof ver))
			continue;
		if (stub_make(&stubs[i], ver) == 0)
			fprintf(stderr, "cloudpkg: %s-%s записан в базу установленных (собран в lfs)\n", stubs[i].name, ver);
	}
}

int vdb_ok(void)
{
	char ver[32];
	int i;

	for (i = 0; i < NSTUB; i++)
		if (!vdb_has(stubs[i].name) && probe_ver(stubs[i].cmd, ver, sizeof ver))
			return 0;
	return 1;
}

void heal(void)
{
	if (geteuid() != 0)
		return;
	env_scan(ENVDIR, 1, 0);
	penv_clean(1);
	heal_vdb();
}

int cmd_vdb(void)
{
	char ver[32];
	int i;

	if (!need_root())
		return 1;
	heal_vdb();
	for (i = 0; i < NSTUB; i++) {
		if (!probe_ver(stubs[i].cmd, ver, sizeof ver))
			printf("%-10s нет в системе\n", stubs[i].name);
		else
			printf("%-10s %-8s %s\n", stubs[i].name, ver, vdb_has(stubs[i].name) ? "в базе" : "НЕ В БАЗЕ");
	}
	return vdb_ok() ? 0 : 1;
}
