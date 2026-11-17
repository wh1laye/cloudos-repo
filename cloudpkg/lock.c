#include "cloudpkg.h"
int lock_fd = -1;
int acquire_lock(void)
{
	int fd, pid;
	fd = open(LOCKFILE, O_RDWR | O_CREAT, 0644);
	if (fd < 0) {
		fprintf(stderr, "cloudpkg: cannot open %s: %s\n", LOCKFILE, strerror(errno));
		return 0;
	}
	if (flock(fd, LOCK_EX | LOCK_NB) < 0) {
		if (errno == EWOULDBLOCK || errno == EAGAIN) {
			fprintf(stderr, "cloudpkg: another instance is already running (%s)\n", LOCKFILE);
			fputs("cloudpkg: wait for it to finish\n", stderr);
		} else {
			fprintf(stderr, "cloudpkg: cannot lock %s: %s\n", LOCKFILE, strerror(errno));
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
