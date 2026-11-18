#include "cloudpkg.h"
struct build_ctx {
	struct recipe r;
	char base[BUF]; char srcdir[BUF]; char image[BUF]; char log[BUF];
	char distfiles[16][256];
	int ndist; int jobcount;
};
struct owned { char *path; char owner[260]; };
static struct owned *owned_idx;
static int nowned;
static int owned_built;
static const char *configure_default =
	"if [ -x ./configure ]; then ./configure --prefix=/usr ${BUILD_FLAGS}; "
	"elif [ -f CMakeLists.txt ]; then cmake -B build -DCMAKE_INSTALL_PREFIX=/usr -DCMAKE_BUILD_TYPE=Release ${BUILD_FLAGS}; "
	"elif [ -f meson.build ]; then meson setup build --prefix=/usr --buildtype=release ${BUILD_FLAGS}; fi";
static const char *compile_default =
	"if [ -f build/CMakeCache.txt ]; then cmake --build build --parallel \"${JOBS}\"; "
	"elif [ -f build/build.ninja ]; then ninja -C build -j \"${JOBS}\"; "
	"elif [ -f build/Makefile ]; then make -C build; "
	"elif [ -f Makefile ] || [ -f makefile ] || [ -f GNUmakefile ]; then make; fi";
static const char *install_default =
	"if [ -f build/CMakeCache.txt ]; then DESTDIR=\"${D}\" cmake --install build; "
	"elif [ -f build/build.ninja ]; then DESTDIR=\"${D}\" ninja -C build install; "
	"elif [ -f build/Makefile ]; then make -C build DESTDIR=\"${D}\" install; "
	"elif [ -f Makefile ] || [ -f makefile ] || [ -f GNUmakefile ]; then make DESTDIR=\"${D}\" install; "
	"else echo \"no src_install phase and no recognized build system\" >&2; exit 1; fi";
