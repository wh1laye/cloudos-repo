#include "cloudpkg.h"
#ifndef MOUNTINFO
#define MOUNTINFO "/proc/self/mountinfo"
#endif
#ifndef TOPMNT
#define TOPMNT "/run/cloudpkg-top"
#endif
#define SNAPSUB "cloudpkg-snapshots"
#define ROOTSUB "cloudpkg-roots"
int root_btrfs(char *dev, size_t n)
{
	FILE *f = fopen(MOUNTINFO, "r");
	char line[1024], mp[512], fst[32], src[512];
	char *sep;
	int found = 0;
	if (!f) return 0;
	while (fgets(line, sizeof line, f)) {
		sep = strstr(line, " - ");
		if (!sep) continue;
		if (sscanf(line, "%*s %*s %*s %*s %511s", mp) != 1 || strcmp(mp, "/")) continue;
		if (sscanf(sep + 3, "%31s %511s", fst, src) != 2) continue;
		found = !strcmp(fst, "btrfs") && !strncmp(src, "/dev/", 5);
		if (found) snprintf(dev, n, "%s", src);
	}
	fclose(f);
	return found;
}
int sn_is_name(const char *s)
{
	size_t i, n = strlen(s);
	if (n < 15 || n > 48) return 0;
	for (i = 0; i < 15; i++) {
		if (i == 8) {
			if (s[i] != '-') return 0;
		} else if (s[i] < '0' || s[i] > '9') {
			return 0;
		}
	}
	if (n == 15) return 1;
	if (s[15] != '-' || n == 16) return 0;
	for (i = 16; i < n; i++)
		if (!((s[i] >= 'a' && s[i] <= 'z') || (s[i] >= '0' && s[i] <= '9') || s[i] == '-')) return 0;
	return 1;
}
int sn_label_ok(const char *s)
{
	size_t i, n = strlen(s);
	if (n > 32 || (n && s[0] == '-')) return 0;
	for (i = 0; i < n; i++)
		if (!((s[i] >= 'a' && s[i] <= 'z') || (s[i] >= '0' && s[i] <= '9') || s[i] == '-')) return 0;
	return 1;
}
int top_mount(void)
{
	char dev[512];
	struct stat st;
	char *av[6];
	if (!root_btrfs(dev, sizeof dev)) {
		fputs("cloudpkg: root filesystem is not btrfs, snapshots are unavailable\n", stderr);
		return 0;
	}
	if (!have("btrfs")) {
		fputs("cloudpkg: btrfs command not found (btrfs-progs)\n", stderr);
		return 0;
	}
	if (mkdir(TOPMNT, 0700) < 0 && errno != EEXIST) {
		perror("cloudpkg: " TOPMNT);
		return 0;
	}
	if (lstat(TOPMNT, &st) < 0 || !S_ISDIR(st.st_mode) || st.st_uid != 0) {
		fputs("cloudpkg: " TOPMNT " is not safe\n", stderr);
		return 0;
	}
	av[0] = "mount"; av[1] = "-o"; av[2] = "subvolid=5,noatime"; av[3] = dev; av[4] = TOPMNT; av[5] = NULL;
	if (run(av)) {
		fputs("cloudpkg: cannot mount the btrfs top level\n", stderr);
		return 0;
	}
	return 1;
}
void top_umount(void)
{
	char *av[3];
	av[0] = "umount"; av[1] = TOPMNT; av[2] = NULL;
	run(av);
	rmdir(TOPMNT);
}
int sn_names(const char *dir, char ***out)
{
	struct dirent **nl;
	int n = scandir(dir, &nl, NULL, alphasort), i, c = 0;
	char **v;
	*out = NULL;
	if (n < 0) return 0;
	v = xcalloc((size_t)n + 1, sizeof *v);
	for (i = 0; i < n; i++) {
		if (sn_is_name(nl[i]->d_name)) v[c++] = xstrdup(nl[i]->d_name);
		free(nl[i]);
	}
	free(nl);
	*out = v;
	return c;
}
void sn_prune(const char *dir)
{
	char **v = NULL;
	char p[512], *dv[5];
	int n, i;
	if (sn_keep < 1) return;
	n = sn_names(dir, &v);
	if (!v) return;
	for (i = 0; i < n - sn_keep; i++) {
		if (snprintf(p, sizeof p, "%s/%s", dir, v[i]) >= (int)sizeof p) continue;
		dv[0] = "btrfs"; dv[1] = "subvolume"; dv[2] = "delete"; dv[3] = p; dv[4] = NULL;
		if (!run(dv)) printf("cloudpkg: old snapshot %s deleted\n", v[i]);
	}
	list_free(v, n);
}
void sn_stamp(char *out, size_t n, int full)
{
	time_t t = time(NULL);
	struct tm tmv;
	localtime_r(&t, &tmv);
	if (full) strftime(out, n, "%Y%m%d-%H%M%S", &tmv);
	else strftime(out, n, "%H%M%S", &tmv);
}
int sn_create(const char *label)
{
	char ts[32], name[96], dir[128], dst[256];
	char *av[7];
	int r = 1;
	if (label && !sn_label_ok(label)) {
		fputs("cloudpkg: label: up to 32 characters a-z, 0-9 and dash\n", stderr);
		return 1;
	}
	sn_stamp(ts, sizeof ts, 1);
	if (label && *label) snprintf(name, sizeof name, "%s-%s", ts, label);
	else snprintf(name, sizeof name, "%s", ts);
	if (!sn_is_name(name)) {
		fputs("cloudpkg: invalid snapshot name\n", stderr);
		return 1;
	}
	if (!top_mount()) return 1;
	snprintf(dir, sizeof dir, "%s/%s", TOPMNT, SNAPSUB);
	if (mkdir(dir, 0700) < 0 && errno != EEXIST) {
		perror("cloudpkg: mkdir");
		goto out;
	}
	snprintf(dst, sizeof dst, "%s/%s", dir, name);
	av[0] = "btrfs"; av[1] = "subvolume"; av[2] = "snapshot"; av[3] = "-r"; av[4] = "/"; av[5] = dst; av[6] = NULL;
	if (run(av)) {
		fputs("cloudpkg: btrfs failed to create the snapshot\n", stderr);
		goto out;
	}
	printf("cloudpkg: snapshot %s created\n", name);
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
		fputs("cloudpkg: snapshot skipped: root filesystem is not btrfs\n", stderr);
		return 0;
	}
	if (sn_create("pre-upgrade")) {
		fputs("cloudpkg: snapshot failed, upgrade stopped (--no-snapshot skips the snapshot)\n", stderr);
		return 1;
	}
	return 0;
}
int sn_list(void)
{
	char dir[128];
	char **v;
	int n, i;
	if (!top_mount()) return 1;
	snprintf(dir, sizeof dir, "%s/%s", TOPMNT, SNAPSUB);
	n = sn_names(dir, &v);
	if (!n) puts("no snapshots");
	for (i = 0; i < n; i++) puts(v[i]);
	if (v) list_free(v, n);
	top_umount();
	return 0;
}
int sn_remove(const char *name)
{
	char dir[128], p[256];
	char *av[5];
	int r = 1;
	if (!sn_is_name(name)) {
		fputs("cloudpkg: invalid snapshot name\n", stderr);
		return 1;
	}
	if (!top_mount()) return 1;
	snprintf(dir, sizeof dir, "%s/%s", TOPMNT, SNAPSUB);
	snprintf(p, sizeof p, "%s/%s", dir, name);
	if (!is_dir(p)) {
		fprintf(stderr, "cloudpkg: snapshot %s not found\n", name);
		goto out;
	}
	av[0] = "btrfs"; av[1] = "subvolume"; av[2] = "delete"; av[3] = p; av[4] = NULL;
	r = run(av) ? 1 : 0;
	if (!r) printf("cloudpkg: snapshot %s deleted\n", name);
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
		fputs("cloudpkg: invalid snapshot name\n", stderr);
		return 1;
	}
	if (!top_mount()) return 1;
	snprintf(dir, sizeof dir, "%s/%s", TOPMNT, SNAPSUB);
	n = sn_names(dir, &v);
	if (name) snprintf(pick, sizeof pick, "%s", name);
	else if (n) snprintf(pick, sizeof pick, "%s", v[n - 1]);
	else {
		fputs("cloudpkg: no snapshots\n", stderr);
		goto out;
	}
	snprintf(src, sizeof src, "%s/%s", dir, pick);
	if (!is_dir(src)) {
		fprintf(stderr, "cloudpkg: snapshot %s not found\n", pick);
		goto out;
	}
	snprintf(rd, sizeof rd, "%s/%s", TOPMNT, ROOTSUB);
	if (mkdir(rd, 0700) < 0 && errno != EEXIST) {
		perror("cloudpkg: mkdir");
		goto out;
	}
	sn_stamp(ts, sizeof ts, 0);
	snprintf(dst, sizeof dst, "%s/%s-r%s", rd, pick, ts);
	av[0] = "btrfs"; av[1] = "subvolume"; av[2] = "snapshot"; av[3] = src; av[4] = dst; av[5] = NULL;
	if (run(av)) {
		fputs("cloudpkg: cannot create a new root from the snapshot\n", stderr);
		goto out;
	}
	av[0] = "btrfs"; av[1] = "inspect-internal"; av[2] = "rootid"; av[3] = dst; av[4] = NULL;
	if (capture(av, idb, sizeof idb)) {
		fputs("cloudpkg: cannot read the id of the new root\n", stderr);
		goto out;
	}
	id = strtol(idb, &e, 10);
	if (e == idb || id < 256) {
		fputs("cloudpkg: invalid id of the new root\n", stderr);
		goto out;
	}
	snprintf(idb, sizeof idb, "%ld", id);
	av[0] = "btrfs"; av[1] = "subvolume"; av[2] = "set-default"; av[3] = idb; av[4] = TOPMNT; av[5] = NULL;
	if (run(av)) {
		fputs("cloudpkg: cannot switch the default root\n", stderr);
		goto out;
	}
	printf("cloudpkg: root switched to snapshot %s, reboot now\n", pick);
	puts("the previous system stays in the btrfs top level (subvolid=5), remove it manually once you confirm everything works");
	r = 0;
