#include "cloudpkg.h"

int cmd_upgrade(int argc, char **argv)
{
	char **pre, **pk;
	int npre = 0, npk = 0, r, nosn = 0, i, j;

	for (i = 0, j = 0; i < argc; i++) {
		if (!strcmp(argv[i], "--no-snapshot"))
			nosn = 1;
		else
			argv[j++] = argv[i];
	}
	argc = j;
	pre = xcalloc((size_t)(argc + 12), sizeof *pre);
	pk = xcalloc((size_t)(argc + 2), sizeof *pk);

	pre[npre++] = "--update";
	pre[npre++] = "--deep";
	pre[npre++] = "--newuse";
	pre[npre++] = "--verbose";
	pre[npre++] = "--autounmask=y";
	pre[npre++] = "--autounmask-continue";
	pre[npre++] = "--autounmask-keep-masks";
	parse(argc, argv, pre, &npre, pk, &npk);
	npk = 0;
	
	pk[npk++] = "@selected";
	if (!need_root())
		r = 1;
	else if (!ensure_tree())
		r = 1;
	else {
		ensure_profile();
		if (!nosn && sn_keep > 0 && !has_flag(pre, npre, "--pretend") && sn_auto())
			r = 1;
		else
			r = emerge_smart(pre, npre, pk, npk);
	}
	free(pre);
	free(pk);
	return r;
}

int cmd_clean(int argc, char **argv)
{
	char *pre[4];
	char *a[8];
	int npre = 0, i, pretend = 0, r;

	pre[npre++] = "--depclean";
	for (i = 0; i < argc; i++)
		if (!strcmp(argv[i], "-p") || !strcmp(argv[i], "--pretend"))
			pretend = 1;
	if (pretend)
		pre[npre++] = "--pretend";
	if (!need_root())
		return 1;
	r = emerge(pre, npre, NULL, 0);
	heal_vdb();
	if (pretend)
		return r;
	a[0] = "find"; a[1] = dist; a[2] = "-mindepth"; a[3] = "1"; a[4] = "-delete"; a[5] = NULL;
	run(a);
	a[0] = "find"; a[1] = "/var/tmp/portage"; a[2] = "-mindepth"; a[3] = "1"; a[4] = "-delete"; a[5] = NULL;
	run(a);
	printf("cloudpkg: кеш исходников и временные файлы очищены\n");
	return r;
}

int cmd_search(int argc, char **argv)
{
	char *pre[2];

	if (!argc) {
		fprintf(stderr, "cloudpkg: укажи строку поиска\n");
		return 1;
	}
	pre[0] = "--search";
	if (!ensure_tree())
		return 1;
	return emerge(pre, 1, argv, argc);
}

int cmd_info(int argc, char **argv)
{
	char *pre[4];

	if (!argc) {
		fprintf(stderr, "cloudpkg: укажи пакет\n");
		return 1;
	}
	pre[0] = "--pretend";
	pre[1] = "--verbose";
	pre[2] = "--nodeps";
	if (!ensure_tree())
		return 1;
	argv[0] = resolve(argv[0]);
	return emerge(pre, 3, argv, argc);
}

int cmd_list(void)
{
	struct dirent **cats, **pkgs;
	char path[BUF];
	int nc, np, i, j;

	nc = scandir("/var/db/pkg", &cats, NULL, alphasort);
	if (nc < 0) {
		fprintf(stderr, "cloudpkg: нет /var/db/pkg\n");
		return 1;
	}
	for (i = 0; i < nc; i++) {
		if (cats[i]->d_name[0] == '.') {
			free(cats[i]);
			continue;
		}
		snprintf(path, sizeof path, "/var/db/pkg/%s", cats[i]->d_name);
		np = scandir(path, &pkgs, NULL, alphasort);
		for (j = 0; j < np; j++) {
			if (pkgs[j]->d_name[0] != '.')
				printf("%s/%s\n", cats[i]->d_name, pkgs[j]->d_name);
			free(pkgs[j]);
		}
		if (np >= 0)
			free(pkgs);
		free(cats[i]);
	}
	free(cats);
	return 0;
}

void row(const char *name, const char *val)
{
	int w = 0;
	const char *s;

	for (s = name; *s; s++)
		if (((unsigned char)*s & 0xC0) != 0x80)
			w++;
	printf("%s%*s %s\n", name, w < 28 ? 28 - w : 0, "", val);
}

int check(const char *name, int ok)
{
	row(name, ok ? "ok" : "НЕТ");
	return ok;
}

int cmd_doctor(void)
{
	char p[BUF], id[64];
	int bad = 0;

	osid(id, sizeof id);
	row("система (ID)", id);
	bad += !check("можно ставить в /", host_allowed(id, sizeof id));
	bad += !check("emerge в PATH", have("emerge"));
	bad += !check("пользователь portage", getpwnam("portage") != NULL);
	snprintf(p, sizeof p, "%s/profiles", repo);
	bad += !check("дерево рецептов", exists(p));
	bad += !check("make.conf", exists("/etc/portage/make.conf"));
	bad += !check("профиль (make.profile)", exists("/etc/portage/make.profile"));
	bad += !check("package.provided", exists("/etc/portage/profile/package.provided"));
	bad += !check("хуки и синтаксис /etc/portage/env", env_scan(ENVDIR, 0, 0) == 0);
	bad += !check("package.env без cloudos-noreconf", penv_clean(0) == 0);
	bad += !check("autotools в базе установленных", vdb_ok());
	bad += !check("gpg (подпись снимка дерева)", have("gpg"));
	bad += !check("curl", have("curl"));
	bad += !check("tar", have("tar"));
	bad += !check("xz", have("xz"));
	printf("%s\n", bad ? "есть проблемы" : "всё в порядке");
	return bad ? 1 : 0;
}
