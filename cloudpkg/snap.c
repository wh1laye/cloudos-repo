#include "cloudpkg.h"

#ifndef MOUNTINFO
#define MOUNTINFO "/proc/self/mountinfo"
#endif
#ifndef TOPMNT
#define TOPMNT "/run/cloudpkg-top"
#endif
#define SNAPSUB "cloudpkg-snapshots"
#define ROOTSUB "cloudpkg-roots"

int capture(char *const av[], char *out, size_t n)
{
	int fd[2], st;
	pid_t p;
	size_t len = 0;
	ssize_t r;

	if (pipe(fd) < 0)
		return -1;
	p = fork();
	if (p < 0) {
		close(fd[0]);
		close(fd[1]);
		return -1;
	}
	if (p == 0) {
		close(fd[0]);
		dup2(fd[1], 1);
		close(fd[1]);
		execvp(av[0], av);
		_exit(127);
	}
	close(fd[1]);
	while (len + 1 < n && (r = read(fd[0], out + len, n - len - 1)) > 0)
		len += (size_t)r;
	out[len] = 0;
	close(fd[0]);
	if (waitpid(p, &st, 0) < 0)
		return -1;
	return WIFEXITED(st) ? WEXITSTATUS(st) : -1;
}

int root_btrfs(char *dev, size_t n)
{
	FILE *f = fopen(MOUNTINFO, "r");
	char line[1024], mp[512], fst[32], src[512];
	char *sep;
	int found = 0;

	if (!f)
		return 0;
	while (fgets(line, sizeof line, f)) {
		sep = strstr(line, " - ");
		if (!sep)
			continue;
		if (sscanf(line, "%*s %*s %*s %*s %511s", mp) != 1 || strcmp(mp, "/"))
			continue;
		if (sscanf(sep + 3, "%31s %511s", fst, src) != 2)
			continue;
		found = !strcmp(fst, "btrfs") && !strncmp(src, "/dev/", 5);
		if (found)
			snprintf(dev, n, "%s", src);
	}
	fclose(f);
	return found;
}

int sn_is_name(const char *s)
{
	size_t i, n = strlen(s);

	if (n < 15 || n > 48)
		return 0;
	for (i = 0; i < 15; i++) {
		if (i == 8) {
			if (s[i] != '-')
				return 0;
		} else if (s[i] < '0' || s[i] > '9')
			return 0;
	}
	if (n == 15)
		return 1;
	if (s[15] != '-' || n == 16)
		return 0;
	for (i = 16; i < n; i++)
		if (!((s[i] >= 'a' && s[i] <= 'z') || (s[i] >= '0' && s[i] <= '9') || s[i] == '-'))
			return 0;
	return 1;
}

int sn_label_ok(const char *s)
{
	size_t i, n = strlen(s);

	if (n > 32 || (n && s[0] == '-'))
		return 0;
	for (i = 0; i < n; i++)
		if (!((s[i] >= 'a' && s[i] <= 'z') || (s[i] >= '0' && s[i] <= '9') || s[i] == '-'))
			return 0;
	return 1;
}

int top_mount(void)
{
	char dev[512];
	struct stat st;
	char *av[6];

	if (!root_btrfs(dev, sizeof dev)) {
		fputs("cloudpkg: корень не на btrfs, снимки недоступны\n", stderr);
		return 0;
	}
	if (!have("btrfs")) {
		fputs("cloudpkg: нет команды btrfs (btrfs-progs)\n", stderr);
		return 0;
	}
	if (mkdir(TOPMNT, 0700) < 0 && errno != EEXIST) {
		perror("cloudpkg: " TOPMNT);
		return 0;
	}
	if (lstat(TOPMNT, &st) < 0 || !S_ISDIR(st.st_mode) || st.st_uid != 0) {
		fputs("cloudpkg: " TOPMNT " небезопасен\n", stderr);
		return 0;
	}
	av[0] = "mount";
	av[1] = "-o";
	av[2] = "subvolid=5,noatime";
	av[3] = dev;
	av[4] = TOPMNT;
	av[5] = NULL;
	if (run(av)) {
		fputs("cloudpkg: не удалось примонтировать корень btrfs\n", stderr);
		return 0;
	}
	return 1;
}

void top_umount(void)
{
	char *av[3];

	av[0] = "umount";
	av[1] = TOPMNT;
	av[2] = NULL;
	run(av);
	rmdir(TOPMNT);
}

