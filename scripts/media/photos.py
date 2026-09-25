"""The client's own photos, ready for the page.

The photos arrived through a chat app, already reduced to 1280 px on the long
side, in three folders at the project root: cars-to-rent/ (the rental fleet),
cars-to-export/ (the client's imports: lots, tow truck, containers, papers)
and cars-ready-to-sell/ (the car for sale). Each photo used on the page gets
its number plates softened into blank plates and anyone who did not sign up
for the website blurred, is optionally lifted out of shadow, and is saved as
a WebP without metadata (phone photos can carry the GPS position of the
client's home). Nothing is upscaled.

Output: public/media/photos/<id>.webp; the ids are the keys in
src/lib/fleet.ts (PHOTOS) and the captions in messages/*.json (photos).
Run from this folder: python photos.py
"""

import os

import cv2
import numpy as np
from PIL import Image, ImageOps

from common import ROOT

OUT = os.path.join(ROOT, "public", "media", "photos")
RENT = "cars-to-rent/photo_2026-09-25_"
IMPORTS = "cars-to-export/photo_2026-09-25_"
SALE = "cars-ready-to-sell/photo_2026-09-25_"

# id: (source photo, plates to soften, people to blur, lift) in source pixels.
PHOTOS = {
    # The rental fleet: the three together at home in Guápiles, then each alone.
    "fleet-grass": (RENT + "08-11-48.jpg", [(322, 466, 348, 496), (574, 438, 606, 470), (876, 462, 952, 514)], [], 0),
    "fleet-row": (RENT + "08-12-10.jpg", [(152, 580, 200, 608), (590, 540, 638, 568), (1028, 540, 1092, 573)], [], 0),
    "fleet-doors": (RENT + "08-12-13.jpg", [(112, 720, 160, 746), (428, 725, 474, 750), (762, 730, 806, 754)], [], 0),
    "outlander-sport-2020": (RENT + "08-12-23.jpg", [(190, 775, 318, 862)], [(132, 515, 235, 640)], 0),
    "outlander-sport-2015": (RENT + "08-12-21.jpg", [], [], 0.3),  # shot against the light
    "sportage-2020": (RENT + "08-12-26.jpg", [(690, 700, 800, 795)], [], 0),
    # The car for sale.
    "wrangler-front": (SALE + "08-32-26.jpg", [(284, 1030, 480, 1130)], [], 0),
    "wrangler-rear": (SALE + "08-32-39.jpg", [], [], 0),
    "wrangler-key": (SALE + "08-32-29.jpg", [], [], 0),
    "wrangler-cabin": (SALE + "08-32-35.jpg", [], [], 0),
    "wrangler-back": (SALE + "08-32-37.jpg", [], [], 0),
    # Imports, in the order the strip shows them.
    "import-lot": (IMPORTS + "08-25-23.jpg", [], [], 0),
    "import-rubicon": (IMPORTS + "08-25-31.jpg", [], [], 0),
    "import-tow": (IMPORTS + "08-25-53.jpg", [], [], 0),
    "import-container": (IMPORTS + "08-26-14.jpg", [], [], 0),
    "import-x6": (IMPORTS + "08-25-20.jpg", [], [], 0),
    "import-papers": (IMPORTS + "08-25-26.jpg", [], [], 0),
    "import-4runner": (IMPORTS + "08-25-28.jpg", [(400, 655, 560, 720)], [], 0),
    "import-containers": (IMPORTS + "08-26-12.jpg", [], [], 0),
    "import-rebel": (IMPORTS + "08-25-14.jpg", [], [], 0),
    "import-keys": (IMPORTS + "08-26-08.jpg", [], [], 0),
}


def _feather(shape: tuple[int, int], box: tuple[int, int, int, int], grow: int, soft: float) -> np.ndarray:
    x0, y0, x1, y1 = box
    m = np.zeros(shape, np.float32)
    cv2.rectangle(m, (x0 - grow, y0 - grow), (x1 + grow, y1 + grow), 1.0, -1)
    return cv2.GaussianBlur(m, (0, 0), soft)[..., None]


def soften(rgb: np.ndarray, plates, people=()) -> np.ndarray:
    """Plates become blank plates (their own colours smoothed flat); people become an unreadable blur."""
    out = rgb.astype(np.float32)
    for x0, y0, x1, y1 in plates:
        sigma = max(x1 - x0, y1 - y0) / 3
        blank = cv2.GaussianBlur(out, (0, 0), sigma)
        m = _feather(out.shape[:2], (x0, y0, x1, y1), 2, 2.5)
        out = out * (1 - m) + blank * m
    for x0, y0, x1, y1 in people:
        small = cv2.resize(out[y0:y1, x0:x1], (max(1, (x1 - x0) // 14), max(1, (y1 - y0) // 14)), interpolation=cv2.INTER_AREA)
        blur = out.copy()
        blur[y0:y1, x0:x1] = cv2.GaussianBlur(cv2.resize(small, (x1 - x0, y1 - y0), interpolation=cv2.INTER_LINEAR), (0, 0), 6)
        m = _feather(out.shape[:2], (x0, y0, x1, y1), 0, 6)
        out = out * (1 - m) + blur * m
    return np.clip(out, 0, 255)


def lift(rgb: np.ndarray, amount: float) -> np.ndarray:
    """Open the shadows of a backlit photo without touching the highlights."""
    x = rgb.astype(np.float32) / 255
    lum = x.mean(axis=2, keepdims=True)
    gain = 1 + amount * (1 - lum) ** 2 * 1.6
    return np.clip(x * gain, 0, 1) * 255


def load(path: str) -> np.ndarray:
    return np.asarray(ImageOps.exif_transpose(Image.open(os.path.join(ROOT, path))).convert("RGB"))


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    for pid, (src, plates, people, amount) in PHOTOS.items():
        rgb = soften(load(src), plates, people)
        if amount:
            rgb = lift(rgb, amount)
        img = Image.fromarray(rgb.round().astype(np.uint8))
        path = os.path.join(OUT, f"{pid}.webp")
        img.save(path, "WEBP", quality=82, method=6)  # no exif, no gps
        print(f"{pid}: {img.width}x{img.height}, {os.path.getsize(path) // 1024} KB")


if __name__ == "__main__":
    main()
