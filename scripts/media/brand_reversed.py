"""Reversed JOOX CARS mark for dark grounds (the header over the hero film).

Source: public/brand/joox-cars-mark.webp, the transparent cutout of the client's
logo raster (references/brand/joox-cars-logo.png). Only two inks exist in the
logo, JOOX yellow and near-black, so each pixel's colour is read as a mix of the
two (from its red channel, where they differ most) and the black share is
swapped for white. Yellow stays yellow, black becomes white, and anti-aliased
edges between them blend yellow to white. Alpha is kept as is.

Output: public/brand/joox-cars-mark-reversed.webp (same size as the mark, lossless).
"""

import os

import numpy as np
from PIL import Image

from common import ROOT

YELLOW = np.array([0xFD, 0xCD, 0x03], np.float32)
BLACK = np.array([0x13, 0x13, 0x13], np.float32)
WHITE = np.array([0xFF, 0xFF, 0xFF], np.float32)


def main() -> None:
    src = os.path.join(ROOT, "public", "brand", "joox-cars-mark.webp")
    out = os.path.join(ROOT, "public", "brand", "joox-cars-mark-reversed.webp")
    rgba = np.asarray(Image.open(src).convert("RGBA")).astype(np.float32)
    rgb, a = rgba[..., :3], rgba[..., 3:]
    t = np.clip((rgb[..., :1] - BLACK[0]) / (YELLOW[0] - BLACK[0]), 0, 1)  # yellow share
    new = t * YELLOW + (1 - t) * WHITE
    Image.fromarray(np.concatenate([new, a], axis=2).round().astype(np.uint8), "RGBA").save(out, lossless=True, method=6)
    print(out, Image.open(out).size)


if __name__ == "__main__":
    main()
