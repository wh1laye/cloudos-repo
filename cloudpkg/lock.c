#include "cloudpkg.h"

int lock_fd = -1;

int acquire_lock(void)
{
	struct stat st;
	int fd;

	fd = open(LOCKFILE, O_RDWR | O_CREAT, 0644);
	if (fd < 0) {
		fprintf(stderr, "cloudpkg: не удалось открыть %s: %s\n", LOCKFILE, strerror(errno));
		return 0;
	}
	if (flock(fd, LOCK_EX | LOCK_NB) < 0) {
		if (errno == EWOULDBLOCK || errno == EAGAIN) {
			fprintf(stderr, "cloudpkg: другой экземпляр уже работает (%s)\n", LOCKFILE);
			fprintf(stderr, "cloudpkg: дождись завершения или убери заблокированный файл\n");
		} else {
			fprintf(stderr, "cloudpkg: не удалось заблокировать %s: %s\n", LOCKFILE, strerror(errno));
		}
		close(fd);
		return 0;
	}
	lock_fd = fd;
	if (fstat(fd, &st) == 0 && st.st_size < (off_t)sizeof(int)) {
		if (ftruncate(fd, sizeof(int)) < 0) {}
	}
	if (lseek(fd, 0, SEEK_SET) == (off_t)-1) {}
	if (write(fd, &fd, sizeof(int)) != sizeof(int)) {}
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
