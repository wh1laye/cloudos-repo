import gzip
import sys


def pad(n):
    return (4 - n % 4) % 4


class Archive:
    def __init__(self):
        self.buf = bytearray()
        self.ino = 0

    def add(self, name, mode, data=b"", rdev=(0, 0)):
        self.ino += 1
        raw = name.encode() + b"\0"
        fields = (self.ino, mode, 0, 0, 1, 0, len(data), 0, 0, rdev[0], rdev[1], len(raw), 0)
        self.buf += ("070701" + "".join("%08X" % v for v in fields)).encode()
        self.buf += raw
        self.buf += b"\0" * pad(110 + len(raw))
        self.buf += data
        self.buf += b"\0" * pad(len(data))


def build(busybox, init):
    a = Archive()
    for d in ("bin", "dev", "proc", "sys", "tmp"):
        a.add(d, 0o040755)
    a.add("dev/console", 0o020600, rdev=(5, 1))
    a.add("dev/null", 0o020666, rdev=(1, 3))
    a.add("bin/busybox", 0o100755, busybox)
    a.add("init", 0o100755, init)
    a.add("TRAILER!!!", 0)
    return bytes(a.buf)


def main(argv):
    if len(argv) != 4:
        sys.stderr.write("использование: mkcpio.py out.gz busybox init\n")
        return 2
    with open(argv[2], "rb") as f:
        busybox = f.read()
    with open(argv[3], "rb") as f:
        init = f.read()
    with open(argv[1], "wb") as raw:
        with gzip.GzipFile(fileobj=raw, mode="wb", mtime=0) as z:
            z.write(build(busybox, init))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
