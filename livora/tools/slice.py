"""Split a tall PNG into N-px-tall slices: python tools/slice.py <in.png> <slice_height> [out_prefix]
Writes <out_prefix>-1.png, -2.png … (default prefix = input name without extension). Used by shot.mjs --slice."""
import sys
from pathlib import Path
from PIL import Image

src = Path(sys.argv[1])
slice_h = int(sys.argv[2])
prefix = sys.argv[3] if len(sys.argv) > 3 else str(src.with_suffix(""))

Image.MAX_IMAGE_PIXELS = None
img = Image.open(src)
w, h = img.size
n = 0
for y in range(0, h, slice_h):
    n += 1
    out = f"{prefix}-{n}.png"
    img.crop((0, y, w, min(y + slice_h, h))).save(out, optimize=False)
    print(f"saved {out}")
print(f"page height {h}px -> {n} slice(s)")
