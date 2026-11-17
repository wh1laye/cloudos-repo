#ifndef CLOUDPKG_H
#define CLOUDPKG_H
#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <errno.h>
#include <time.h>
#include <dirent.h>
#include <fcntl.h>
#include <ctype.h>
#include <sys/stat.h>
#include <sys/file.h>
#include <sys/wait.h>
#ifndef CONF
#define CONF "/etc/cloudpkg/cloudpkg.conf"
#endif
#ifndef LOCKFILE
#define LOCKFILE "/tmp/cloudpkg.lock"
#endif
#ifndef DBDIR
#define DBDIR "/var/db/cloudpkg"
#endif
#ifndef PUBKEY
#define PUBKEY "/etc/cloudpkg/cloudos.pub"
#endif
#define INSTALLED DBDIR "/installed"
#define WORLD DBDIR "/world"
#define UPD_REPO "wh1laye/cloudos-repo"
#define UPD_BRANCH "main"
#define UPD_TAG "cloudpkg-latest"
#define UPD_ASSET "cloudpkg-src.tar.gz"
#define RECIPES_URL "https://codeload.github.com/wh1laye/cloudpkg-recipes/tar.gz/refs/heads/master"
#define MAXPLAN 512
#define MAXPHASE 65536
#define BUF 1024
struct phase { char name[32]; char *body; };
struct recipe {
	char category[128]; char name[128]; char version[64];
	char description[512]; char homepage[256]; char license[128]; char slot[32];
	char src_uri[2048]; char depend[1024]; char rdepend[1024]; char build_flags[512];
	char dir[BUF]; struct phase phases[8]; int nphases;
};
struct db_pkg { char category[128]; char name[128]; char version[64]; int explicit; };
extern const char *cp_version;
extern char repo[256]; extern char distdir[256]; extern char workdir[256]; extern char recipes_url[512];
extern int jobs; extern int keep_workdir; extern int allow_host; extern int sn_keep; extern int lock_fd;
int acquire_lock(void); void release_lock(void);
void *xcalloc(size_t n, size_t m); void *xrealloc(void *p, size_t n); char *xstrdup(const char *s);
int run(char *const av[]); int capture(char *const av[], char *out, size_t n);
char *trim(char *s); int exists(const char *p); int is_dir(const char *p);
int mkdirs(const char *path); int safe_dir(const char *p); void rm_tree(const char *path);
void loadconf(void); void osid(char *out, size_t n); int host_allowed(char *id, size_t n);
int host_ok(void); int need_root(void); int have(const char *cmd);
int fetch(const char *url, const char *out); int vercmp(const char *a, const char *b);
void list_add(char ***v, int *n, const char *s); void list_free(char **v, int n); int list_has(char **v, int n, const char *s);
void recipe_init(struct recipe *r); void recipe_free(struct recipe *r);
int recipe_load(const char *path, struct recipe *r); const char *recipe_phase(const struct recipe *r, const char *name);
void recipe_expand(struct recipe *r);
int recipe_path(const char *cat, const char *name, const char *ver, char *out, size_t n);
int recipe_best(const char *cat, const char *name, char *ver, size_t n);
int tree_categories(char ***out);
int resolve_name(const char *arg, char *cat, size_t cn, char *name, size_t nn, char *ver, size_t vn);
int resolve_dep(const char *token, char *cat, size_t cn, char *name, size_t nn, char *ver, size_t vn);
void dep_split(const char *deps, char ***out, int *n); int ensure_tree(void);
int db_installed_version(const char *cat, const char *name, char *ver, size_t n);
int db_find_installed(const char *name, char *cat, size_t cn, char *ver, size_t vn);
int db_all(struct db_pkg **out);
int db_record(const struct recipe *r, char **files, int nf, char **dirs, int nd, int explicit);
int db_remove(const char *cat, const char *name, const char *ver, char **keep, int nkeep);
int db_reverse_deps(const char *name, char ***out);
char **db_read_list(const char *path, int *n);
int db_explicit(const char *cat, const char *name, const char *ver);
int world_has(const char *cat, const char *name); void world_add(const char *cat, const char *name); void world_del(const char *cat, const char *name);
int pkg_build_install(const char *cat, const char *name, const char *ver, int explicit, int force);
void ownership_free(void);
const char *pkg_owner_of(const char *relpath);
int cmd_sync(void); int cmd_install(int argc, char **argv); int cmd_remove(int argc, char **argv);
int cmd_upgrade(int argc, char **argv); int cmd_clean(int argc, char **argv);
int cmd_search(int argc, char **argv); int cmd_info(int argc, char **argv); int cmd_list(void);
int cmd_files(int argc, char **argv); int cmd_owns(int argc, char **argv);
int cmd_doctor(void); int cmd_fix(void);
int root_btrfs(char *dev, size_t n); int sn_is_name(const char *s); int sn_label_ok(const char *s);
int top_mount(void); void top_umount(void); int sn_names(const char *dir, char ***out);
void sn_prune(const char *dir); void sn_stamp(char *out, size_t n, int full);
int sn_create(const char *label); int sn_auto(void); int sn_list(void);
int sn_remove(const char *name); int sn_rollback(const char *name);
int cmd_snapshot(int argc, char **argv); int cmd_snapshots(void); int cmd_snapshot_rm(int argc, char **argv); int cmd_rollback(int argc, char **argv);
int safe_id(const char *s); int ver_ok(const char *s); int remote_ver(const char *dir, char *out, size_t n);
int verify_sig(const char *file, const char *sig); int cmd_update(int argc, char **argv); void usage(void);
#endif
