#include "cloudpkg.h"
struct opts { int pretend; int ask; int oneshot; int force; int no_snapshot; };
struct plan_item { char cat[128]; char name[128]; char ver[64]; char oldver[64]; int explicit; int upgrade; };
static struct plan_item plan[MAXPLAN];
static int nplan;
static char **visiting;
static int nvisiting;
static char **visited;
static int nvisited;
static void plan_reset(void)
{
	nplan = 0;
	list_free(visiting, nvisiting);
	visiting = NULL;
	nvisiting = 0;
	list_free(visited, nvisited);
	visited = NULL;
	nvisited = 0;
}
static void visiting_pop(void)
{
	free(visiting[nvisiting - 1]);
	nvisiting--;
}
static int parse_opts(int argc, char **argv, struct opts *o, char ***pkgs, int *npk)
{
	int i;
	memset(o, 0, sizeof *o);
	*pkgs = NULL;
	*npk = 0;
	for (i = 0; i < argc; i++) {
		if (!strcmp(argv[i], "-p") || !strcmp(argv[i], "--pretend")) o->pretend = 1;
		else if (!strcmp(argv[i], "-a") || !strcmp(argv[i], "--ask")) o->ask = 1;
		else if (!strcmp(argv[i], "-o") || !strcmp(argv[i], "--oneshot")) o->oneshot = 1;
		else if (!strcmp(argv[i], "--force") || !strcmp(argv[i], "-f")) o->force = 1;
		else if (!strcmp(argv[i], "--no-snapshot")) o->no_snapshot = 1;
		else if (!strcmp(argv[i], "--jobs") && i + 1 < argc) {
			jobs = atoi(argv[++i]);
			if (jobs < 1) jobs = 1;
			if (jobs > 256) jobs = 256;
		}
		else if (argv[i][0] == '-') {
			fprintf(stderr, "cloudpkg: unknown option: %s\n", argv[i]);
			return 0;
		} else {
			list_add(pkgs, npk, argv[i]);
		}
	}
	return 1;
}
static int confirm(void)
{
	char ans[16];
	if (!isatty(0)) {
		fputs("cloudpkg: cannot ask without a terminal, drop -a\n", stderr);
		return 0;
	}
	fputs("cloudpkg: proceed? [y/N] ", stderr);
	if (!fgets(ans, sizeof ans, stdin) || (ans[0] != 'y' && ans[0] != 'Y')) return 0;
	return 1;
}
static int find_category(const char *name, char *cat, size_t cn)
{
	char **cats = NULL, p[BUF];
	int nc, i, found = 0;
	nc = tree_categories(&cats);
	for (i = 0; i < nc && !found; i++) {
		snprintf(p, sizeof p, "%s/%s/%s", repo, cats[i], name);
		if (is_dir(p)) {
			snprintf(cat, cn, "%s", cats[i]);
			found = 1;
		}
	}
	list_free(cats, nc);
	return found;
}
static int visit(const char *cat, const char *name, const char *ver, int explicit)
{
	char key[260], inst[64] = "", path[BUF + 256], dcat[128], dname[128], dver[64];
	char **deps = NULL, *slash;
	int nd = 0, i, ok = 1;
	struct recipe r;
	recipe_init(&r);
	snprintf(key, sizeof key, "%s/%s", cat, name);
	if (list_has(visited, nvisited, key)) return 1;
	if (list_has(visiting, nvisiting, key)) {
		fprintf(stderr, "cloudpkg: dependency cycle at %s\n", key);
		return 0;
	}
	if (nplan >= MAXPLAN) {
		fputs("cloudpkg: too many packages in one transaction\n", stderr);
		return 0;
	}
	list_add(&visiting, &nvisiting, key);
	if (db_installed_version(cat, name, inst, sizeof inst) && !strcmp(inst, ver)) {
		list_add(&visited, &nvisited, key);
		visiting_pop();
		return 1;
	}
	if (!recipe_path(cat, name, ver, path, sizeof path)) {
		fprintf(stderr, "cloudpkg: recipe not found: %s-%s\n", key, ver);
		ok = 0;
		goto done;
	}
	if (!recipe_load(path, &r)) {
		ok = 0;
		goto done;
	}
	snprintf(r.category, sizeof r.category, "%s", cat);
	snprintf(r.name, sizeof r.name, "%s", name);
	snprintf(r.version, sizeof r.version, "%s", ver);
	recipe_expand(&r);
	dep_split(r.depend, &deps, &nd);
	dep_split(r.rdepend, &deps, &nd);
	for (i = 0; i < nd && ok; i++) {
		slash = strchr(deps[i], '/');
		if (!strncmp(deps[i], "virtual/", 8)) {
			if (slash && find_category(slash + 1, dcat, sizeof dcat) && recipe_best(dcat, slash + 1, dver, sizeof dver)) {
				if (!visit(dcat, slash + 1, dver, 0)) ok = 0;
			} else {
				fprintf(stderr, "cloudpkg: virtual dependency %s has no recipe, skipped\n", deps[i]);
			}
			continue;
		}
		if (db_find_installed(slash ? slash + 1 : deps[i], dcat, sizeof dcat, dver, sizeof dver)) continue;
		if (!resolve_dep(deps[i], dcat, sizeof dcat, dname, sizeof dname, dver, sizeof dver)) {
			fprintf(stderr, "cloudpkg: missing dependency %s required by %s\n", deps[i], key);
			ok = 0;
			break;
		}
		if (!visit(dcat, dname, dver, 0)) ok = 0;
	}
	if (ok) {
		snprintf(plan[nplan].cat, sizeof plan[nplan].cat, "%s", cat);
		snprintf(plan[nplan].name, sizeof plan[nplan].name, "%s", name);
		snprintf(plan[nplan].ver, sizeof plan[nplan].ver, "%s", ver);
		snprintf(plan[nplan].oldver, sizeof plan[nplan].oldver, "%s", inst);
		plan[nplan].explicit = explicit;
		plan[nplan].upgrade = inst[0] ? 1 : 0;
		nplan++;
		list_add(&visited, &nvisited, key);
	}
done:
	recipe_free(&r);
	list_free(deps, nd);
	visiting_pop();
	return ok;
}
static void print_plan(void)
{
	int i;
	for (i = 0; i < nplan; i++) {
		if (plan[i].upgrade)
			printf("upgrade  %s/%s %s -> %s%s\n", plan[i].cat, plan[i].name, plan[i].oldver, plan[i].ver, plan[i].explicit ? "" : " (dependency)");
		else
			printf("install  %s/%s-%s%s\n", plan[i].cat, plan[i].name, plan[i].ver, plan[i].explicit ? "" : " (dependency)");
	}
}
static int execute_plan(int force)
{
	int i, r = 0;
	for (i = 0; i < nplan; i++) {
		if (pkg_build_install(plan[i].cat, plan[i].name, plan[i].ver, plan[i].explicit, force)) {
			r = 1;
			break;
		}
	}
	ownership_free();
	if (!r) printf("cloudpkg: transaction finished: %d package(s)\n", nplan);
	return r;
}
int cmd_install(int argc, char **argv)
{
	struct opts o;
	char **pkgs = NULL, cat[128], name[128], ver[64];
	int npk = 0, i, r = 1;
	if (!parse_opts(argc, argv, &o, &pkgs, &npk)) return 1;
	if (!npk) {
		fputs("cloudpkg: specify at least one package\n", stderr);
		goto out;
	}
	if (!o.pretend && !need_root()) goto out;
	if (!ensure_tree()) goto out;
	plan_reset();
	for (i = 0; i < npk; i++) {
		if (!resolve_name(pkgs[i], cat, sizeof cat, name, sizeof name, ver, sizeof ver)) goto out;
		if (!visit(cat, name, ver, !o.oneshot)) goto out;
	}
	if (!nplan) {
		puts("cloudpkg: nothing to do, requested packages are already installed");
		r = 0;
		goto out;
	}
	print_plan();
	if (o.pretend) {
		r = 0;
		goto out;
	}
	if (o.ask && !confirm()) goto out;
	r = execute_plan(o.force);
out:
	list_free(pkgs, npk);
	plan_reset();
	return r;
}
int cmd_remove(int argc, char **argv)
{
	struct opts o;
	char **pkgs = NULL, buf[512], cat[128], name[128], ver[64], *slash, *at, **rd;
	int npk = 0, i, j, nrd, r = 1;
	if (!parse_opts(argc, argv, &o, &pkgs, &npk)) return 1;
	if (!npk) {
		fputs("cloudpkg: specify at least one package\n", stderr);
		goto out;
	}
	if (!o.pretend && !need_root()) goto out;
	plan_reset();
	for (i = 0; i < npk; i++) {
		snprintf(buf, sizeof buf, "%s", pkgs[i]);
		at = strchr(buf, '@');
		if (at) *at = 0;
		slash = strchr(buf, '/');
		if (slash) {
			*slash = 0;
			snprintf(cat, sizeof cat, "%.127s", buf);
			snprintf(name, sizeof name, "%.127s", slash + 1);
			if (!db_installed_version(cat, name, ver, sizeof ver)) {
				fprintf(stderr, "cloudpkg: %s/%s is not installed\n", cat, name);
				goto out;
			}
		} else {
			snprintf(name, sizeof name, "%.127s", buf);
			if (!db_find_installed(name, cat, sizeof cat, ver, sizeof ver)) {
				fprintf(stderr, "cloudpkg: %s is not installed\n", name);
				goto out;
			}
		}
		if (at && strcmp(at + 1, ver)) {
			fprintf(stderr, "cloudpkg: version %s of %s/%s is not installed\n", at + 1, cat, name);
			goto out;
		}
		nrd = db_reverse_deps(name, &rd);
		if (nrd && !o.force) {
			fprintf(stderr, "cloudpkg: cannot remove %s/%s, required by:", cat, name);
			for (j = 0; j < nrd; j++) fprintf(stderr, " %s", rd[j]);
			fputc('\n', stderr);
			list_free(rd, nrd);
			goto out;
		}
		if (nrd) fprintf(stderr, "cloudpkg: removing %s/%s despite %d reverse dependencies (--force)\n", cat, name, nrd);
		list_free(rd, nrd);
		if (nplan >= MAXPLAN) {
			fputs("cloudpkg: too many packages in one transaction\n", stderr);
			goto out;
		}
		snprintf(plan[nplan].cat, sizeof plan[nplan].cat, "%s", cat);
		snprintf(plan[nplan].name, sizeof plan[nplan].name, "%s", name);
		snprintf(plan[nplan].ver, sizeof plan[nplan].ver, "%s", ver);
		nplan++;
	}
	if (o.pretend) {
		for (i = 0; i < nplan; i++) printf("remove   %s/%s-%s\n", plan[i].cat, plan[i].name, plan[i].ver);
		r = 0;
		goto out;
	}
	if (o.ask && !confirm()) goto out;
	for (i = 0; i < nplan; i++) {
		db_remove(plan[i].cat, plan[i].name, plan[i].ver, NULL, 0);
		world_del(plan[i].cat, plan[i].name);
	}
	r = 0;
out:
	list_free(pkgs, npk);
	plan_reset();
	return r;
}
int cmd_upgrade(int argc, char **argv)
{
	struct opts o;
	char **pkgs = NULL, best[64], cat2[128];
	int npk = 0, n, i, r = 1;
	struct db_pkg *all = NULL;
	if (!parse_opts(argc, argv, &o, &pkgs, &npk)) return 1;
	if (npk) {
		fputs("cloudpkg: upgrade takes no package arguments\n", stderr);
		list_free(pkgs, npk);
		return 1;
	}
	list_free(pkgs, npk);
	if (!o.pretend && !need_root()) return 1;
	if (!ensure_tree()) return 1;
	plan_reset();
	n = db_all(&all);
	for (i = 0; i < n; i++) {
		if (recipe_best(all[i].category, all[i].name, best, sizeof best)) {
			if (vercmp(best, all[i].version) > 0 && !visit(all[i].category, all[i].name, best, all[i].explicit)) goto out;
		} else if (find_category(all[i].name, cat2, sizeof cat2) && recipe_best(cat2, all[i].name, best, sizeof best)) {
			if (vercmp(best, all[i].version) > 0 && !visit(cat2, all[i].name, best, all[i].explicit)) goto out;
		} else {
			fprintf(stderr, "cloudpkg: no recipe for %s/%s, skipped\n", all[i].category, all[i].name);
		}
	}
	if (!nplan) {
		puts("cloudpkg: all packages are up to date");
		r = 0;
		goto out;
	}
	print_plan();
	if (o.pretend) {
		r = 0;
		goto out;
	}
	if (o.ask && !confirm()) goto out;
	if (!o.no_snapshot && sn_keep > 0 && sn_auto()) goto out;
	r = execute_plan(o.force);
out:
	free(all);
	plan_reset();
	return r;
}
int cmd_clean(int argc, char **argv)
{
	struct opts o;
	char **pkgs = NULL, **rd, *a[8];
	int npk = 0, n, i, pass, any, total = 0, nrd;
	struct db_pkg *all;
	if (!parse_opts(argc, argv, &o, &pkgs, &npk)) return 1;
	list_free(pkgs, npk);
	if (!o.pretend && !need_root()) return 1;
	if (o.pretend) {
		n = db_all(&all);
		for (i = 0; i < n; i++) {
			if (all[i].explicit) continue;
			nrd = db_reverse_deps(all[i].name, &rd);
			list_free(rd, nrd);
			if (!nrd) printf("remove   %s/%s-%s (orphan dependency)\n", all[i].category, all[i].name, all[i].version);
		}
		free(all);
		puts("cloudpkg: would clear distfiles and build directories");
		return 0;
	}
	if (o.ask && !confirm()) return 1;
	for (pass = 0; pass < 10; pass++) {
		n = db_all(&all);
		any = 0;
		for (i = 0; i < n; i++) {
			if (all[i].explicit) continue;
			nrd = db_reverse_deps(all[i].name, &rd);
			list_free(rd, nrd);
			if (nrd) continue;
			db_remove(all[i].category, all[i].name, all[i].version, NULL, 0);
			world_del(all[i].category, all[i].name);
			any = 1;
			total++;
			break;
		}
		free(all);
		if (!any) break;
	}
	if (exists(distdir)) {
		a[0] = "find"; a[1] = distdir; a[2] = "-mindepth"; a[3] = "1"; a[4] = "-delete"; a[5] = NULL;
		run(a);
	}
	if (exists(workdir)) {
		a[0] = "find"; a[1] = workdir; a[2] = "-mindepth"; a[3] = "1"; a[4] = "-delete"; a[5] = NULL;
		run(a);
	}
	printf("cloudpkg: cleaned %d orphan package(s), distfiles and build directories cleared\n", total);
	return 0;
}
int cmd_search(int argc, char **argv)
{
	char **cats = NULL, dir[BUF], ver[64];
	int nc, i, j, np, matches = 0, shown = 0;
	struct dirent **nl = NULL;
	if (argc != 1) {
		fputs("cloudpkg: usage: cloudpkg search term\n", stderr);
		return 1;
	}
	if (!ensure_tree()) return 1;
	nc = tree_categories(&cats);
	for (i = 0; i < nc; i++) {
		snprintf(dir, sizeof dir, "%s/%s", repo, cats[i]);
		np = scandir(dir, &nl, NULL, alphasort);
		for (j = 0; j < np; j++) {
			if (nl[j]->d_name[0] != '.' && strcasestr(nl[j]->d_name, argv[0]) && recipe_best(cats[i], nl[j]->d_name, ver, sizeof ver)) {
				matches++;
				if (shown < 100) {
					printf("%s/%s %s\n", cats[i], nl[j]->d_name, ver);
					shown++;
				}
			}
			free(nl[j]);
		}
		if (np >= 0) free(nl);
	}
	list_free(cats, nc);
	if (!matches) {
		puts("cloudpkg: no packages matched");
		return 1;
	}
	if (matches > shown) printf("cloudpkg: %d matches total, showing %d, refine the term\n", matches, shown);
	return 0;
}
int cmd_info(int argc, char **argv)
{
	char cat[128], name[128], ver[64], path[BUF + 256], inst[64];
	struct recipe r;
	int i;
	if (argc != 1) {
		fputs("cloudpkg: usage: cloudpkg info package\n", stderr);
		return 1;
	}
	if (!ensure_tree()) return 1;
	if (!resolve_name(argv[0], cat, sizeof cat, name, sizeof name, ver, sizeof ver)) return 1;
	recipe_init(&r);
	if (!recipe_path(cat, name, ver, path, sizeof path) || !recipe_load(path, &r)) {
		recipe_free(&r);
		return 1;
	}
	snprintf(r.category, sizeof r.category, "%s", cat);
	snprintf(r.name, sizeof r.name, "%s", name);
	snprintf(r.version, sizeof r.version, "%s", ver);
	recipe_expand(&r);
	printf("package:     %s/%s-%s\n", cat, name, ver);
	printf("description: %s\n", r.description);
	printf("homepage:    %s\n", r.homepage);
	printf("license:     %s\n", r.license);
	printf("slot:        %s\n", r.slot);
	printf("sources:     %s\n", r.src_uri);
	printf("depends:     %s\n", r.depend);
	printf("runtime:     %s\n", r.rdepend);
	printf("phases:     ");
	for (i = 0; i < r.nphases; i++) printf(" %s", r.phases[i].name);
	fputc('\n', stdout);
	if (db_installed_version(cat, name, inst, sizeof inst)) printf("installed:   %s\n", inst);
	else puts("installed:   no");
	recipe_free(&r);
	return 0;
}
int cmd_list(void)
{
	struct db_pkg *all;
	int n, i;
	n = db_all(&all);
	if (!n) {
		puts("cloudpkg: no packages installed");
		free(all);
		return 0;
	}
	for (i = 0; i < n; i++) printf("%s/%s-%s%s\n", all[i].category, all[i].name, all[i].version, all[i].explicit ? "" : " (dependency)");
	free(all);
	return 0;
}
int cmd_files(int argc, char **argv)
{
	char cat[128], name[128], ver[64], path[BUF], buf[512], **files, *sl;
	int n, i;
	if (argc != 1) {
		fputs("cloudpkg: usage: cloudpkg files package\n", stderr);
		return 1;
	}
	snprintf(buf, sizeof buf, "%s", argv[0]);
	sl = strchr(buf, '/');
	if (sl) {
		*sl = 0;
		snprintf(cat, sizeof cat, "%.127s", buf);
		snprintf(name, sizeof name, "%.127s", sl + 1);
		if (!db_installed_version(cat, name, ver, sizeof ver)) {
			fprintf(stderr, "cloudpkg: %s/%s is not installed\n", cat, name);
			return 1;
		}
	} else {
		snprintf(name, sizeof name, "%.127s", buf);
		if (!db_find_installed(name, cat, sizeof cat, ver, sizeof ver)) {
			fprintf(stderr, "cloudpkg: %s is not installed\n", name);
			return 1;
		}
	}
	snprintf(path, sizeof path, "%s/%s/%s/%s/files", INSTALLED, cat, name, ver);
	files = db_read_list(path, &n);
	for (i = 0; i < n; i++) printf("/%s\n", files[i]);
	list_free(files, n);
	return 0;
}
int cmd_owns(int argc, char **argv)
{
	char rel[BUF];
	const char *owner;
	if (argc != 1) {
		fputs("cloudpkg: usage: cloudpkg owns path\n", stderr);
		return 1;
	}
	snprintf(rel, sizeof rel, "%s", argv[0]);
	while (rel[0] == '/') memmove(rel, rel + 1, strlen(rel));
	owner = pkg_owner_of(rel);
	if (owner) {
		printf("%s\n", owner);
		return 0;
	}
	puts("untracked");
	return 1;
}
static void row(const char *name, const char *val)
{
	int w = 0;
	const char *s;
	for (s = name; *s; s++)
		if (((unsigned char)*s & 0xC0) != 0x80) w++;
	printf("%s%*s %s\n", name, w < 28 ? 28 - w : 0, "", val);
}
static int check(const char *name, int ok)
{
	row(name, ok ? "ok" : "MISSING");
	return ok;
}
int cmd_doctor(void)
{
	char id[64];
	int bad = 0, i;
	static const char *req[] = { "bash", "curl", "tar", "gcc", "make", "gzip", "xz", "sha512sum", "find", "cp", NULL };
	static const char *opt[] = { "unzip", "zstd", "minisign", "btrfs", "ldconfig", NULL };
	osid(id, sizeof id);
	row("system id", id);
	bad += !check("write access to /", access("/", W_OK) == 0);
	bad += !check("recipe tree", exists(repo));
	bad += !check("distfiles directory", exists(distdir));
	bad += !check("build directory", exists(workdir));
	bad += !check("installed database", exists(INSTALLED));
	for (i = 0; req[i]; i++) bad += !check(req[i], have(req[i]));
	for (i = 0; opt[i]; i++) row(opt[i], have(opt[i]) ? "present" : "absent (optional)");
	printf("%s\n", bad ? "problems found" : "all good");
	return bad ? 1 : 0;
}
int cmd_fix(void)
{
	if (!need_root()) return 1;
	puts("cloudpkg: repairing the environment");
	if (!mkdirs(distdir) || !mkdirs(workdir) || !mkdirs(INSTALLED)) {
		fputs("cloudpkg: cannot create required directories\n", stderr);
		return 1;
	}
	if (!ensure_tree()) return 1;
	return cmd_doctor();
}
static int count_tree(const char *dir, int *ncats, int *npkgs)
{
	struct dirent **nl, **pl = NULL;
	int nc, np, i, j, c = 0, p = 0;
	char sub[BUF], probe[BUF];
	nc = scandir(dir, &nl, NULL, alphasort);
	if (nc < 0) return 0;
	for (i = 0; i < nc; i++) {
		if (nl[i]->d_name[0] != '.' && strcmp(nl[i]->d_name, "metadata") && strcmp(nl[i]->d_name, "profiles")) {
			snprintf(sub, sizeof sub, "%s/%s", dir, nl[i]->d_name);
			if (is_dir(sub)) {
				c++;
				np = scandir(sub, &pl, NULL, alphasort);
				for (j = 0; j < np; j++) {
					if (pl[j]->d_name[0] != '.') {
						snprintf(probe, sizeof probe, "%s/%s", sub, pl[j]->d_name);
						if (is_dir(probe)) p++;
					}
					free(pl[j]);
				}
				if (np >= 0) free(pl);
			}
		}
		free(nl[i]);
	}
	free(nl);
	*ncats = c;
	*npkgs = p;
	return c > 0;
}
int cmd_sync(void)
{
	char part[BUF], fin[BUF], nw[BUF], old[BUF], sig[BUF + 16], sigurl[640];
	char *a[12];
	int ncats = 0, npkgs = 0;
	if (!need_root()) return 1;
	if (!have("curl") || !have("tar")) {
		fputs("cloudpkg: sync needs curl and tar\n", stderr);
		return 1;
	}
	if (!mkdirs(distdir)) {
		fprintf(stderr, "cloudpkg: cannot create %s\n", distdir);
		return 1;
	}
	snprintf(part, sizeof part, "%s/recipes.tar.gz.part", distdir);
	snprintf(fin, sizeof fin, "%s/recipes.tar.gz", distdir);
	printf("cloudpkg: downloading recipe tree: %s\n", recipes_url);
	fflush(stdout);
	unlink(part);
	if (fetch(recipes_url, part) != 0) {
		fputs("cloudpkg: recipe tree download failed, check the network and recipes_url\n", stderr);
		unlink(part);
		return 1;
	}
	snprintf(sigurl, sizeof sigurl, "%s.minisig", recipes_url);
	snprintf(sig, sizeof sig, "%s.minisig", part);
	if (fetch(sigurl, sig) == 0) {
		if (have("minisign") && exists(PUBKEY)) {
			if (!verify_sig(part, sig)) {
				fputs("cloudpkg: recipe tree signature mismatch, sync aborted\n", stderr);
				unlink(part);
				unlink(sig);
				return 1;
			}
			puts("cloudpkg: minisign signature verified");
		} else {
			fputs("cloudpkg: signature downloaded but minisign or the public key is missing, not verified\n", stderr);
		}
		unlink(sig);
	} else {
		fputs("cloudpkg: no detached signature published for the recipe tree, trusting HTTPS\n", stderr);
	}
	unlink(fin);
	if (rename(part, fin) != 0) {
		perror("cloudpkg: rename");
		return 1;
	}
	snprintf(nw, sizeof nw, "%s.new", repo);
	snprintf(old, sizeof old, "%s.old", repo);
	rm_tree(nw);
	if (!mkdirs(nw)) {
		fprintf(stderr, "cloudpkg: cannot create %s\n", nw);
		return 1;
	}
	puts("cloudpkg: extracting the recipe tree");
	fflush(stdout);
	a[0] = "tar"; a[1] = "xzf"; a[2] = fin; a[3] = "--strip-components=1"; a[4] = "--no-same-owner"; a[5] = "-C"; a[6] = nw; a[7] = NULL;
	if (run(a) != 0) {
		fputs("cloudpkg: cannot extract the recipe archive\n", stderr);
		return 1;
	}
	if (!count_tree(nw, &ncats, &npkgs)) {
		fputs("cloudpkg: the archive does not look like a recipe tree, the current tree was kept\n", stderr);
		rm_tree(nw);
		return 1;
	}
	rm_tree(old);
	if (exists(repo) && rename(repo, old) != 0) {
		perror("cloudpkg: rename");
		return 1;
	}
	if (rename(nw, repo) != 0) {
		perror("cloudpkg: rename");
		if (exists(old) && rename(old, repo) != 0) perror("cloudpkg: cannot restore the previous tree");
		return 1;
	}
	rm_tree(old);
	printf("cloudpkg: recipe tree updated: %d packages in %d categories\n", npkgs, ncats);
	return 0;
}
