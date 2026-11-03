#include "cloudpkg.h"

#define VERSION "1.0"
const char *cp_version = VERSION;

int cmd_fix(int argc, char **argv)
{
	char *a[8];
	int r = 0;

	if (!need_root())
		return 1;
	printf("cloudpkg: чиню окружение\n");
	heal();
	if (!getpwnam("portage")) {
		printf("cloudpkg: создаю пользователя portage\n");
		a[0] = "groupadd"; a[1] = "-r"; a[2] = "portage"; a[3] = NULL;
		run(a);
		char *u[10] = {"useradd", "-r", "-g", "portage", "-d", "/var/tmp/portage", "-s", "/sbin/nologin", "portage", NULL};
		run(u);
	}
	if (!ensure_tree())
		r = 1;
	ensure_profile();
	if (have("emaint")) {
		a[0] = "emaint"; a[1] = "--fix"; a[2] = "cleanresume"; a[3] = NULL;
		run(a);
		a[2] = "world";
		run(a);
	}
	if (argc > 0)
		r |= cmd_install(argc, argv);
	r |= cmd_doctor();
	return r;
}

void usage(void)
{
	puts("cloudpkg " VERSION " (обёртка над portage)\n"
	     "использование: cloudpkg команда [параметры]\n\n"
	     "  sync                  обновить дерево рецептов (снимок gentoo)\n"
	     "  update [--force] [--unsigned]  обновить сам cloudpkg и рецепты cloudos из репозитория\n"
	     "  fix [пакеты]          починить окружение portage, при пакетах поставить их\n"
	     "  install [-p] [-a] [-o] [-t] пакет...   установить из исходников\n"
	     "  remove  [-p] [-a] пакет...  удалить\n"
	     "  upgrade [-p] [-a] [--no-snapshot]  обновить все пакеты (на btrfs сначала снимок)\n"
	     "  snapshot [метка]      снимок корня btrfs\n"
	     "  snapshots             список снимков\n"
	     "  snapshot-rm имя       удалить снимок\n"
	     "  rollback [-y] [имя]   загрузиться из снимка (последнего, если имя не задано)\n"
	     "  clean   [-p]          удалить лишние пакеты и очистить кеш\n"
	     "  search  строка        найти пакет\n"
	     "  info    пакет         показать, что будет установлено\n"
	     "  list                  список установленных пакетов\n"
	     "  doctor                проверить настройку\n"
	     "  vdb                   записать autotools из lfs в базу установленных\n"
	     "  version, help\n\n"
	     "-p пробный запуск, -a спросить перед установкой, -o не добавлять в world,\n"
	     "-t разрешить testing (~amd64), --safe без авто-повторов и снятия масок. остальные параметры с дефисом уходят в emerge.");
}

int main(int argc, char **argv)
{
	const char *c;

	if (argc < 2) {
		usage();
		return 1;
	}
	c = argv[1];
	loadconf();
	if (!strcmp(c, "update"))
		return host_ok() ? cmd_update(argc - 2, argv + 2) : 1;
	if (!strcmp(c, "fix"))
		return host_ok() ? cmd_fix(argc - 2, argv + 2) : 1;
	if (!strcmp(c, "sync"))
		return host_ok() ? cmd_sync() : 1;
	if (!strcmp(c, "install"))
		return host_ok() ? cmd_install(argc - 2, argv + 2) : 1;
	if (!strcmp(c, "remove"))
		return host_ok() ? cmd_remove(argc - 2, argv + 2) : 1;
	if (!strcmp(c, "upgrade"))
		return host_ok() ? cmd_upgrade(argc - 2, argv + 2) : 1;
	if (!strcmp(c, "snapshot"))
		return cmd_snapshot(argc - 2, argv + 2);
	if (!strcmp(c, "snapshots"))
		return cmd_snapshots();
	if (!strcmp(c, "snapshot-rm"))
		return cmd_snapshot_rm(argc - 2, argv + 2);
	if (!strcmp(c, "rollback"))
		return cmd_rollback(argc - 2, argv + 2);
	if (!strcmp(c, "clean"))
		return host_ok() ? cmd_clean(argc - 2, argv + 2) : 1;
	if (!strcmp(c, "search"))
		return cmd_search(argc - 2, argv + 2);
	if (!strcmp(c, "info"))
		return cmd_info(argc - 2, argv + 2);
	if (!strcmp(c, "list"))
		return cmd_list();
	if (!strcmp(c, "doctor"))
		return cmd_doctor();
	if (!strcmp(c, "vdb"))
		return host_ok() ? cmd_vdb() : 1;
	if (!strcmp(c, "version") || !strcmp(c, "--version")) {
		puts("cloudpkg " VERSION);
		return 0;
	}
	if (!strcmp(c, "help") || !strcmp(c, "--help") || !strcmp(c, "-h")) {
		usage();
		return 0;
	}
	fprintf(stderr, "cloudpkg: неизвестная команда %s\n", c);
	usage();
	return 1;
}