static int owned_cmp(const void *a, const void *b)
{
	return strcmp(((const struct owned *)a)->path, ((const struct owned *)b)->path);
}
static void ownership_build(void)
{
	struct db_pkg *all;
	int n, i, j, nf;
	char path[BUF], **files;
	if (owned_built) return;
	owned_built = 1;
	n = db_all(&all);
	for (i = 0; i < n; i++) {
		snprintf(path, sizeof path, "%s/%s/%s/%s/files", INSTALLED, all[i].category, all[i].name, all[i].version);
		files = db_read_list(path, &nf);
		for (j = 0; j < nf; j++) {
			owned_idx = xrealloc(owned_idx, ((size_t)nowned + 1) * sizeof *owned_idx);
			owned_idx[nowned].path = files[j];
			snprintf(owned_idx[nowned].owner, sizeof owned_idx[nowned].owner, "%s/%s", all[i].category, all[i].name);
			nowned++;
		}
		free(files);
	}
	free(all);
	if (nowned > 0) qsort(owned_idx, (size_t)nowned, sizeof *owned_idx, owned_cmp);
}
void ownership_free(void)
{
	int i;
	for (i = 0; i < nowned; i++) free(owned_idx[i].path);
	free(owned_idx);
	owned_idx = NULL;
	nowned = 0;
	owned_built = 0;
}
static const char *find_owner(const char *path)
{
	struct owned key;
	struct owned *hit;
	key.path = (char *)path;
	hit = bsearch(&key, owned_idx, (size_t)nowned, sizeof *owned_idx, owned_cmp);
	return hit ? hit->owner : NULL;
}
const char *pkg_owner_of(const char *relpath)
{
	ownership_build();
	return find_owner(relpath);
}
static void url_basename(const char *url, char *out, size_t n)
{
	char buf[1024], *q, *slash;
	snprintf(buf, sizeof buf, "%s", url);
	q = strpbrk(buf, "?#");
	if (q) *q = 0;
	slash = strrchr(buf, '/');
	snprintf(out, n, "%.*s", (int)(n - 1), slash ? slash + 1 : buf);
}
static int distfile_name_ok(const char *s)
{
	if (!*s || *s == '.' || strchr(s, '/') || strstr(s, "..")) return 0;
	for (; *s; s++)
		if (!(isalnum((unsigned char)*s) || *s == '.' || *s == '_' || *s == '+' || *s == '-')) return 0;
	return 1;
}
static int manifest_check(const struct build_ctx *c, const char *filename, const char *full)
{
	char path[BUF + 32], line[BUF], dname[256], want[129], got[BUF], *h;
	long long dsize;
	struct stat st;
	FILE *f;
	int matched = 0, ok = 1;
	size_t hl;
	char *a[3];
	snprintf(path, sizeof path, "%s/Manifest", c->r.dir);
	f = fopen(path, "r");
	if (!f) {
		fprintf(stderr, "cloudpkg: no Manifest for %s/%s-%s, checksum verification skipped\n", c->r.category, c->r.name, c->r.version);
		return 1;
	}
	while (fgets(line, sizeof line, f)) {
		if (strncmp(line, "DIST ", 5)) continue;
		if (sscanf(line + 5, "%255s %lld", dname, &dsize) != 2) continue;
		if (strcmp(dname, filename)) continue;
		matched = 1;
		if (stat(full, &st) == 0 && (long long)st.st_size != dsize) {
			fprintf(stderr, "cloudpkg: size mismatch for %s: Manifest says %lld, got %lld\n", filename, dsize, (long long)st.st_size);
			ok = 0;
			break;
		}
		h = strstr(line, "SHA512 ");
		if (h) {
			h += 7;
			hl = strspn(h, "0123456789abcdefABCDEF");
			if (hl == 128) {
				memcpy(want, h, 128);
				want[128] = 0;
				a[0] = "sha512sum"; a[1] = (char *)full; a[2] = NULL;
				if (capture(a, got, sizeof got) == 0 && strncasecmp(got, want, 128)) {
					fprintf(stderr, "cloudpkg: SHA512 mismatch for %s\n", filename);
					ok = 0;
				}
			}
		}
		break;
	}
	fclose(f);
	if (!matched) fprintf(stderr, "cloudpkg: no Manifest entry for %s, checksum verification skipped\n", filename);
	return ok;
}
static int fetch_one(struct build_ctx *c, const char *url, const char *filename)
{
	char out[BUF], part[BUF + 8];
	struct stat st;
	char *a[5];
	if (!distfile_name_ok(filename)) {
		fprintf(stderr, "cloudpkg: unsafe distfile name: %s\n", filename);
		return 0;
	}
	if (c->ndist >= 16) {
		fputs("cloudpkg: too many source files in one recipe\n", stderr);
		return 0;
	}
	snprintf(out, sizeof out, "%s/%s", distdir, filename);
	snprintf(part, sizeof part, "%s.part", out);
	if (stat(out, &st) == 0 && st.st_size > 0) {
		printf("cloudpkg: using cached %s\n", filename);
	} else {
		printf("cloudpkg: downloading %s\n", url);
		fflush(stdout);
		unlink(part);
		if (url[0] == '/') {
			a[0] = "cp"; a[1] = (char *)url; a[2] = part; a[3] = NULL;
			if (run(a) != 0) {
				fprintf(stderr, "cloudpkg: cannot copy local source %s\n", url);
				unlink(part);
				return 0;
			}
		} else if (fetch(url, part) != 0) {
			fprintf(stderr, "cloudpkg: download failed: %s\n", url);
			unlink(part);
			return 0;
		}
		if (rename(part, out) != 0) {
			perror("cloudpkg: rename");
			unlink(part);
			return 0;
		}
	}
	if (!manifest_check(c, filename, out)) {
		unlink(out);
		fputs("cloudpkg: checksum verification failed, the file was removed\n", stderr);
		return 0;
	}
	snprintf(c->distfiles[c->ndist++], sizeof c->distfiles[0], "%s", filename);
	return 1;
}
static int fetch_distfiles(struct build_ctx *c)
{
	char buf[2048], *tok, *save = NULL, pending[1024] = "", name[256];
	int ok = 1;
	if (!mkdirs(distdir)) {
		fprintf(stderr, "cloudpkg: cannot create %s\n", distdir);
		return 0;
	}
	snprintf(buf, sizeof buf, "%s", c->r.src_uri);
	for (tok = strtok_r(buf, " \t\n", &save); tok && ok; tok = strtok_r(NULL, " \t\n", &save)) {
		if (!strcmp(tok, "->")) {
			tok = strtok_r(NULL, " \t\n", &save);
			if (!tok || !pending[0]) {
				fputs("cloudpkg: malformed SRC_URI arrow rename\n", stderr);
				return 0;
			}
			ok = fetch_one(c, pending, tok);
			pending[0] = 0;
			continue;
		}
		if (pending[0]) {
			url_basename(pending, name, sizeof name);
			ok = fetch_one(c, pending, name);
		}
		snprintf(pending, sizeof pending, "%s", tok);
	}
	if (ok && pending[0]) {
		url_basename(pending, name, sizeof name);
		ok = fetch_one(c, pending, name);
	}
	return ok;
}
static int extract_sources(struct build_ctx *c)
{
	char full[BUF], srcbase[BUF], probe[BUF + 256];
	char *a[8];
	int i, n;
	struct dirent **nl = NULL;
	size_t l;
	if (snprintf(srcbase, sizeof srcbase, "%s/src", c->base) >= (int)sizeof srcbase) return 0;
	for (i = 0; i < c->ndist; i++) {
		snprintf(full, sizeof full, "%s/%s", distdir, c->distfiles[i]);
		l = strlen(c->distfiles[i]);
		if (l > 4 && !strcmp(c->distfiles[i] + l - 4, ".zip")) {
			a[0] = "unzip"; a[1] = "-q"; a[2] = "-o"; a[3] = full; a[4] = "-d"; a[5] = srcbase; a[6] = NULL;
		} else {
			a[0] = "tar"; a[1] = "-xf"; a[2] = full; a[3] = "-C"; a[4] = srcbase; a[5] = "--no-same-owner"; a[6] = NULL;
		}
		if (run(a) != 0) {
			fprintf(stderr, "cloudpkg: cannot extract %s\n", full);
			return 0;
		}
	}
	snprintf(c->srcdir, sizeof c->srcdir, "%s", srcbase);
	n = scandir(srcbase, &nl, NULL, alphasort);
	if (n == 1 && nl[0]->d_name[0] != '.') {
		if (snprintf(probe, sizeof probe, "%s/%s", srcbase, nl[0]->d_name) < (int)sizeof probe && is_dir(probe) && strlen(probe) < sizeof c->srcdir)
			memcpy(c->srcdir, probe, sizeof c->srcdir);
	}
	for (i = 0; i < n; i++) free(nl[i]);
	if (n >= 0) free(nl);
	return 1;
}
static int run_phase(struct build_ctx *c, const char *name, const char *body, const char *dest)
{
	int fd[2], st, code;
	pid_t p;
	char buf[4096], jobsval[16], makeflags[24];
	ssize_t r;
	FILE *log;
	printf("cloudpkg: %s/%s-%s: phase %s\n", c->r.category, c->r.name, c->r.version, name);
	fflush(stdout);
	if (pipe(fd) < 0) return 1;
	p = fork();
	if (p < 0) {
		close(fd[0]);
		close(fd[1]);
		return 1;
	}
	if (p == 0) {
		close(fd[0]);
		dup2(fd[1], 1);
		dup2(fd[1], 2);
		close(fd[1]);
		umask(022);
		snprintf(jobsval, sizeof jobsval, "%d", c->jobcount);
		snprintf(makeflags, sizeof makeflags, "-j%d", c->jobcount);
		setenv("D", dest, 1);
		setenv("DESTDIR", dest, 1);
		setenv("WORKDIR", c->srcdir, 1);
		setenv("PACKAGE", c->r.name, 1);
		setenv("PN", c->r.name, 1);
		setenv("VERSION", c->r.version, 1);
		setenv("PV", c->r.version, 1);
		setenv("JOBS", jobsval, 1);
		setenv("MAKEFLAGS", makeflags, 1);
		setenv("BUILD_FLAGS", c->r.build_flags, 1);
		setenv("PREFIX", "/usr", 1);
		setenv("HOME", c->base, 1);
		setenv("LC_ALL", "C", 1);
		if (chdir(c->srcdir) < 0) _exit(126);
		execlp("bash", "bash", "-e", "-c", body, (char *)NULL);
		_exit(127);
	}
	close(fd[1]);
	log = fopen(c->log, "a");
	while ((r = read(fd[0], buf, sizeof buf)) != 0) {
		if (r < 0) {
			if (errno == EINTR) continue;
			break;
		}
		fwrite(buf, 1, (size_t)r, stdout);
		fflush(stdout);
		if (log) fwrite(buf, 1, (size_t)r, log);
	}
	if (log) fclose(log);
	close(fd[0]);
	if (waitpid(p, &st, 0) < 0) return 1;
	code = WIFEXITED(st) ? WEXITSTATUS(st) : 1;
	if (code != 0) fprintf(stderr, "cloudpkg: phase %s failed (exit %d), full log: %s\n", name, code, c->log);
	return code;
}
static int run_named_phase(struct build_ctx *c, const char *name)
{
	const char *body = recipe_phase(&c->r, name);
	if (!body) {
		if (!strcmp(name, "src_configure")) body = configure_default;
		else if (!strcmp(name, "src_compile")) body = compile_default;
		else if (!strcmp(name, "src_install")) body = install_default;
		else return 0;
	}
	return run_phase(c, name, body, c->image);
}
static int scan_tree(const char *root, const char *rel, char ***files, int *nf, char ***dirs, int *nd)
{
	char full[BUF + 256], sub[BUF];
	DIR *d;
	struct dirent *e;
	struct stat st;
	if (snprintf(full, sizeof full, "%s%s%s", root, rel[0] ? "/" : "", rel) >= (int)sizeof full) return 0;
	d = opendir(full);
	if (!d) return 0;
	while ((e = readdir(d))) {
		if (e->d_name[0] == '.' && (!e->d_name[1] || (e->d_name[1] == '.' && !e->d_name[2]))) continue;
		if (snprintf(sub, sizeof sub, "%s%s%s", rel, rel[0] ? "/" : "", e->d_name) >= (int)sizeof sub) continue;
		if (snprintf(full, sizeof full, "%s/%s", root, sub) >= (int)sizeof full) continue;
		if (lstat(full, &st) != 0) continue;
		if (S_ISDIR(st.st_mode)) {
			list_add(dirs, nd, sub);
			if (!scan_tree(root, sub, files, nf, dirs, nd)) {
				closedir(d);
				return 0;
			}
		} else {
			list_add(files, nf, sub);
		}
	}
	closedir(d);
	return 1;
}
static int check_conflicts(struct build_ctx *c, char **files, int nf, int force)
{
	char full[BUF + 64], self[260];
	const char *owner;
	struct stat st;
	int i, conflicts = 0;
	snprintf(self, sizeof self, "%s/%s", c->r.category, c->r.name);
	ownership_build();
	for (i = 0; i < nf; i++) {
		if (snprintf(full, sizeof full, "/%s", files[i]) >= (int)sizeof full) continue;
		if (lstat(full, &st) != 0) continue;
		owner = find_owner(files[i]);
		if (owner && !strcmp(owner, self)) continue;
		if (conflicts < 20) fprintf(stderr, "cloudpkg: conflict: /%s (%s)\n", files[i], owner ? owner : "untracked");
		conflicts++;
	}
	if (!conflicts) return 1;
	if (!force) {
		fprintf(stderr, "cloudpkg: %d file conflicts detected, rerun with --force to overwrite\n", conflicts);
		return 0;
	}
	fprintf(stderr, "cloudpkg: overwriting %d conflicting files (--force)\n", conflicts);
	return 1;
}
static int resolve_jobs(void)
{
	char out[64];
	char *a[2];
	long v;
	if (jobs > 0) return jobs;
	a[0] = "nproc"; a[1] = NULL;
	if (capture(a, out, sizeof out) == 0) {
		v = strtol(out, NULL, 10);
		if (v >= 1 && v <= 256) return (int)v;
	}
	return 2;
}
int pkg_build_install(const char *cat, const char *name, const char *ver, int explicit, int force)
{
	struct build_ctx c;
	char path[BUF + 256], oldver[64] = "", srcarg[BUF + 8];
	char **files = NULL, **dirs = NULL;
	int nf = 0, nd = 0, r = 1, was_installed, old_explicit = 0;
	char *a[6];
	memset(&c, 0, sizeof c);
	recipe_init(&c.r);
	if (!recipe_path(cat, name, ver, path, sizeof path)) {
		fprintf(stderr, "cloudpkg: recipe not found: %s/%s-%s\n", cat, name, ver);
		return 1;
	}
	if (!recipe_load(path, &c.r)) goto out;
	if (c.r.name[0] && strcmp(c.r.name, name)) {
		fprintf(stderr, "cloudpkg: %s: PACKAGE field %s does not match directory name %s\n", path, c.r.name, name);
		goto out;
	}
	if (c.r.version[0] && strcmp(c.r.version, ver)) {
		fprintf(stderr, "cloudpkg: %s: VERSION field %s does not match directory version %s\n", path, c.r.version, ver);
		goto out;
	}
	snprintf(c.r.category, sizeof c.r.category, "%s", cat);
	snprintf(c.r.name, sizeof c.r.name, "%s", name);
	snprintf(c.r.version, sizeof c.r.version, "%s", ver);
	snprintf(c.r.dir, sizeof c.r.dir, "%s/%s/%s/%s-%s", repo, cat, name, name, ver);
	recipe_expand(&c.r);
	was_installed = db_installed_version(cat, name, oldver, sizeof oldver);
	if (was_installed && !strcmp(oldver, ver) && !force) {
		printf("cloudpkg: %s/%s-%s is already installed\n", cat, name, ver);
		r = 0;
		goto out;
	}
	if (was_installed) old_explicit = db_explicit(cat, name, oldver);
	c.jobcount = resolve_jobs();
	if (snprintf(c.base, sizeof c.base, "%s/%s-%s-%s", workdir, cat, name, ver) >= (int)sizeof c.base) goto out;
	if (snprintf(c.image, sizeof c.image, "%s/image", c.base) >= (int)sizeof c.image) goto out;
	if (snprintf(c.log, sizeof c.log, "%s/build.log", c.base) >= (int)sizeof c.log) goto out;
	rm_tree(c.base);
	if (!mkdirs(c.base) || !mkdirs(c.image)) {
		fprintf(stderr, "cloudpkg: cannot create build directory %s\n", c.base);
		goto out;
	}
	if (snprintf(path, sizeof path, "%s/src", c.base) >= (int)sizeof path) goto out;
	if (!mkdirs(path)) {
		fprintf(stderr, "cloudpkg: cannot create source directory %s\n", path);
		goto out;
	}
	printf("cloudpkg: building %s/%s-%s with %d jobs\n", cat, name, ver, c.jobcount);
	if (!fetch_distfiles(&c)) goto fail;
	if (!extract_sources(&c)) goto fail;
	if (run_named_phase(&c, "src_prepare") != 0) goto fail;
	if (run_named_phase(&c, "src_configure") != 0) goto fail;
	if (run_named_phase(&c, "src_compile") != 0) goto fail;
	if (run_named_phase(&c, "pkg_preinst") != 0) goto fail;
	if (run_named_phase(&c, "src_install") != 0) goto fail;
	if (!scan_tree(c.image, "", &files, &nf, &dirs, &nd)) {
		fprintf(stderr, "cloudpkg: cannot scan the staged image %s\n", c.image);
		goto fail;
	}
	if (!nf) {
		fputs("cloudpkg: src_install produced no files\n", stderr);
		goto fail;
	}
	if (!check_conflicts(&c, files, nf, force)) goto fail;
	snprintf(srcarg, sizeof srcarg, "%s/.", c.image);
	a[0] = "cp"; a[1] = "-a"; a[2] = srcarg; a[3] = "/"; a[4] = NULL;
	if (run(a) != 0) {
		fputs("cloudpkg: cannot copy the staged image into /\n", stderr);
		goto fail;
	}
	if (have("ldconfig")) {
		a[0] = "ldconfig"; a[1] = NULL;
		run(a);
	}
	if (!db_record(&c.r, files, nf, dirs, nd, explicit || old_explicit)) goto fail;
	if (was_installed && strcmp(oldver, ver)) {
		db_remove(cat, name, oldver, files, nf);
		printf("cloudpkg: upgraded %s/%s %s -> %s\n", cat, name, oldver, ver);
	}
	if (explicit || old_explicit) world_add(cat, name);
	printf("cloudpkg: installed %s/%s-%s (%d files)\n", cat, name, ver, nf);
	if (recipe_phase(&c.r, "pkg_postinst")) run_phase(&c, "pkg_postinst", recipe_phase(&c.r, "pkg_postinst"), "/");
	if (!keep_workdir) rm_tree(c.base);
	r = 0;
	goto out;
fail:
	fprintf(stderr, "cloudpkg: build failed for %s/%s-%s, work directory kept: %s\n", cat, name, ver, c.base);
out:
	list_free(files, nf);
	list_free(dirs, nd);
	recipe_free(&c.r);
	return r;
}
