#include "cloudpkg.h"
#define VERSION "2.2.0"
const char *cp_version = VERSION;
void usage(void)
{
	puts("cloudpkg " VERSION " (standalone source package manager for CloudOS)\n"
	     "usage: cloudpkg command [options]\n\n"
	     "  sync                           download the recipe tree (cloudpkg-recipes)\n"
	     "  update [--force] [--unsigned]  update cloudpkg itself from GitHub releases\n"
	     "  fix                            recreate directories, fetch recipes, run doctor\n"
	     "  install [-p] [-a] [-o] [--jobs N] [--force] package...\n"
	     "  remove  [-p] [-a] [--force] package...\n"
	     "  upgrade [-p] [-a] [--jobs N] [--no-snapshot]\n"
	     "  clean   [-p] [-a]\n"
	     "  search  term\n"
	     "  info    package\n"
	     "  list\n"
	     "  files   package\n"
	     "  owns    path\n"
	     "  doctor\n"
	     "  snapshot [label]\n"
	     "  snapshots\n"
	     "  snapshot-rm name\n"
	     "  rollback [-y] [name]\n"
	     "  version, help\n\n"
	     "package forms: name, category/name, name@version\n"
	     "-p dry run, -a ask before changes, -o keep the package out of the world set,\n"
	     "--jobs N parallel build jobs, --force overwrite conflicts and ignore reverse dependencies.\n"
	     "packages are built from source and tracked in " DBDIR ".\n"
	     "snapshots are btrfs filesystem snapshots for rollback, not Ubuntu Snap packages.");
}
static int args_pretend(int argc, char **argv)
{
	int i;
	for (i = 0; i < argc; i++)
		if (!strcmp(argv[i], "-p") || !strcmp(argv[i], "--pretend")) return 1;
	return 0;
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
	if (!acquire_lock()) return 1;
	if (!strcmp(c, "version") || !strcmp(c, "--version")) {
		puts("cloudpkg " VERSION);
		r = 0;
	} else if (!strcmp(c, "help") || !strcmp(c, "--help") || !strcmp(c, "-h")) {
		usage();
		r = 0;
	} else if (!strcmp(c, "update")) {
		r = host_ok() ? cmd_update(argc - 2, argv + 2) : 1;
	} else if (!strcmp(c, "fix")) {
		r = host_ok() ? cmd_fix() : 1;
	} else if (!strcmp(c, "sync")) {
		r = host_ok() ? cmd_sync() : 1;
	} else if (!strcmp(c, "install")) {
		r = (host_ok() || args_pretend(argc - 2, argv + 2)) ? cmd_install(argc - 2, argv + 2) : 1;
	} else if (!strcmp(c, "remove")) {
		r = (host_ok() || args_pretend(argc - 2, argv + 2)) ? cmd_remove(argc - 2, argv + 2) : 1;
	} else if (!strcmp(c, "upgrade")) {
		r = (host_ok() || args_pretend(argc - 2, argv + 2)) ? cmd_upgrade(argc - 2, argv + 2) : 1;
	} else if (!strcmp(c, "snapshot")) {
		r = cmd_snapshot(argc - 2, argv + 2);
	} else if (!strcmp(c, "snapshots")) {
		r = cmd_snapshots();
	} else if (!strcmp(c, "snapshot-rm")) {
		r = cmd_snapshot_rm(argc - 2, argv + 2);
	} else if (!strcmp(c, "rollback")) {
		r = cmd_rollback(argc - 2, argv + 2);
	} else if (!strcmp(c, "clean")) {
		r = (host_ok() || args_pretend(argc - 2, argv + 2)) ? cmd_clean(argc - 2, argv + 2) : 1;
	} else if (!strcmp(c, "search")) {
		r = cmd_search(argc - 2, argv + 2);
	} else if (!strcmp(c, "info")) {
		r = cmd_info(argc - 2, argv + 2);
	} else if (!strcmp(c, "list")) {
		r = cmd_list();
	} else if (!strcmp(c, "files")) {
		r = cmd_files(argc - 2, argv + 2);
	} else if (!strcmp(c, "owns")) {
		r = cmd_owns(argc - 2, argv + 2);
	} else if (!strcmp(c, "doctor")) {
		r = cmd_doctor();
	} else {
		fprintf(stderr, "cloudpkg: unknown command: %s\n", c);
		usage();
	}
	release_lock();
	return r;
}