out:
	if (v) list_free(v, n);
	top_umount();
	return r;
}
int cmd_snapshot(int argc, char **argv)
{
	if (!need_root()) return 1;
	if (argc > 1) {
		fputs("cloudpkg: usage: cloudpkg snapshot [label]\n", stderr);
		return 1;
	}
	return sn_create(argc ? argv[0] : NULL);
}
int cmd_snapshots(void)
{
	if (!need_root()) return 1;
	return sn_list();
}
int cmd_snapshot_rm(int argc, char **argv)
{
	if (!need_root()) return 1;
	if (argc != 1) {
		fputs("cloudpkg: usage: cloudpkg snapshot-rm name\n", stderr);
		return 1;
	}
	return sn_remove(argv[0]);
}
int cmd_rollback(int argc, char **argv)
{
	const char *name = NULL;
	int yes = 0, i;
	char ans[16];
	if (!need_root()) return 1;
	for (i = 0; i < argc; i++) {
		if (!strcmp(argv[i], "-y") || !strcmp(argv[i], "--yes")) yes = 1;
		else if (!name && argv[i][0] != '-') name = argv[i];
		else {
			fputs("cloudpkg: usage: cloudpkg rollback [-y] [name]\n", stderr);
			return 1;
		}
	}
	if (!yes) {
		fputs("cloudpkg: the system will boot from the snapshot after reboot. continue? [y/N] ", stderr);
		if (!fgets(ans, sizeof ans, stdin) || (ans[0] != 'y' && ans[0] != 'Y')) return 1;
	}
	return sn_rollback(name);
}
