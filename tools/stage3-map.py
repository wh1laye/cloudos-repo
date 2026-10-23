#!/usr/bin/env python3
import sys, os, json, tarfile, datetime, argparse

ap = argparse.ArgumentParser(description="карта размеров stage 3 для страницы /stage3/")
ap.add_argument("src", help="архив .tar.xz или каталог (с --dir)")
ap.add_argument("--dir", action="store_true", help="src это каталог")
ap.add_argument("-o", "--out", default="docs/stage3/map.json")
ap.add_argument("--depth", type=int, default=4)
ap.add_argument("--keep", type=int, default=40)
a = ap.parse_args()

root = {"s": 0, "c": {}}
files = 0


def add(parts, size):
    n = root
    n["s"] += size
    for p in parts[: a.depth]:
        c = n["c"].get(p)
        if c is None:
            c = n["c"][p] = {"s": 0, "c": {}}
        c["s"] += size
        n = c


def clean(path):
    p = [x for x in path.replace("\\", "/").split("/") if x and x != "."]
    return p


if a.dir:
    base = os.path.abspath(a.src)
    for dp, dn, fn in os.walk(base):
        for f in fn:
            fp = os.path.join(dp, f)
            try:
                if os.path.islink(fp):
                    continue
                s = os.path.getsize(fp)
            except OSError:
                continue
            files += 1
            add(clean(os.path.relpath(fp, base)), s)
else:
    with tarfile.open(a.src, "r:*") as t:
        for m in t:
            if m.isfile():
                files += 1
                add(clean(m.name), m.size)


def conv(name, n):
    kids = sorted(n["c"].items(), key=lambda kv: -kv[1]["s"])
    out = {"n": name, "s": n["s"]}
    if kids:
        head = kids[: a.keep]
        tail = kids[a.keep:]
        out["c"] = [conv(k, v) for k, v in head]
        if tail:
            out["c"].append({"n": "...", "s": sum(v["s"] for _, v in tail)})
    return out


tree = conv("/", root)
data = {"t": root["s"], "f": files, "src": os.path.basename(a.src.rstrip("/")),
        "d": datetime.date.today().isoformat(), "tree": tree}
os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
with open(a.out, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
print("ok:", a.out, "файлов:", files, "размер:", root["s"])
