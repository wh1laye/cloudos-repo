#include "cloudpkg.h"

#define VERSION "1.2.0"
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
	int r = 1;

	if (argc < 2) {
		usage();
		return 1;
	}
	c = argv[1];
	loadconf();
	if (!acquire_lock())
		return 1;
	if (!strcmp(c, "version") || !strcmp(c, "--version")) {
		puts("cloudpkg " VERSION);
		r = 0;
	} else if (!strcmp(c, "help") || !strcmp(c, "--help") || !strcmp(c, "-h")) {
		usage();
		r = 0;
	} else if (!strcmp(c, "update")) {
		r = host_ok() ? cmd_update(argc - 2, argv + 2) : 1;
	} else if (!strcmp(c, "fix")) {
		r = host_ok() ? cmd_fix(argc - 2, argv + 2) : 1;
	} else if (!strcmp(c, "sync")) {
		r = host_ok() ? cmd_sync() : 1;
	} else if (!strcmp(c, "install")) {
		r = host_ok() ? cmd_install(argc - 2, argv + 2) : 1;
	} else if (!strcmp(c, "remove")) {
		r = host_ok() ? cmd_remove(argc - 2, argv + 2) : 1;
	} else if (!strcmp(c, "upgrade")) {
		r = host_ok() ? cmd_upgrade(argc - 2, argv + 2) : 1;
	} else if (!strcmp(c, "snapshot")) {
		r = cmd_snapshot(argc - 2, argv + 2);
	} else if (!strcmp(c, "snapshots")) {
		r = cmd_snapshots();
	} else if (!strcmp(c, "snapshot-rm")) {
		r = cmd_snapshot_rm(argc - 2, argv + 2);
	} else if (!strcmp(c, "rollback")) {
		r = cmd_rollback(argc - 2, argv + 2);
	} else if (!strcmp(c, "clean")) {
		r = host_ok() ? cmd_clean(argc - 2, argv + 2) : 1;
	} else if (!strcmp(c, "search")) {
		r = cmd_search(argc - 2, argv + 2);
	} else if (!strcmp(c, "info")) {
		r = cmd_info(argc - 2, argv + 2);
	} else if (!strcmp(c, "list")) {
		r = cmd_list();
	} else if (!strcmp(c, "doctor")) {
		r = cmd_doctor();
	} else if (!strcmp(c, "vdb")) {
		r = host_ok() ? cmd_vdb() : 1;
	} else {
		fprintf(stderr, "cloudpkg: неизвестная команда %s\n", c);
		usage();
	}
	release_lock();
	return r;
}
