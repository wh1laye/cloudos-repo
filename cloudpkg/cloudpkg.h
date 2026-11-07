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
#include <ftw.h>
#include <fcntl.h>
#include <pwd.h>
#include <sys/stat.h>
#include <sys/wait.h>

#ifndef CONF
#define CONF "/etc/cloudpkg/cloudpkg.conf"
#endif
#define UPD_REPO "wh1laye/cloudos-repo"
#define UPD_BRANCH "main"
#define UPD_TAG "cloudpkg-latest"
#define UPD_ASSET "cloudpkg-src.tar.gz"
#ifndef PUBKEY
#define PUBKEY "/etc/cloudpkg/cloudos.pub"
#endif
#define INSTALL_URL "https://raw.githubusercontent.com/wh1laye/cloudos-repo/main/cloudpkg/install.sh"
#define OVERLAY "/var/db/repos/cloudos"
#define MAXM 16
#define BUF 600
#ifndef ENVDIR
#define ENVDIR "/etc/portage/env"
#endif
#ifndef PENV
#define PENV "/etc/portage/package.env"
#endif
#ifndef VDB
#define VDB "/var/db/pkg"
#endif
#define NOHOOK "cloudos-noreconf"
#ifndef SNAP_FPRS
#define SNAP_FPRS "DCD05B71EAB94199527F44ACDB6B8C1F96D8BF6D"
#endif
#ifndef GENTOO_KEYS
#define GENTOO_KEYS "/usr/share/openpgp-keys/gentoo-release.asc"
#endif
#ifndef KEYSERVER
#define KEYSERVER "hkps://keys.gentoo.org"
#endif


extern const char *cp_version;
extern char *mirrors[MAXM];
extern int nmir;
extern char *falls[MAXM];
extern int nfall;
extern char repo[256];
extern char snap[160];
extern char dist[256];
extern char prof[160];
extern int allow_host;
extern int unsigned_fb;
extern int safe_mode;
extern int sn_keep;

void *xcalloc(size_t n, size_t m);
char *xstrdup(const char *s);
int run(char *const av[]);
char *trim(char *s);
int safe_dir(const char *p);
void loadconf(void);
void osid(char *out, size_t n);
int host_allowed(char *id, size_t n);
int host_ok(void);
int need_root(void);
int exists(const char *p);
int have(const char *cmd);
void mkparent(const char *path);
int fetch(const char *url, const char *out);
int env_bad(const char *p);
int file_has(const char *p, const char *needle);
int env_is_legacy(const char *name, const char *p);
int env_scan(const char *dir, int fix, int depth);
int penv_file(const char *p, int fix);
int penv_clean(int fix);
int probe_ver(const char *cmd, char *ver, size_t n);
int vdb_has(const char *name);
void put(const char *dir, const char *name, const char *val);
void heal_vdb(void);
int vdb_ok(void);
void heal(void);
int cmd_vdb(void);
int ensure_tree(void);
int is_dir(const char *p);
char *resolve(char *name);
int show_tail(const char *path, const char *needle);
void fail_hint(time_t t0);
int need_portage(void);
int emerge(char **pre, int npre, char **pk, int npk);
void parse(int argc, char **argv, char **pre, int *npre, char **pk, int *npk);
void ensure_profile(void);
int cmd_sync(void);
int has_flag(char **pre, int npre, const char *f);
int emerge_smart(char **pre, int npre, char **pk, int npk);
int cmd_install(int argc, char **argv);
int cmd_remove(int argc, char **argv);
int capture(char *const av[], char *out, size_t n);
int root_btrfs(char *dev, size_t n);
int sn_is_name(const char *s);
int sn_label_ok(const char *s);
int top_mount(void);
void top_umount(void);
int sn_names(const char *dir, char ***out);
void sn_free(char **v, int n);
void sn_prune(const char *dir);
void sn_stamp(char *out, size_t n, int full);
int sn_create(const char *label);
int sn_auto(void);
int sn_list(void);
int sn_remove(const char *name);
int sn_rollback(const char *name);
int cmd_snapshot(int argc, char **argv);
int cmd_snapshots(void);
int cmd_snapshot_rm(int argc, char **argv);
int cmd_rollback(int argc, char **argv);
int cmd_upgrade(int argc, char **argv);
int cmd_clean(int argc, char **argv);
int cmd_search(int argc, char **argv);
int cmd_info(int argc, char **argv);
int cmd_list(void);
void row(const char *name, const char *val);
int check(const char *name, int ok);
int cmd_doctor(void);
int safe_id(const char *s);
int ver_ok(const char *s);
int vercmp(const char *a, const char *b);
int remote_ver(const char *dir, char *out, size_t n);
int cmd_update(int argc, char **argv);
int verify_sig(const char *file, const char *sig);
int gpg_verify(const char *file, const char *sig, const char *fprs);
int cmd_fix(int argc, char **argv);
void usage(void);

#endif
