#include "cloudpkg.h"
static const char *const phase_names[] = {
	"src_prepare", "src_configure", "src_compile", "src_install",
	"pkg_preinst", "pkg_postinst", "pkg_prerm", "pkg_postrm"
};
void recipe_init(struct recipe *r)
{
	memset(r, 0, sizeof *r);
}
void recipe_free(struct recipe *r)
{
	int i;
	for (i = 0; i < r->nphases; i++) free(r->phases[i].body);
	r->nphases = 0;
}
const char *recipe_phase(const struct recipe *r, const char *name)
{
	int i;
	for (i = 0; i < r->nphases; i++)
		if (!strcmp(r->phases[i].name, name)) return r->phases[i].body;
	return NULL;
}
static int phase_known(const char *name)
{
	size_t i;
	for (i = 0; i < sizeof phase_names / sizeof *phase_names; i++)
		if (!strcmp(phase_names[i], name)) return 1;
	return 0;
}
static void set_field(struct recipe *r, const char *key, const char *val)
{
	if (!strcmp(key, "PACKAGE")) snprintf(r->name, sizeof r->name, "%s", val);
	else if (!strcmp(key, "VERSION")) snprintf(r->version, sizeof r->version, "%s", val);
	else if (!strcmp(key, "DESCRIPTION")) snprintf(r->description, sizeof r->description, "%s", val);
	else if (!strcmp(key, "HOMEPAGE")) snprintf(r->homepage, sizeof r->homepage, "%s", val);
	else if (!strcmp(key, "LICENSE")) snprintf(r->license, sizeof r->license, "%s", val);
	else if (!strcmp(key, "SLOT")) snprintf(r->slot, sizeof r->slot, "%s", val);
	else if (!strcmp(key, "SRC_URI")) snprintf(r->src_uri, sizeof r->src_uri, "%s", val);
	else if (!strcmp(key, "DEPEND")) snprintf(r->depend, sizeof r->depend, "%s", val);
	else if (!strcmp(key, "RDEPEND")) snprintf(r->rdepend, sizeof r->rdepend, "%s", val);
	else if (!strcmp(key, "BUILD_FLAGS")) snprintf(r->build_flags, sizeof r->build_flags, "%s", val);
}
static int key_valid(const char *k)
{
	if (!*k) return 0;
	for (; *k; k++)
		if (!((*k >= 'A' && *k <= 'Z') || *k == '_')) return 0;
	return 1;
}
static int body_append(char **body, size_t *len, const char *s)
{
	size_t n = strlen(s);
	if (*len + n + 2 > MAXPHASE) return 0;
	*body = xrealloc(*body, *len + n + 2);
	memcpy(*body + *len, s, n);
	*len += n;
	(*body)[(*len)++] = '\n';
	(*body)[*len] = 0;
	return 1;
}
static int value_append(char *buf, size_t n, const char *s)
{
	size_t l = strlen(buf), a = strlen(s);
	if (l + a + 2 > n) return 0;
	if (l) buf[l++] = ' ';
	memcpy(buf + l, s, a + 1);
	return 1;
}
int recipe_load(const char *path, struct recipe *r)
{
	FILE *f = fopen(path, "r");
	char line[BUF], vkey[64] = "", vbuf[4096] = "", pname[32] = "";
	char *pbody = NULL, *t, *eq, *q, *paren, *rest;
	size_t plen = 0;
	int lineno = 0, ok = 1, i;
	if (!f) {
		fprintf(stderr, "cloudpkg: cannot read recipe: %s\n", path);
		return 0;
	}
	while (fgets(line, sizeof line, f)) {
		lineno++;
		t = trim(line);
		if (pname[0]) {
			if (!strcmp(t, "}")) {
				for (i = 0; i < r->nphases; i++)
					if (!strcmp(r->phases[i].name, pname)) break;
				if (i < r->nphases) {
					fprintf(stderr, "cloudpkg: %s:%d: duplicate function %s\n", path, lineno, pname);
					ok = 0;
					break;
				}
				snprintf(r->phases[r->nphases].name, sizeof r->phases[r->nphases].name, "%s", pname);
				r->phases[r->nphases].body = pbody ? pbody : xstrdup("");
				r->nphases++;
				pbody = NULL;
				plen = 0;
				pname[0] = 0;
				continue;
			}
			if (!body_append(&pbody, &plen, line)) {
				fprintf(stderr, "cloudpkg: %s:%d: function %s is too large\n", path, lineno, pname);
				ok = 0;
				break;
			}
			continue;
		}
		if (vkey[0]) {
			q = strchr(t, '"');
			if (q) *q = 0;
			if (!value_append(vbuf, sizeof vbuf, t)) {
				fprintf(stderr, "cloudpkg: %s:%d: value of %s is too large\n", path, lineno, vkey);
				ok = 0;
				break;
			}
			if (q) {
				set_field(r, vkey, vbuf);
				vkey[0] = 0;
				vbuf[0] = 0;
			}
			continue;
		}
		if (!*t || *t == '#') continue;
		paren = strstr(t, "()");
		if (paren) {
			*paren = 0;
			rest = trim(paren + 2);
			if (!phase_known(t) || strcmp(rest, "{")) {
				fprintf(stderr, "cloudpkg: %s:%d: unsupported function or missing opening brace: %s\n", path, lineno, t);
				ok = 0;
				break;
			}
			if (r->nphases >= 8) {
				fprintf(stderr, "cloudpkg: %s:%d: too many functions\n", path, lineno);
				ok = 0;
				break;
			}
			snprintf(pname, sizeof pname, "%s", t);
			continue;
		}
		eq = strchr(t, '=');
		if (!eq) {
			fprintf(stderr, "cloudpkg: %s:%d: expected key=value or function, got: %s\n", path, lineno, t);
			ok = 0;
			break;
		}
		*eq = 0;
		if (!key_valid(trim(t))) {
			fprintf(stderr, "cloudpkg: %s:%d: invalid key: %s\n", path, lineno, t);
			ok = 0;
			break;
		}
		q = trim(eq + 1);
		if (*q == '"') {
			q++;
			eq = strchr(q, '"');
			if (eq) {
				*eq = 0;
				set_field(r, trim(t), q);
			} else {
				snprintf(vkey, sizeof vkey, "%s", trim(t));
				vbuf[0] = 0;
				if (!value_append(vbuf, sizeof vbuf, q)) {
					fprintf(stderr, "cloudpkg: %s:%d: value of %s is too large\n", path, lineno, vkey);
					ok = 0;
					break;
				}
			}
		} else {
			set_field(r, trim(t), q);
		}
	}
	if (ok && pname[0]) {
		fprintf(stderr, "cloudpkg: %s: unterminated function %s, missing closing brace\n", path, pname);
		ok = 0;
	}
	if (ok && vkey[0]) {
		fprintf(stderr, "cloudpkg: %s: unterminated quoted value of %s\n", path, vkey);
		ok = 0;
	}
	free(pbody);
	fclose(f);
	return ok;
}
static void expand_into(const char *in, const struct recipe *r, char *out, size_t n)
{
	static const char *keys[] = { "PACKAGE", "PN", "VERSION", "PV" };
	const char *vals[4];
	const char *p = in;
	size_t o = 0, k, kl, vl;
	int hit;
	vals[0] = r->name; vals[1] = r->name; vals[2] = r->version; vals[3] = r->version;
	while (*p && o + 1 < n) {
		hit = 0;
		if (*p == '$') {
			for (k = 0; k < 4 && !hit; k++) {
				kl = strlen(keys[k]);
				if (p[1] == '{' && !strncmp(p + 2, keys[k], kl) && p[2 + kl] == '}') {
					vl = strlen(vals[k]);
					if (o + vl + 1 >= n) break;
					memcpy(out + o, vals[k], vl);
					o += vl;
					p += kl + 3;
					hit = 1;
				} else if (!strncmp(p + 1, keys[k], kl) && !(isalnum((unsigned char)p[1 + kl]) || p[1 + kl] == '_')) {
					vl = strlen(vals[k]);
					if (o + vl + 1 >= n) break;
					memcpy(out + o, vals[k], vl);
					o += vl;
					p += kl + 1;
					hit = 1;
				}
			}
		}
		if (!hit) out[o++] = *p++;
	}
	out[o] = 0;
}
void recipe_expand(struct recipe *r)
{
	char tmp[2048];
	expand_into(r->src_uri, r, tmp, sizeof tmp);
	snprintf(r->src_uri, sizeof r->src_uri, "%s", tmp);
	expand_into(r->build_flags, r, tmp, sizeof tmp);
	snprintf(r->build_flags, sizeof r->build_flags, "%s", tmp);
	expand_into(r->depend, r, tmp, sizeof tmp);
	snprintf(r->depend, sizeof r->depend, "%s", tmp);
	expand_into(r->rdepend, r, tmp, sizeof tmp);
	snprintf(r->rdepend, sizeof r->rdepend, "%s", tmp);
}
int recipe_path(const char *cat, const char *name, const char *ver, char *out, size_t n)
{
	snprintf(out, n, "%s/%s/%s/%s-%s/%s-%s.cpr", repo, cat, name, name, ver, name, ver);
	return exists(out);
}
int recipe_best(const char *cat, const char *name, char *ver, size_t n)
{
	char dir[BUF], probe[BUF + 256], prefix[160];
	struct dirent **nl;
	int i, cnt, found = 0;
	size_t pl;
	snprintf(dir, sizeof dir, "%s/%s/%s", repo, cat, name);
	cnt = scandir(dir, &nl, NULL, alphasort);
	if (cnt < 0) return 0;
	snprintf(prefix, sizeof prefix, "%s-", name);
	pl = strlen(prefix);
	for (i = 0; i < cnt; i++) {
		if (nl[i]->d_name[0] != '.' && !strncmp(nl[i]->d_name, prefix, pl) && nl[i]->d_name[pl]) {
			snprintf(probe, sizeof probe, "%s/%s/%s-%s.cpr", dir, nl[i]->d_name, name, nl[i]->d_name + pl);
			if (exists(probe) && (!found || vercmp(nl[i]->d_name + pl, ver) > 0)) {
				snprintf(ver, n, "%s", nl[i]->d_name + pl);
				found = 1;
			}
		}
		free(nl[i]);
	}
	free(nl);
	return found;
}
int tree_categories(char ***out)
{
	static char **cache;
	static int ncache;
	static int loaded;
	struct dirent **nl;
	int i, cnt, n = 0;
	char p[BUF];
	*out = NULL;
	if (loaded) {
		for (i = 0; i < ncache; i++) list_add(out, &n, cache[i]);
		return n;
	}
	cnt = scandir(repo, &nl, NULL, alphasort);
	if (cnt < 0) return 0;
	for (i = 0; i < cnt; i++) {
		if (nl[i]->d_name[0] != '.' && strcmp(nl[i]->d_name, "metadata") && strcmp(nl[i]->d_name, "profiles")) {
			snprintf(p, sizeof p, "%s/%s", repo, nl[i]->d_name);
			if (is_dir(p)) {
				list_add(out, &n, nl[i]->d_name);
				list_add(&cache, &ncache, nl[i]->d_name);
			}
		}
		free(nl[i]);
	}
	free(nl);
	if (n > 0) loaded = 1;
	return n;
}
static int name_chars_ok(const char *s)
{
	if (!*s || *s == '-' || *s == '.' || strstr(s, "..")) return 0;
	for (; *s; s++)
		if (!(isalnum((unsigned char)*s) || *s == '.' || *s == '_' || *s == '+' || *s == '-')) return 0;
	return 1;
}
int resolve_name(const char *arg, char *cat, size_t cn, char *name, size_t nn, char *ver, size_t vn)
{
	char buf[512], probe[BUF + 256], *slash, *at;
	char **cats = NULL, **hits = NULL;
	int nc, nh = 0, i, ok;
	snprintf(buf, sizeof buf, "%s", arg);
	at = strchr(buf, '@');
	if (at) {
		*at = 0;
		snprintf(ver, vn, "%s", at + 1);
		if (!name_chars_ok(ver)) {
			fprintf(stderr, "cloudpkg: invalid version in %s\n", arg);
			return 0;
		}
	} else {
		ver[0] = 0;
	}
	slash = strchr(buf, '/');
	if (slash) {
		*slash = 0;
		if (!name_chars_ok(buf) || !name_chars_ok(slash + 1)) {
			fprintf(stderr, "cloudpkg: invalid package reference: %s\n", arg);
			return 0;
		}
		snprintf(cat, cn, "%s", buf);
		snprintf(name, nn, "%s", slash + 1);
		snprintf(buf, sizeof buf, "%s/%s/%s", repo, cat, name);
		if (!is_dir(buf)) {
			fprintf(stderr, "cloudpkg: no package %s/%s in the recipe tree\n", cat, name);
			return 0;
		}
	} else {
		if (!name_chars_ok(buf)) {
			fprintf(stderr, "cloudpkg: invalid package name: %s\n", arg);
			return 0;
		}
		snprintf(name, nn, "%s", buf);
		nc = tree_categories(&cats);
		for (i = 0; i < nc; i++) {
			snprintf(buf, sizeof buf, "%s/%s/%s", repo, cats[i], name);
			if (is_dir(buf)) list_add(&hits, &nh, cats[i]);
		}
		list_free(cats, nc);
		if (!nh) {
			fprintf(stderr, "cloudpkg: package not found in the recipe tree: %s\n", name);
			list_free(hits, nh);
			return 0;
		}
		if (nh > 1) {
			fprintf(stderr, "cloudpkg: ambiguous name %s, use category/name:", name);
			for (i = 0; i < nh; i++) fprintf(stderr, " %s/%s", hits[i], name);
			fputc('\n', stderr);
			list_free(hits, nh);
			return 0;
		}
		snprintf(cat, cn, "%s", hits[0]);
		list_free(hits, nh);
	}
	if (ver[0]) {
		ok = recipe_path(cat, name, ver, probe, sizeof probe);
		if (!ok) fprintf(stderr, "cloudpkg: no version %s of %s/%s in the recipe tree\n", ver, cat, name);
	} else {
		ok = recipe_best(cat, name, ver, vn);
		if (!ok) fprintf(stderr, "cloudpkg: no usable recipe versions for %s/%s\n", cat, name);
	}
	return ok;
}
static const char *map_category(const char *cat)
{
	static const char *pairs[][2] = {
		{ "sys-libs", "libs" }, { "dev-libs", "libs" }, { "media-libs", "libs" },
		{ "net-libs", "libs" }, { "dev-lang", "lang" }, { "dev-build", "build" },
		{ "sys-devel", "build" }, { "dev-util", "devel" }, { "dev-vcs", "vcs" },
		{ "dev-python", "python" }, { "dev-perl", "perl" }, { "dev-tcltk", "tcl" },
		{ "sys-apps", "admin" }, { "app-admin", "admin" }, { "sys-process", "admin" },
		{ "app-editors", "editors" }, { "app-shells", "shells" }, { "app-arch", "archivers" },
		{ "app-crypt", "crypto" }, { "app-misc", "misc" }, { "app-text", "text" },
		{ "app-backup", "backup" }, { "app-doc", "docs" }, { "net-misc", "tools" },
		{ "net-analyzer", "forensics" }, { "sys-fs", "tools" }, { "sys-boot", "tools" },
		{ "sys-cluster", "tools" }, { "net-firewall", "crypto" }, { "sci-libs", "libs" },
		{ "x11-libs", "libs" }, { "media-gfx", "misc" },
		{ NULL, NULL }
	};
	int i;
	for (i = 0; pairs[i][0]; i++)
		if (!strcmp(pairs[i][0], cat)) return pairs[i][1];
	return cat;
}
int resolve_dep(const char *token, char *cat, size_t cn, char *name, size_t nn, char *ver, size_t vn)
{
	char buf[512], *slash;
	snprintf(buf, sizeof buf, "%s", token);
	slash = strchr(buf, '/');
	if (slash) {
		*slash = 0;
		snprintf(cat, cn, "%s", map_category(buf));
		snprintf(name, nn, "%s", slash + 1);
		snprintf(buf, sizeof buf, "%s/%s/%s", repo, cat, name);
		if (is_dir(buf) && recipe_best(cat, name, ver, vn)) return 1;
		return resolve_name(name, cat, cn, name, nn, ver, vn);
	}
	snprintf(name, nn, "%s", buf);
	return resolve_name(buf, cat, cn, name, nn, ver, vn);
}
void dep_split(const char *deps, char ***out, int *n)
{
	char buf[2048], *tok, *save = NULL, *p, *slash, *dash;
	char clean[256];
	snprintf(buf, sizeof buf, "%s", deps);
	for (tok = strtok_r(buf, " \t\n", &save); tok; tok = strtok_r(NULL, " \t\n", &save)) {
		if (*tok == '!') {
			fprintf(stderr, "cloudpkg: blocker dependencies are not supported, skipped: %s\n", tok);
			continue;
		}
		if (!strcmp(tok, "||") || !strcmp(tok, "(") || !strcmp(tok, ")")) continue;
		p = tok;
		while (*p == '>' || *p == '<' || *p == '=' || *p == '~') p++;
		snprintf(clean, sizeof clean, "%s", p);
		p = strchr(clean, '[');
		if (p) *p = 0;
		slash = strchr(clean, '/');
		p = slash ? slash + 1 : clean;
		if (!*p || *p == '*') continue;
		for (dash = p; *dash; dash++) {
			if (*dash == '-' && dash[1] >= '0' && dash[1] <= '9') {
				*dash = 0;
				break;
			}
		}
		if (strstr(clean, "${") || strchr(clean, '?')) continue;
		if (!list_has(*out, *n, clean)) list_add(out, n, clean);
	}
}
int ensure_tree(void)
{
	char **cats = NULL;
	int n;
	if (exists(repo)) {
		n = tree_categories(&cats);
		list_free(cats, n);
		if (n > 0) return 1;
	}
	if (geteuid() != 0) {
		fputs("cloudpkg: recipe tree is missing, run as root: cloudpkg sync\n", stderr);
		return 0;
	}
	puts("cloudpkg: recipe tree is missing, downloading it now");
	return cmd_sync() == 0;
}
