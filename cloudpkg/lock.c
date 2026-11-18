#include "cloudpkg.h"
int lock_fd = -1;
static void lock_path(char *out, size_t n)
{
	if (geteuid() == 0)
		snprintf(out, n, "%s", LOCKFILE);
	else
		snprintf(out, n, "/tmp/cloudpkg-%ld.lock", (long)getuid());
}
int acquire_lock(void)
{
	char path[BUF];
	int fd, pid;
	lock_path(path, sizeof path);
	fd = open(path, O_RDWR | O_CREAT | O_NOFOLLOW, 0600);
	if (fd < 0) {
		fprintf(stderr, "cloudpkg: cannot open %s: %s\n", path, strerror(errno));
		return 0;
	}
	if (flock(fd, LOCK_EX | LOCK_NB) < 0) {
		if (errno == EWOULDBLOCK || errno == EAGAIN) {
			fprintf(stderr, "cloudpkg: another instance is already running (%s)\n", path);
			fputs("cloudpkg: wait for it to finish\n", stderr);
		} else {
			fprintf(stderr, "cloudpkg: cannot lock %s: %s\n", path, strerror(errno));
		}
		close(fd);
		return 0;
	}
	lock_fd = fd;
	pid = (int)getpid();
	if (ftruncate(fd, 0) == 0 && lseek(fd, 0, SEEK_SET) == 0) {
		if (write(fd, &pid, sizeof pid) != sizeof pid) {}
	}
	return 1;
}
void release_lock(void)
{
	if (lock_fd >= 0) {
		flock(lock_fd, LOCK_UN);
		close(lock_fd);
		lock_fd = -1;
	}
}
