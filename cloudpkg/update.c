#include "cloudpkg.h"

int safe_id(const char *s)
{
	if (!*s)
		return 0;
	for (; *s; s++)
		if (!((*s >= 'a' && *s <= 'z') || (*s >= 'A' && *s <= 'Z') || (*s >= '0' && *s <= '9') || *s == '.' || *s == '_' || *s == '-' || *s == '/'))
			return 0;
	return 1;
}

int ver_ok(const char *s)
{
	return *s >= '0' && *s <= '9' && strspn(s, "0123456789.") == strlen(s) && s[strlen(s) - 1] != '.';
}

int vercmp(const char *a, const char *b)
{
	long x, y;
	char *e;

	while (*a || *b) {
		x = strtol(a, &e, 10);
		a = e;
		y = strtol(b, &e, 10);
		b = e;
		if (x != y)
			return x < y ? -1 : 1;
		if (*a == '.')
			a++;
		if (*b == '.')
			b++;
	}
	return 0;
}

int remote_ver(const char *dir, char *out, size_t n)
{
	char p[BUF], line[BUF], *s, *e;
	FILE *f;
	int ok = 0;

	snprintf(p, sizeof p, "%s/cloudpkg.c", dir);
	f = fopen(p, "r");
	if (!f)
		return 0;
	while (fgets(line, sizeof line, f)) {
		if (strncmp(line, "#define VERSION \"", 17))
			continue;
		s = line + 17;
		e = strchr(s, '"');
		if (e && e > s && (size_t)(e - s) < n) {
			*e = 0;
			if (ver_ok(s)) {
				memcpy(out, s, strlen(s) + 1);
				ok = 1;
			}
		}
		break;
	}
	fclose(f);
	return ok;
}

int verify_sig(const char *file, const char *sig)
{
	char *a[10];

	if (!have("minisign")) {
		fprintf(stderr, "cloudpkg: для проверки подписи нужен minisign: cloudpkg install app-crypt/minisign\n");
		return 0;
	}
	if (access(PUBKEY, R_OK) != 0) {
		fprintf(stderr, "cloudpkg: нет публичного ключа %s\n", PUBKEY);
		return 0;
	}
	a[0] = "minisign"; a[1] = "-V"; a[2] = "-q"; a[3] = "-p"; a[4] = PUBKEY;
	a[5] = "-x"; a[6] = (char *)sig; a[7] = "-m"; a[8] = (char *)file; a[9] = NULL;
	return run(a) == 0;
}