int sn_names(const char *dir, char ***out)
{
	struct dirent **nl;
	int n = scandir(dir, &nl, NULL, alphasort), i, c = 0;
	char **v;

	*out = NULL;
	if (n < 0)
		return 0;
	v = xcalloc((size_t)n + 1, sizeof *v);
	for (i = 0; i < n; i++) {
		if (sn_is_name(nl[i]->d_name))
			v[c++] = xstrdup(nl[i]->d_name);
		free(nl[i]);
	}
	free(nl);
	*out = v;
	return c;
}

void sn_free(char **v, int n)
{
	int i;

	for (i = 0; i < n; i++)
		free(v[i]);
	free(v);
}

void sn_prune(const char *dir)
{
	char **v;
	char p[256], *av[4];
	int n, i;

	if (sn_keep < 1)
		return;
	n = sn_names(dir, &v);
	for (i = 0; i < n - sn_keep; i++) {
		snprintf(p, sizeof p, "%s/%s", dir, v[i]);
		av[0] = "btrfs";
		av[1] = "subvolume";
		av[2] = "delete";
		av[3] = NULL;
		{
			char *dv[5];

			dv[0] = av[0];
			dv[1] = av[1];
			dv[2] = av[2];
			dv[3] = p;
			dv[4] = NULL;
			if (!run(dv))
				printf("cloudpkg: старый снимок %s удалён\n", v[i]);
		}
	}
	if (v)
		sn_free(v, n);
}

void sn_stamp(char *out, size_t n, int full)
{
	time_t t = time(NULL);
	struct tm tmv;

	localtime_r(&t, &tmv);
	if (full)
		strftime(out, n, "%Y%m%d-%H%M%S", &tmv);
	else
		strftime(out, n, "%H%M%S", &tmv);
}

int sn_create(const char *label)
{
	char ts[32], name[96], dir[128], dst[256];
	char *av[7];
	int r = 1;

	if (label && !sn_label_ok(label)) {
		fputs("cloudpkg: метка: до 32 символов a-z, 0-9 и дефис\n", stderr);
		return 1;
	}
	sn_stamp(ts, sizeof ts, 1);
	if (label && *label)
		snprintf(name, sizeof name, "%s-%s", ts, label);
	else
		snprintf(name, sizeof name, "%s", ts);
	if (!sn_is_name(name)) {
		fputs("cloudpkg: неверное имя снимка\n", stderr);
		return 1;
	}
	if (!top_mount())
		return 1;
	snprintf(dir, sizeof dir, "%s/%s", TOPMNT, SNAPSUB);
	if (mkdir(dir, 0700) < 0 && errno != EEXIST) {
		perror("cloudpkg: mkdir");
		goto out;
	}
	snprintf(dst, sizeof dst, "%s/%s", dir, name);
	av[0] = "btrfs";
	av[1] = "subvolume";
	av[2] = "snapshot";
	av[3] = "-r";
	av[4] = "/";
	av[5] = dst;
	av[6] = NULL;
	if (run(av)) {
		fputs("cloudpkg: btrfs не создал снимок\n", stderr);
		goto out;
	}
	printf("cloudpkg: снимок %s создан\n", name);
	sn_prune(dir);
	r = 0;
out:
	top_umount();
	return r;
}

int sn_auto(void)
{
	char dev[512];

	if (!root_btrfs(dev, sizeof dev)) {
		fputs("cloudpkg: снимок пропущен: корень не на btrfs\n", stderr);
		return 0;
	}
	if (sn_create("pre-upgrade")) {
		fputs("cloudpkg: снимок не создан, обновление остановлено (--no-snapshot пропускает снимок)\n", stderr);
		return 1;
	}
	return 0;
}

int sn_list(void)
{
	char dir[128];
	char **v;
	int n, i;

	if (!top_mount())
		return 1;
	snprintf(dir, sizeof dir, "%s/%s", TOPMNT, SNAPSUB);
	n = sn_names(dir, &v);
	if (!n)
		puts("снимков нет");
	for (i = 0; i < n; i++)
		puts(v[i]);
	if (v)
		sn_free(v, n);
	top_umount();
	return 0;
}

int sn_remove(const char *name)
{
	char dir[128], p[256];
	char *av[5];
	int r = 1;

	if (!sn_is_name(name)) {
		fputs("cloudpkg: неверное имя снимка\n", stderr);
		return 1;
	}
	if (!top_mount())
		return 1;
	snprintf(dir, sizeof dir, "%s/%s", TOPMNT, SNAPSUB);
	snprintf(p, sizeof p, "%s/%s", dir, name);
	if (!is_dir(p)) {
		fprintf(stderr, "cloudpkg: снимка %s нет\n", name);
		goto out;
	}
	av[0] = "btrfs";
	av[1] = "subvolume";
	av[2] = "delete";
	av[3] = p;
	av[4] = NULL;
	r = run(av) ? 1 : 0;
	if (!r)
		printf("cloudpkg: снимок %s удалён\n", name);
out:
	top_umount();
	return r;
}

