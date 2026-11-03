#include "cloudpkg.h"

int ensure_tree(void)
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

int is_dir(const char *p)
{
	struct stat st;

	return stat(p, &st) == 0 && S_ISDIR(st.st_mode);
}

char *resolve(char *name)
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
	res = xstrdup(found[best]);
	if (nf > 1) {
		printf("cloudpkg: %s -> %s (есть ещё:", name, res);
		for (i = 0; i < nf; i++)
			if (i != best)
				printf(" %s", found[i]);
		printf(")\n");
	}
	return res;
}

static char best_log[BUF];
static time_t best_mt, log_since;

static int log_cb(const char *path, const struct stat *st, int type, struct FTW *ftw)
{
	if (type != FTW_F || strcmp(path + ftw->base, "build.log") != 0)
		return 0;
	if (st->st_mtime < log_since || st->st_mtime < best_mt)
		return 0;
	if (strlen(path) >= sizeof best_log || strchr(path, '\n'))
		return 0;
	best_mt = st->st_mtime;
	snprintf(best_log, sizeof best_log, "%s", path);
	return 0;
}

int show_tail(const char *path, const char *needle)
{
	static char ring[25][BUF];
	char line[BUF];
	int cnt = 0, found = 0, i, from;
	FILE *f = fopen(path, "r");

	if (!f)
		return 0;
	while (fgets(line, sizeof line, f)) {
		if (needle && strstr(line, needle))
			found = 1;
		snprintf(ring[cnt % 25], BUF, "%s", line);
		cnt++;
	}
	fclose(f);
	from = cnt > 25 ? cnt - 25 : 0;
	for (i = from; i < cnt; i++)
		fputs(ring[i % 25], stderr);
	return found;
}

void fail_hint(time_t t0)
{
	best_log[0] = 0;
	best_mt = 0;
	log_since = t0;
	if (nftw("/var/tmp/portage", log_cb, 16, FTW_PHYS) < 0)
		best_log[0] = 0;
	if (*best_log) {
		fprintf(stderr, "\ncloudpkg: сборка не удалась. последние строки лога %s:\n", best_log);
		if (show_tail(best_log, "Cannot find the latest"))
			fprintf(stderr, "cloudpkg: eclass не видит autotools. выполни cloudpkg vdb и повтори установку\n");
	} else {
		fprintf(stderr, "\ncloudpkg: до сборки дело не дошло: смотри сообщения emerge выше (маски, блокировки, зависимости)\n");
	}
	fprintf(stderr, "cloudpkg: проверь сеть (cloudpkg sync), имя пакета (cloudpkg search имя) и cloudpkg doctor\n");
}

int need_portage(void)
{
	if (!have("emerge")) {
		fprintf(stderr, "cloudpkg: не найден emerge (portage не установлен)\n");
		fprintf(stderr, "cloudpkg: запусти cloudpkg-setup.sh или установщик: curl -fsSL %s | sh\n", INSTALL_URL);
		return 0;
	}
	return 1;
}

int emerge(char **pre, int npre, char **pk, int npk)
{
	char **av = xcalloc((size_t)(npre + npk + 2), sizeof *av);
	int i, n = 0, r;
	time_t t0 = time(NULL);

	if (!need_portage()) {
		free(av);
		return 1;
	}
	heal();
	av[n++] = "emerge";
	for (i = 0; i < npre; i++)
		av[n++] = pre[i];
	for (i = 0; i < npk; i++)
		av[n++] = pk[i];
	av[n] = NULL;
	r = run(av);
	free(av);
	if (r != 0 && geteuid() == 0)
		fail_hint(t0);
	return r;
}

void parse(int argc, char **argv, char **pre, int *npre, char **pk, int *npk)
{
	int i;

	for (i = 0; i < argc; i++) {
		if (!strcmp(argv[i], "-p") || !strcmp(argv[i], "--pretend"))
			pre[(*npre)++] = "--pretend";
		else if (!strcmp(argv[i], "-a") || !strcmp(argv[i], "--ask"))
			pre[(*npre)++] = "--ask";
		else if (!strcmp(argv[i], "-o") || !strcmp(argv[i], "--oneshot"))
			pre[(*npre)++] = "--oneshot";
		else if (!strcmp(argv[i], "--safe"))
			safe_mode = 1;
		else if (!strcmp(argv[i], "-t") || !strcmp(argv[i], "--testing"))
			setenv("ACCEPT_KEYWORDS", "~amd64", 1);
		else if (argv[i][0] == '-')
			pre[(*npre)++] = argv[i];
		else
			pk[(*npk)++] = resolve(argv[i]);
	}
}

void ensure_profile(void)
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

int cmd_sync(void)
{
	char part[BUF], fin[BUF], url[BUF + 32], nw[BUF], old[BUF];
	char *a[16];
	int i, ok = 0;

	if (!need_root())
		return 1;
	heal();
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
		if (exists(old) && rename(old, repo) != 0)
			perror("cloudpkg: не удалось вернуть старое дерево");
		return 1;
	}
	a[0] = "rm"; a[1] = "-rf"; a[2] = old; a[3] = NULL;
	run(a);
	ensure_profile();
	printf("cloudpkg: дерево обновлено\n");
	return 0;
}

int has_flag(char **pre, int npre, const char *f)
{
	int i;

	for (i = 0; i < npre; i++)
		if (!strcmp(pre[i], f))
			return 1;
	return 0;
}

int emerge_smart(char **pre, int npre, char **pk, int npk)
{
	char **p2;
	char *old = getenv("ACCEPT_KEYWORDS");
	char *sv = old ? strdup(old) : NULL;
	int i, n = 0, r;

	r = emerge(pre, npre, pk, npk);
	if (!r || safe_mode || geteuid() != 0 || has_flag(pre, npre, "--pretend") || has_flag(pre, npre, "--ask")) {
		free(sv);
		return r;
	}
	fprintf(stderr, "\ncloudpkg: не вышло, чиню окружение и пробую ещё раз\n");
	heal();
	ensure_profile();
	if (!ensure_tree()) {
		free(sv);
		return r;
	}
	setenv("ACCEPT_KEYWORDS", "~amd64", 1);
	fprintf(stderr, "cloudpkg: повтор с разрешением testing (~amd64) для этой установки\n");
	r = emerge(pre, npre, pk, npk);
	if (r && has_flag(pre, npre, "--autounmask-keep-masks")) {
		p2 = xcalloc((size_t)(npre + 1), sizeof *p2);
		for (i = 0; i < npre; i++)
			if (strcmp(pre[i], "--autounmask-keep-masks"))
				p2[n++] = pre[i];
		fprintf(stderr, "cloudpkg: !! снимаю маски package.mask: причина маски написана в выводе emerge выше, прочти её. --safe отключает это\n");
		r = emerge(p2, n, pk, npk);
		free(p2);
	}
	if (sv)
		setenv("ACCEPT_KEYWORDS", sv, 1);
	else
		unsetenv("ACCEPT_KEYWORDS");
	free(sv);
	return r;
}

int cmd_install(int argc, char **argv)
{
	char **pre = xcalloc((size_t)(argc + 12), sizeof *pre);
	char **pk = xcalloc((size_t)(argc + 1), sizeof *pk);
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
		r = emerge_smart(pre, npre, pk, npk);
	}
	free(pre);
	free(pk);
	return r;
}

int cmd_remove(int argc, char **argv)
{
	char **pre = xcalloc((size_t)(argc + 12), sizeof *pre);
	char **pk = xcalloc((size_t)(argc + 1), sizeof *pk);
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