int cmd_update(int argc, char **argv)
{
	char tmp[] = "/var/tmp/cloudpkg-upd.XXXXXX";
	char url[BUF], tgz[BUF], me[BUF], neu[BUF + 8], bak[BUF + 8], rv[32], bin[BUF];
	const char *repo_id = getenv("CLOUDPKG_REPO"), *br = getenv("CLOUDPKG_BRANCH");
	char *a[12];
	ssize_t l;
	int force = 0, unsigned_ok = 0, i, r = 1, newer;
	char sigf[BUF], surl[BUF + 16];

	for (i = 0; i < argc; i++) {
		if (!strcmp(argv[i], "--force") || !strcmp(argv[i], "-f"))
			force = 1;
		else if (!strcmp(argv[i], "--unsigned"))
			unsigned_ok = 1;
		else {
			fprintf(stderr, "cloudpkg: update [--force] [--unsigned]\n");
			return 1;
		}
	}
	if (!repo_id || !*repo_id)
		repo_id = UPD_REPO;
	if (!br || !*br)
		br = UPD_BRANCH;
	if (!safe_id(repo_id) || !safe_id(br) || strstr(repo_id, "..") || strstr(br, "..")) {
		fprintf(stderr, "cloudpkg: плохое имя репозитория или ветки\n");
		return 1;
	}
	if (!need_root())
		return 1;
	for (i = 0; i < 4; i++) {
		static const char *need[] = {"curl", "tar", "make", "gcc"};
		if (!have(need[i])) {
			fprintf(stderr, "cloudpkg: для update нужен %s\n", need[i]);
			return 1;
		}
	}
	l = readlink("/proc/self/exe", me, sizeof me - 8);
	if (l <= 0 || me[0] != '/') {
		fprintf(stderr, "cloudpkg: не удалось определить путь к себе\n");
		return 1;
	}
	me[l] = 0;
	if (!mkdtemp(tmp)) {
		perror("cloudpkg: mkdtemp");
		return 1;
	}
	snprintf(tgz, sizeof tgz, "%s/src.tar.gz", tmp);
	if (unsigned_ok) {
		fprintf(stderr, "cloudpkg: внимание, подпись не проверяется (--unsigned)\n");
		snprintf(url, sizeof url, "https://codeload.github.com/%s/tar.gz/refs/heads/%s", repo_id, br);
	} else {
		snprintf(url, sizeof url, "https://github.com/%s/releases/download/%s/%s", repo_id, UPD_TAG, UPD_ASSET);
		snprintf(surl, sizeof surl, "%s.minisig", url);
		snprintf(sigf, sizeof sigf, "%s/src.tar.gz.minisig", tmp);
	}
	printf("cloudpkg: проверяю %s (%s)\n", repo_id, unsigned_ok ? br : UPD_TAG);
	if (fetch(url, tgz) != 0) {
		fprintf(stderr, "cloudpkg: не удалось скачать репозиторий\n");
		goto out;
	}
	if (!unsigned_ok) {
		if (fetch(surl, sigf) != 0) {
			fprintf(stderr, "cloudpkg: не удалось скачать подпись\n");
			goto out;
		}
		if (!verify_sig(tgz, sigf)) {
			fprintf(stderr, "cloudpkg: подпись не подошла, обновление отменено\n");
			goto out;
		}
		printf("cloudpkg: подпись minisign проверена\n");
	}
	a[0] = "tar"; a[1] = "xzf"; a[2] = tgz; a[3] = "--strip-components=2"; a[4] = "--no-same-owner";
	a[5] = "-C"; a[6] = tmp; a[7] = "--wildcards"; a[8] = "*/cloudpkg/*"; a[9] = NULL;
	if (run(a) != 0 || !remote_ver(tmp, rv, sizeof rv)) {
		fprintf(stderr, "cloudpkg: в репозитории нет корректной папки cloudpkg\n");
		goto out;
	}
	newer = vercmp(rv, cp_version) > 0;
	if (vercmp(rv, cp_version) < 0 && !force) {
		printf("cloudpkg: в репозитории %s, ниже установленной %s, пропускаю (--force заменит)\n", rv, cp_version);
	} else if (!newer && !force) {
		printf("cloudpkg: пакетник уже последний (%s)\n", cp_version);
	} else {
		printf("cloudpkg: обновляю %s -> %s\n", cp_version, rv);
		a[0] = "make"; a[1] = "-C"; a[2] = tmp; a[3] = "cloudpkg"; a[4] = NULL;
		if (run(a) != 0) {
			fprintf(stderr, "cloudpkg: новая версия не собралась, оставляю текущую\n");
			goto out;
		}
		snprintf(bin, sizeof bin, "%s/cloudpkg", tmp);
		a[0] = bin; a[1] = "version"; a[2] = NULL;
		if (run(a) != 0) {
			fprintf(stderr, "cloudpkg: новая версия не запускается, оставляю текущую\n");
			goto out;
		}
		snprintf(neu, sizeof neu, "%s.new", me);
		snprintf(bak, sizeof bak, "%s.bak", me);
		a[0] = "install"; a[1] = "-m755"; a[2] = bin; a[3] = neu; a[4] = NULL;
		if (run(a) != 0) {
			fprintf(stderr, "cloudpkg: не удалось записать %s\n", neu);
			goto out;
		}
		a[0] = "cp"; a[1] = "-p"; a[2] = me; a[3] = bak; a[4] = NULL;
		run(a);
		if (rename(neu, me) != 0) {
			perror("cloudpkg: rename");
			unlink(neu);
			goto out;
		}
		printf("cloudpkg: пакетник обновлён до %s, старый лежит в %s\n", rv, bak);
	}
	a[0] = "make"; a[1] = "-C"; a[2] = tmp; a[3] = "overlay"; a[4] = NULL;
	if (exists("/var/db/repos")) {
		if (run(a) == 0)
			printf("cloudpkg: рецепты cloudos обновлены\n");
		else
			fprintf(stderr, "cloudpkg: рецепты cloudos не обновились\n");
	}
	a[3] = "conf";
	run(a);
	r = 0;
out:
	a[0] = "rm"; a[1] = "-rf"; a[2] = tmp; a[3] = NULL;
	run(a);
	return r;
}