int sn_rollback(const char *name)
{
	char dir[128], rd[128], src[256], dst[256], pick[96], ts[16], idb[64];
	char **v = NULL;
	char *av[8], *e;
	int n, r = 1;
	long id;

	if (name && !sn_is_name(name)) {
		fputs("cloudpkg: неверное имя снимка\n", stderr);
		return 1;
	}
	if (!top_mount())
		return 1;
	snprintf(dir, sizeof dir, "%s/%s", TOPMNT, SNAPSUB);
	n = sn_names(dir, &v);
	if (name)
		snprintf(pick, sizeof pick, "%s", name);
	else if (n)
		snprintf(pick, sizeof pick, "%s", v[n - 1]);
	else {
		fputs("cloudpkg: снимков нет\n", stderr);
		goto out;
	}
	snprintf(src, sizeof src, "%s/%s", dir, pick);
	if (!is_dir(src)) {
		fprintf(stderr, "cloudpkg: снимка %s нет\n", pick);
		goto out;
	}
	snprintf(rd, sizeof rd, "%s/%s", TOPMNT, ROOTSUB);
	if (mkdir(rd, 0700) < 0 && errno != EEXIST) {
		perror("cloudpkg: mkdir");
		goto out;
	}
	sn_stamp(ts, sizeof ts, 0);
	snprintf(dst, sizeof dst, "%s/%s-r%s", rd, pick, ts);
	av[0] = "btrfs";
	av[1] = "subvolume";
	av[2] = "snapshot";
	av[3] = src;
	av[4] = dst;
	av[5] = NULL;
	if (run(av)) {
		fputs("cloudpkg: не удалось создать корень из снимка\n", stderr);
		goto out;
	}
	av[0] = "btrfs";
	av[1] = "inspect-internal";
	av[2] = "rootid";
	av[3] = dst;
	av[4] = NULL;
	if (capture(av, idb, sizeof idb)) {
		fputs("cloudpkg: не удалось узнать id нового корня\n", stderr);
		goto out;
	}
	id = strtol(idb, &e, 10);
	if (e == idb || id < 256) {
		fputs("cloudpkg: неверный id нового корня\n", stderr);
		goto out;
	}
	snprintf(idb, sizeof idb, "%ld", id);
	av[0] = "btrfs";
	av[1] = "subvolume";
	av[2] = "set-default";
	av[3] = idb;
	av[4] = TOPMNT;
	av[5] = NULL;
	if (run(av)) {
		fputs("cloudpkg: не удалось сменить корень по умолчанию\n", stderr);
		goto out;
	}
	printf("cloudpkg: корень переключён на снимок %s, перезагрузись\n", pick);
	puts("предыдущая система осталась в корне btrfs (subvolid=5), удали её вручную, когда убедишься, что всё работает");
	r = 0;
out:
	if (v)
		sn_free(v, n);
	top_umount();
	return r;
}

int cmd_snapshot(int argc, char **argv)
{
	if (!need_root())
		return 1;
	if (argc > 1) {
		fputs("cloudpkg: snapshot [метка]\n", stderr);
		return 1;
	}
	return sn_create(argc ? argv[0] : NULL);
}

int cmd_snapshots(void)
{
	if (!need_root())
		return 1;
	return sn_list();
}

int cmd_snapshot_rm(int argc, char **argv)
{
	if (!need_root())
		return 1;
	if (argc != 1) {
		fputs("cloudpkg: snapshot-rm имя\n", stderr);
		return 1;
	}
	return sn_remove(argv[0]);
}

int cmd_rollback(int argc, char **argv)
{
	const char *name = NULL;
	int yes = 0, i;
	char ans[16];

	if (!need_root())
		return 1;
	for (i = 0; i < argc; i++) {
		if (!strcmp(argv[i], "-y") || !strcmp(argv[i], "--yes"))
			yes = 1;
		else if (!name && argv[i][0] != '-')
			name = argv[i];
		else {
			fputs("cloudpkg: rollback [-y] [имя]\n", stderr);
			return 1;
		}
	}
	if (!yes) {
		fputs("cloudpkg: система будет загружаться из снимка после перезагрузки. продолжить? [y/N] ", stderr);
		if (!fgets(ans, sizeof ans, stdin) || (ans[0] != 'y' && ans[0] != 'Y'))
			return 1;
	}
	return sn_rollback(name);
}
