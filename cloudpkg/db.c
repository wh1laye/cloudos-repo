#include "cloudpkg.h"
static int meta_get(const char *dir, const char *key, char *out, size_t n)
{
	char path[BUF], line[BUF];
	size_t kl = strlen(key);
	FILE *f;
	int found = 0;
	snprintf(path, sizeof path, "%s/meta", dir);
	f = fopen(path, "r");
	if (!f) return 0;
	while (fgets(line, sizeof line, f)) {
		if (!strncmp(line, key, kl) && line[kl] == '=') {
			snprintf(out, n, "%s", trim(line + kl + 1));
			found = 1;
			break;
		}
	}
	fclose(f);
	return found;
}
static int best_version_dir(const char *dir, char *ver, size_t n)
{
	struct dirent **nl;
	int i, cnt, found = 0;
	cnt = scandir(dir, &nl, NULL, alphasort);
	if (cnt < 0) return 0;
	for (i = 0; i < cnt; i++) {
		if (nl[i]->d_name[0] != '.') {
			if (!found || vercmp(nl[i]->d_name, ver) > 0) {
				snprintf(ver, n, "%s", nl[i]->d_name);
				found = 1;
			}
		}
		free(nl[i]);
	}
	free(nl);
	return found;
}
int db_installed_version(const char *cat, const char *name, char *ver, size_t n)
{
	char dir[BUF];
	snprintf(dir, sizeof dir, "%s/%s/%s", INSTALLED, cat, name);
	return best_version_dir(dir, ver, n);
}
int db_find_installed(const char *name, char *cat, size_t cn, char *ver, size_t vn)
{
	struct dirent **nl;
	int i, cnt, found = 0;
	char dir[BUF];
	cnt = scandir(INSTALLED, &nl, NULL, alphasort);
	if (cnt < 0) return 0;
	for (i = 0; i < cnt && !found; i++) {
		if (nl[i]->d_name[0] == '.') continue;
		snprintf(dir, sizeof dir, "%s/%s/%s", INSTALLED, nl[i]->d_name, name);
		if (is_dir(dir) && best_version_dir(dir, ver, vn)) {
			snprintf(cat, cn, "%.127s", nl[i]->d_name);
			found = 1;
		}
	}
	for (i = 0; i < cnt; i++) free(nl[i]);
	free(nl);
	return found;
}
int db_all(struct db_pkg **out)
{
	struct dirent **cats, **names = NULL, **vers = NULL;
	int nc, nn, nv, i, j, k, n = 0;
	char dir[BUF];
	struct db_pkg p;
	*out = NULL;
	nc = scandir(INSTALLED, &cats, NULL, alphasort);
	if (nc < 0) return 0;
	for (i = 0; i < nc; i++) {
		if (cats[i]->d_name[0] == '.') continue;
		snprintf(dir, sizeof dir, "%s/%s", INSTALLED, cats[i]->d_name);
		nn = scandir(dir, &names, NULL, alphasort);
		for (j = 0; j < nn; j++) {
			if (names[j]->d_name[0] == '.') continue;
			snprintf(dir, sizeof dir, "%s/%s/%s", INSTALLED, cats[i]->d_name, names[j]->d_name);
			nv = scandir(dir, &vers, NULL, alphasort);
			for (k = 0; k < nv; k++) {
				if (vers[k]->d_name[0] != '.') {
					memset(&p, 0, sizeof p);
					snprintf(p.category, sizeof p.category, "%.127s", cats[i]->d_name);
					snprintf(p.name, sizeof p.name, "%.127s", names[j]->d_name);
					snprintf(p.version, sizeof p.version, "%.63s", vers[k]->d_name);
					p.explicit = db_explicit(p.category, p.name, p.version);
					*out = xrealloc(*out, ((size_t)n + 1) * sizeof **out);
					(*out)[n++] = p;
				}
				free(vers[k]);
			}
			if (nv >= 0) free(vers);
		}
		if (nn >= 0) free(names);
	}
	for (i = 0; i < nc; i++) free(cats[i]);
	free(cats);
	return n;
}
int db_explicit(const char *cat, const char *name, const char *ver)
{
	char dir[BUF], val[16];
	snprintf(dir, sizeof dir, "%s/%s/%s/%s", INSTALLED, cat, name, ver);
	if (meta_get(dir, "explicit", val, sizeof val)) return !strcmp(val, "1");
	return 0;
}
char **db_read_list(const char *path, int *n)
{
	FILE *f = fopen(path, "r");
	char line[BUF], *t;
	char **v = NULL;
	*n = 0;
	if (!f) return NULL;
	while (fgets(line, sizeof line, f)) {
		t = trim(line);
		if (*t) list_add(&v, n, t);
	}
	fclose(f);
	return v;
}
static void write_list(const char *path, char **v, int n)
{
	char tmp[BUF + 64];
	FILE *f;
	int i;
	if (snprintf(tmp, sizeof tmp, "%s.tmp", path) >= (int)sizeof tmp) {
		fprintf(stderr, "cloudpkg: path too long: %s\n", path);
		return;
	}
	f = fopen(tmp, "w");
	if (!f) {
		fprintf(stderr, "cloudpkg: cannot write %s: %s\n", tmp, strerror(errno));
		return;
	}
	for (i = 0; i < n; i++) fprintf(f, "%s\n", v[i]);
	if (fclose(f) != 0 || rename(tmp, path) != 0) {
		fprintf(stderr, "cloudpkg: cannot commit %s: %s\n", path, strerror(errno));
		unlink(tmp);
	}
}
int db_record(const struct recipe *r, char **files, int nf, char **dirs, int nd, int explicit)
{
	char dir[BUF], path[BUF + 32], meta[BUF + 40];
	FILE *f;
	snprintf(dir, sizeof dir, "%s/%s/%s/%s", INSTALLED, r->category, r->name, r->version);
	if (!mkdirs(dir)) {
		fprintf(stderr, "cloudpkg: cannot create database entry %s\n", dir);
		return 0;
	}
	snprintf(path, sizeof path, "%s/files", dir);
	write_list(path, files, nf);
	snprintf(path, sizeof path, "%s/dirs", dir);
	write_list(path, dirs, nd);
	snprintf(meta, sizeof meta, "%s/meta.tmp", dir);
	f = fopen(meta, "w");
	if (!f) {
		fprintf(stderr, "cloudpkg: cannot write %s: %s\n", meta, strerror(errno));
		return 0;
	}
	fprintf(f, "category=%s\n", r->category);
	fprintf(f, "name=%s\n", r->name);
	fprintf(f, "version=%s\n", r->version);
	fprintf(f, "description=%s\n", r->description);
	fprintf(f, "homepage=%s\n", r->homepage);
	fprintf(f, "license=%s\n", r->license);
	fprintf(f, "slot=%s\n", r->slot);
	fprintf(f, "depend=%s\n", r->depend);
	fprintf(f, "rdepend=%s\n", r->rdepend);
	fprintf(f, "explicit=%d\n", explicit);
	fprintf(f, "build_time=%ld\n", (long)time(NULL));
	if (fclose(f) != 0) {
		fprintf(stderr, "cloudpkg: cannot finish %s: %s\n", meta, strerror(errno));
		unlink(meta);
		return 0;
	}
	snprintf(path, sizeof path, "%s/meta", dir);
	if (rename(meta, path) != 0) {
		fprintf(stderr, "cloudpkg: cannot commit %s: %s\n", path, strerror(errno));
		unlink(meta);
		return 0;
	}
	return 1;
}
static int depth_cmp(const void *a, const void *b)
{
	const char *x = *(const char *const *)a;
	const char *y = *(const char *const *)b;
	int dx = 0, dy = 0;
	const char *p;
	for (p = x; *p; p++)
		if (*p == '/') dx++;
	for (p = y; *p; p++)
		if (*p == '/') dy++;
	if (dx != dy) return dy - dx;
	return strcmp(y, x);
}
static int rel_path_ok(const char *s)
{
	if (!*s || *s == '/' || strstr(s, "..")) return 0;
	return 1;
}
int db_remove(const char *cat, const char *name, const char *ver, char **keep, int nkeep)
{
	char dir[BUF], path[BUF + 32], full[BUF + 256];
	char **files, **dirs;
	int nf, nd, i, removed = 0;
	snprintf(dir, sizeof dir, "%s/%s/%s/%s", INSTALLED, cat, name, ver);
	snprintf(path, sizeof path, "%s/files", dir);
	files = db_read_list(path, &nf);
	snprintf(path, sizeof path, "%s/dirs", dir);
	dirs = db_read_list(path, &nd);
	for (i = 0; i < nf; i++) {
		if (keep && list_has(keep, nkeep, files[i])) continue;
		if (!rel_path_ok(files[i])) continue;
		if (snprintf(full, sizeof full, "/%s", files[i]) >= (int)sizeof full) continue;
		if (unlink(full) == 0) removed++;
	}
	if (nd > 0) {
		qsort(dirs, (size_t)nd, sizeof *dirs, depth_cmp);
		for (i = 0; i < nd; i++) {
			if (!rel_path_ok(dirs[i])) continue;
			if (snprintf(full, sizeof full, "/%s", dirs[i]) >= (int)sizeof full) continue;
			rmdir(full);
		}
	}
	list_free(files, nf);
	list_free(dirs, nd);
	rm_tree(dir);
	printf("cloudpkg: removed %s/%s-%s (%d files)\n", cat, name, ver, removed);
	return 1;
}
int db_reverse_deps(const char *name, char ***out)
{
	struct db_pkg *all;
	int n, i, j, nd, nr = 0;
	char **deps = NULL, key[260], depname[160], dir[BUF], val[2048], *slash;
	*out = NULL;
	n = db_all(&all);
	for (i = 0; i < n; i++) {
		if (!strcmp(all[i].name, name)) continue;
		snprintf(dir, sizeof dir, "%s/%s/%s/%s", INSTALLED, all[i].category, all[i].name, all[i].version);
		nd = 0;
		if (meta_get(dir, "depend", val, sizeof val)) dep_split(val, &deps, &nd);
		if (meta_get(dir, "rdepend", val, sizeof val)) dep_split(val, &deps, &nd);
		for (j = 0; j < nd; j++) {
			slash = strchr(deps[j], '/');
			snprintf(depname, sizeof depname, "%s", slash ? slash + 1 : deps[j]);
			if (!strcmp(depname, name)) {
				snprintf(key, sizeof key, "%s/%s", all[i].category, all[i].name);
				if (!list_has(*out, nr, key)) list_add(out, &nr, key);
				break;
			}
		}
		list_free(deps, nd);
		deps = NULL;
	}
	free(all);
	return nr;
}
static char **world_read(int *n)
{
	return db_read_list(WORLD, n);
}
static void world_write(char **v, int n)
{
	write_list(WORLD, v, n);
}
int world_has(const char *cat, const char *name)
{
	char key[260], **v;
	int n, has;
	snprintf(key, sizeof key, "%s/%s", cat, name);
	v = world_read(&n);
	has = list_has(v, n, key);
	list_free(v, n);
	return has;
}
void world_add(const char *cat, const char *name)
{
	char key[260], **v;
	int n;
	snprintf(key, sizeof key, "%s/%s", cat, name);
	v = world_read(&n);
	if (!list_has(v, n, key)) list_add(&v, &n, key);
	world_write(v, n);
	list_free(v, n);
}
void world_del(const char *cat, const char *name)
{
	char key[260], **v;
	int n, i, j = 0;
	snprintf(key, sizeof key, "%s/%s", cat, name);
	v = world_read(&n);
	for (i = 0; i < n; i++) {
		if (strcmp(v[i], key)) v[j++] = v[i];
		else free(v[i]);
	}
	world_write(v, j);
	list_free(v, j);
}
