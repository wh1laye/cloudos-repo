#!/usr/bin/env python3
import sys
from PIL import Image
src = sys.argv[1] if len(sys.argv) > 1 else "logo.png"
W, H = 44, 28
im = Image.open(src).convert("RGBA").resize((W, H), Image.LANCZOS)
px = im.load()
# 5 оттенков сверху вниз (цвета 256-палитры заданы в fastfetch.jsonc: 153 111 110 68 25)
BANDS = [1, 1, 2, 2, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5]
def on(x, y): return px[x, y][3] > 110
txt, ansi = [], []
for r in range(H // 2):
    t = b = ""
    a = ""
    col = "$" + str(BANDS[r])
    for x in range(W):
        up, dn = on(x, 2 * r), on(x, 2 * r + 1)
        t += "█" if up and dn else "▀" if up else "▄" if dn else " "
        if up and dn:
            u, d = px[x, 2 * r][:3], px[x, 2 * r + 1][:3]
            a += "\x1b[38;2;%d;%d;%dm\x1b[48;2;%d;%d;%dm▀" % (*u, *d)
        elif up:
            a += "\x1b[0m\x1b[38;2;%d;%d;%dm▀" % px[x, 2 * r][:3]
        elif dn:
            a += "\x1b[0m\x1b[38;2;%d;%d;%dm▄" % px[x, 2 * r + 1][:3]
        else:
            a += "\x1b[0m "
    txt.append(col + t.rstrip())
    ansi.append(a + "\x1b[0m")
open("logo.txt", "w", encoding="utf-8").write("\n".join(txt) + "\n")
open("logo.ansi", "w", encoding="utf-8").write("\n".join(ansi) + "\n")
