"""Analyze screenshot pixels: find colored (non-white) clusters and their sizes
to verify liquid blobs + small droplets are rendering."""
from PIL import Image
import sys
from collections import deque

path = sys.argv[1] if len(sys.argv) > 1 else "download/verify-drop2.png"
img = Image.open(path).convert("RGB")
w, h = img.size
px = img.load()

# mask of "colored" pixels (not near-white, not near-black text)
mask = [[False] * w for _ in range(h)]
for y in range(0, h, 2):  # sample every 2px for speed
    for x in range(0, w, 2):
        r, g, b = px[x, y]
        # greenish-teal tinted and not white, not dark text
        if g > r and g >= b - 10 and g > 60 and (255 - g) + (255 - r) + (255 - b) > 60 and max(r, g, b) < 245:
            mask[y][x] = True

visited = [[False] * w for _ in range(h)]
clusters = []
for y in range(0, h, 2):
    for x in range(0, w, 2):
        if mask[y][x] and not visited[y][x]:
            # BFS
            q = deque([(x, y)])
            visited[y][x] = True
            size = 0
            minx = maxx = x
            miny = maxy = y
            while q:
                cx, cy = q.popleft()
                size += 1
                minx, maxx = min(minx, cx), max(maxx, cx)
                miny, maxy = min(miny, cy), max(maxy, cy)
                for dx, dy in ((2,0),(-2,0),(0,2),(0,-2),(2,2),(-2,-2),(2,-2),(-2,2)):
                    nx, ny = cx+dx, cy+dy
                    if 0 <= nx < w and 0 <= ny < h and mask[ny][nx] and not visited[ny][nx]:
                        visited[ny][nx] = True
                        q.append((nx, ny))
            bw, bh = (maxx-minx)+2, (maxy-miny)+2
            # skip thin horizontal lines (marquee text, underlines)
            if bh < 6:
                continue
            clusters.append((size*4, bw, bh, minx, miny))

clusters.sort(reverse=True)
print(f"image {w}x{h}, colored clusters: {len(clusters)}")
for c in clusters[:15]:
    area, bw, bh, x, y = c
    kind = "BIG blob" if bw > 300 else ("mid" if bw > 120 else "SMALL droplet")
    print(f"  {kind:12s} w={bw:4d} h={bh:4d} at ({x},{y})")
small = [c for c in clusters if c[1] <= 120 and c[2] >= 10]
print(f"small droplet-sized clusters (<=120px wide, >=10px tall): {len(small)}")
