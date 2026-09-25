"""Side-profile car cutouts for the rental and sales showrooms.

The showroom shows every car in true side profile, like a manufacturer's
configurator; the client's own photos (front three-quarter views taken at home
and at the lot) open from "See photos". So each showroom car is a Wikimedia
Commons photo of the same model and generation, labelled "model photo" on the
page with its credit (licence and author below, and in ASSETS.md). Where no
free photo of that model exists in the client's colour, the paint is
recoloured to match: only the painted body, with the glass, wheels, lights,
chrome and trim traced by hand below and left as photographed. The credit says
"colour adjusted", and the adaptation carries the source's licence.

Each photo is downloaded once into .media-src/fleet/, has any plate softened,
is recoloured if asked, turned to face its carousel's way (only cars with no
lettering on show are mirrored), cut out with BiRefNet (the model used for the
hero car), reduced to the car, given a soft ground shadow drawn from its own
silhouette, and exported as a transparent WebP (1600 px of car at most).

Outputs in public/media/fleet/: <slug>-side-<hash>.webp, named by content so a
changed cutout never hides behind a cached copy; the script points
src/lib/fleet.ts at the new names and removes the old files.
Run from this folder: python fleet.py (FORCE=1 re-cuts cached mattes).
"""

import glob
import hashlib
import io
import os
import re
import urllib.request

import cv2
import numpy as np
from PIL import Image, ImageOps

from common import ROOT, SRC
from photos import soften

OUT = os.path.join(ROOT, "public", "media", "fleet")
CACHE = os.path.join(SRC, "fleet")
UA = {"User-Agent": "JOOXsite/1.0 (media pipeline; gersonloavas@gmail.com)"}
CAR_W = 1600          # widest the car gets in the output

# slug: the Commons file with its licence and author (or the client's own "file"),
# plates to soften, whether to mirror it, and an optional "paint" recolour. All
# coordinates are in the source photo's pixels. Rental cars face left, the way
# their carousel travels; the car for sale faces right.
CARS = {
    "mitsubishi-outlander-sport-2020": {
        # The 2020 facelift front, sold as the ASX in Chile. Grey as photographed; the client's is Sunshine Orange.
        "commons": "Mitsubishi ASX 1.6 GLS 2024.jpg",
        "license": "CC BY-SA 4.0",
        "author": "RL GNZLZ",
        "plates": [(150, 1255, 305, 1385)],
        # The kerb in front of the car hides the bottom of both tyres: (hub x, y, and the tyre's radius
        # from the hub, measured on its visible edge); the rest is fitted.
        "tyres": [(1351, 1656, 303), (3364, 1621, 309)],
        "paint": {
            "to": (226, 104, 28),
            "glass": [
                [(984, 914), (1280, 686), (1580, 590), (2060, 574), (2580, 586), (3020, 620), (3200, 674), (3380, 880),
                 (3220, 920), (2580, 950), (2060, 974), (1810, 994), (1520, 938)],
                [(516, 1154), (600, 1110), (840, 1080), (1030, 1060), (1060, 1090), (940, 1140), (660, 1194), (530, 1200)],  # headlight
            ],
            "keep": [
                (110, 1086, 530, 1410),  # grille, badge and plate
                (420, 1230, 530, 1500),  # chrome wing
                (680, 1235, 820, 1455),  # fog lamp housing
                (70, 1410, 1040, 1750),  # lower bumper
                (1670, 1190, 1750, 1330),  # fender vent
                (1540, 470, 3220, 598),  # roof rails
            ],
            "body": [[(1816, 986), (1844, 860), (1910, 830), (2060, 836), (2072, 974)]],  # the mirror, over the glass
            "wheels": [(1351, 1656, 335), (3364, 1621, 312)],
        },
    },
    "kia-sportage-2020": {
        # The same generation (QL); navy-black as photographed, taken to neutral black.
        "commons": "Moscow, Kia Sportage, May 2026 01.jpg",
        "license": "CC0",
        "author": "Retired electrician",
        "plates": [(92, 1655, 335, 1780)],
        "paint": {"to": "neutral"},
    },
    "mitsubishi-outlander-sport-2015": {
        # The 2013-2015 front, bronze as photographed; the client's is black.
        "commons": "Mitsubishi ASX(1).jpg",
        "license": "CC BY-SA 4.0",
        "author": "ГП",
        "plates": [(3700, 1460, 3775, 1740)],
        "tyres": [(604, 1817, 270), (2910, 1868, 308)],  # the kerb hides their bottoms too
        "mirror": True,  # faces right as taken; no lettering on the side
        "paint": {
            "to": "black",
            "glass": [[(570, 1104), (604, 1010), (740, 890), (920, 840), (1480, 800), (2080, 780), (2480, 920), (2870, 1104),
                       (2840, 1140), (2380, 1144), (2120, 1180), (1480, 1152), (920, 1116), (740, 1108)]],
            "keep": [(3250, 1300, 3670, 1490), (3450, 1600, 3650, 1810), (3660, 1240, 3790, 1840), (2500, 1300, 2610, 1350), (180, 1160, 360, 1330)],
            "body": [[(2110, 1184), (2124, 1070), (2210, 1036), (2304, 1048), (2380, 1196), (2280, 1212)]],
            "wheels": [(616, 1830, 295), (2910, 1836, 305)],
        },
    },
    "jeep-wrangler-unlimited": {
        # A black four-door JK, as the client's.
        "commons": "Cars 003.JPG",
        "license": "Public domain",
        "author": "Albert Jankowski",
    },
}


def commons_url(name: str, width: int = 2400) -> str:
    """Special:FilePath serves the file (or a rendition of the given width) by name."""
    return "https://commons.wikimedia.org/wiki/Special:FilePath/" + urllib.request.quote(name.replace(" ", "_")) + f"?width={width}"


def source(slug: str, car: dict) -> Image.Image:
    if "file" in car:
        return ImageOps.exif_transpose(Image.open(os.path.join(ROOT, car["file"]))).convert("RGB")
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, f"{slug}.src")
    if not os.path.exists(path):
        with urllib.request.urlopen(urllib.request.Request(commons_url(car["commons"]), headers=UA), timeout=120) as r:
            open(path, "wb").write(r.read())
    return Image.open(io.BytesIO(open(path, "rb").read())).convert("RGB")


_session = None


def matte(slug: str, im: Image.Image) -> np.ndarray:
    """BiRefNet alpha (cached), reduced to the car: its largest piece and what touches it."""
    path = os.path.join(CACHE, f"{slug}.alpha.png")
    if os.path.exists(path) and not os.environ.get("FORCE"):
        return np.asarray(Image.open(path)).astype(np.float32) / 255
    global _session
    if _session is None:
        from rembg import new_session

        _session = new_session("birefnet-general-lite")
    from rembg import remove

    a = np.asarray(remove(im, session=_session, only_mask=True)).astype(np.float32) / 255
    n, labels, stats, _ = cv2.connectedComponentsWithStats((a > 0.5).astype(np.uint8), 8)
    if n > 1:
        main = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        keep = cv2.dilate((labels == main).astype(np.uint8), np.ones((7, 7), np.uint8))
        a = a * keep
    a = np.clip((a - 0.04) / 0.92, 0, 1)
    os.makedirs(CACHE, exist_ok=True)
    Image.fromarray((a * 255 + 0.5).astype(np.uint8)).save(path)
    return a


def _region(shape: tuple[int, int], paint: dict) -> np.ndarray:
    """Where the paint is: everything except the traced glass, trim, lights and wheels (the mirror is paint again)."""
    keep = np.zeros(shape, np.uint8)
    for poly in paint.get("glass", []):
        cv2.fillPoly(keep, [np.array(poly, np.int32)], 1)
    for x0, y0, x1, y1 in paint.get("keep", []):
        cv2.rectangle(keep, (x0, y0), (x1, y1), 1, -1)
    for cx, cy, r in paint.get("wheels", []):
        cv2.circle(keep, (cx, cy), r, 1, -1)
    for poly in paint.get("body", []):
        cv2.fillPoly(keep, [np.array(poly, np.int32)], 0)
    return cv2.GaussianBlur(1 - keep.astype(np.float32), (0, 0), 3)


def recolour(rgb: np.ndarray, a: np.ndarray, paint: dict, spare: np.ndarray | None = None) -> np.ndarray:
    """Repaint the body in Lab, keeping the photo's own light: its shading, reflections and highlights.

    "neutral" takes a tinted black to a true black; "black" takes a mid-tone
    paint down to black; a colour paints the grey body that colour, strongest in
    the mid-tones and fading out in the highlights, as metallic paint does.
    """
    lab = cv2.cvtColor(np.clip(rgb, 0, 255).astype(np.uint8), cv2.COLOR_RGB2LAB).astype(np.float32)
    L, A, B = lab[..., 0] * (100 / 255), lab[..., 1] - 128, lab[..., 2] - 128
    chroma = np.hypot(A, B)
    lights = np.clip((chroma - 22) / 12, 0, 1)  # tail lights and markers keep their colour
    where = a * (1 - lights)
    if spare is not None:
        where = where * (1 - spare)  # rebuilt tyres stay rubber
    if paint["to"] == "neutral":
        nL, nA, nB = L, A * 0.3, B * 0.3
    else:
        where = where * _region(L.shape, paint) * np.clip((L - 26) / 10, 0, 1)  # dark trim, arch liners and tyres stay
        if paint["to"] == "black":
            hi = np.clip((L - 58) / 30, 0, 1)
            nL = 4 + L * 0.3 + hi * (L - 58) * 1.1
            nA, nB = A * 0.12, B * 0.12 - 1.5
        else:
            t = cv2.cvtColor(np.uint8([[paint["to"]]]), cv2.COLOR_RGB2LAB)[0, 0].astype(np.float32)
            tL, tA, tB = t[0] * (100 / 255), t[1] - 128, t[2] - 128
            body = where > 0.5
            mean = float(L[body].mean()) if body.any() else tL
            # Road dirt on a grey car reads as rust once it is orange: soften the fine texture, keep the shading.
            smooth = cv2.GaussianBlur(L, (0, 0), 6)
            nL = smooth + (L - smooth) * 0.55 + (tL - mean) * 0.6
            fade = np.clip(1 - (nL - 86) / 18, 0.4, 1) * np.clip(0.6 + nL / 60, 0, 1)  # sky reflections stay orange
            nA, nB = tA * fade, tB * fade
    m = where
    out = np.stack([(L + (nL - L) * m) * (255 / 100), A + (nA - A) * m + 128, B + (nB - B) * m + 128], -1)
    return cv2.cvtColor(np.clip(out, 0, 255).astype(np.uint8), cv2.COLOR_LAB2RGB).astype(np.float32)


def rebuild_tyres(rgb: np.ndarray, a: np.ndarray, tyres) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Complete tyres whose bottoms something in front of the car hides.

    Each side of a tyre's outline is read from the matte just above where it
    disappears and carried down as an elliptical arc (x = c +- k * sqrt(1 - dy^2
    / ry^2)), ry within a few percent of the measured radius; the two arcs end in the
    flat contact patch a loaded tyre has. The hidden band takes the colour of the
    rubber the camera saw just above, carried down and darkening toward the ground.
    Only pixels the matte left out change. Also returns where the tyres are,
    so a recolour leaves them alone.
    """
    h, w = a.shape
    rgb, a = rgb.copy(), a.copy()
    tyre = np.zeros_like(a)
    for cx, cy, radius in tyres:
        cut = int(np.nonzero(a[:, cx] > 0.5)[0].max())  # the lowest visible row under the hub
        rows, lefts, rights = [], [], []
        for y in range(cut - 110, cut - 3):
            run = a[y] > 0.5
            left, right = cx, cx
            while left > 0 and run[left - 1]:
                left -= 1
            while right < w - 1 and run[right + 1]:
                right += 1
            if cx - left < 1.5 * radius and right - cx < 1.5 * radius:  # the tyre alone, not the body beside it
                rows.append(y), lefts.append(left), rights.append(right)
        ys_, ls, rs = map(np.array, (rows, lefts, rights))
        best = None
        for ry in np.arange(radius * 0.95, radius * 1.1, 1.0):
            sq = np.sqrt(np.clip(1 - ((ys_ - cy) / ry) ** 2, 0, 1))
            m = np.stack([np.ones_like(sq), sq], 1)
            (cr, kr), res_r, *_ = np.linalg.lstsq(m, rs, rcond=None)
            (cl, kl), res_l, *_ = np.linalg.lstsq(m, ls, rcond=None)
            err = float(np.sum((m @ [cr, kr] - rs) ** 2) + np.sum((m @ [cl, kl] - ls) ** 2))
            if best is None or err < best[0]:
                best = (err, ry, cr, kr, cl, -kl)
        _, ry, cr, kr, cl, kl = best
        bottom = cy + ry * 0.99
        y0, y1 = cut - 12, min(h, int(np.ceil(bottom)) + 2)
        x0, x1 = int(cl - kl) - 4, int(cr + kr) + 4
        Y, X = np.mgrid[y0:y1, x0:x1].astype(np.float32)
        sq = np.sqrt(np.clip(1 - ((Y - cy) / ry) ** 2, 0, 1))
        xl, xr = cl - kl * sq, cr + kr * sq
        sil = np.clip(X - xl + 0.5, 0, 1) * np.clip(xr - X + 0.5, 0, 1) * np.clip(bottom - Y + 0.5, 0, 1)
        # Texture: the tyre's bottom sits in the car's own shadow, so it continues the rubber the camera
        # saw just above the hidden band, column by column (the darker quarter of those rows, so the rim's
        # lip never counts), smoothed along the tyre and darkening toward the ground.
        band = rgb[cut - 24:cut - 3, x0:x1]
        lum = band.mean(axis=2)
        rubber = lum < np.quantile(lum[a[cut - 24:cut - 3, x0:x1] > 0.9], 0.35) * 1.25  # dark: rubber, not rim
        n = rubber.sum(0)
        colour = (band * rubber[..., None]).sum(0) / np.maximum(n, 1)[:, None]
        xs_ = np.arange(x1 - x0)
        for ch in range(3):  # columns with no rubber in view borrow from their neighbours
            colour[:, ch] = np.interp(xs_, xs_[n >= 3], colour[n >= 3, ch]) if (n >= 3).any() else colour[:, ch]
        colour = cv2.GaussianBlur(colour[None], (0, 0), sigmaX=18, sigmaY=0.1)[0]
        depth = np.clip((Y - cut) / max(1.0, bottom - cut), 0, 1)
        synth = colour[None, :, :] * (1 - 0.45 * depth ** 1.4)[..., None]
        # The matte's own tyre stays, less a few pixels at its lower edge, where the kerb's light bleeds in.
        own = a[y0:y1, x0:x1]
        keep = np.clip((cv2.erode(own, np.ones((7, 7), np.uint8)) - 0.7) / 0.28, 0, 1)
        keep = np.where(sil > 0.5, keep, np.clip((own - 0.7) / 0.28, 0, 1))[..., None]
        s3 = sil[..., None]
        # A soft join: the last rows of visible rubber ease into the fill (the rim's bright lip stays).
        dark = ((rgb[y0:y1, x0:x1].mean(axis=2) < colour.mean() * 1.35) | (Y > cut - 6))[..., None]  # the last rows are kerb light
        ease = np.clip((Y - (cut - 10)) / 16, 0, 1)[..., None] * dark
        keep = np.minimum(keep, 1 - ease * s3)
        rgb[y0:y1, x0:x1] = rgb[y0:y1, x0:x1] * keep + (synth * s3 + rgb[y0:y1, x0:x1] * (1 - s3)) * (1 - keep)
        a[y0:y1, x0:x1] = np.maximum(own, sil)
        tyre[y0:y1, x0:x1] = np.maximum(tyre[y0:y1, x0:x1], sil * (Y > cy))
        print(f"  tyre at {cx}: ry {ry:.0f}, flat {cl:.0f}-{cr:.0f}, bottom {bottom:.0f} (hidden below {cut})")
    return rgb, a, cv2.dilate(tyre, np.ones((9, 9), np.uint8))


def level(rgb: np.ndarray, a: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Rotate so both tyres touch the same ground line (photos taken on a slope)."""
    ys, xs = np.nonzero(a > 0.02)
    x0, x1 = xs.min(), xs.max()
    w = x1 - x0

    def contact(c0: float, c1: float) -> tuple[float, float]:
        cols = a[:, int(x0 + c0 * w):int(x0 + c1 * w)]
        rows = np.nonzero(cols.max(axis=1) > 0.5)[0]
        y = rows.max()
        xs_ = np.nonzero(cols[y] > 0.5)[0]
        return float(int(x0 + c0 * w) + xs_.mean()), float(y)

    (xl, yl), (xr, yr) = contact(0.05, 0.4), contact(0.6, 0.95)
    angle = np.degrees(np.arctan2(yr - yl, xr - xl))
    if abs(angle) < 0.3:
        return rgb, a
    h, w_ = a.shape
    rot = cv2.getRotationMatrix2D((w_ / 2, h / 2), angle, 1)
    rgb = cv2.warpAffine(rgb, rot, (w_, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    a = cv2.warpAffine(a, rot, (w_, h), flags=cv2.INTER_CUBIC, borderValue=0)
    return rgb, np.clip(a, 0, 1)


def cutout(slug: str, car: dict) -> Image.Image:
    im = source(slug, car)
    a = matte(slug, im)  # always on the photo as taken, so the cache holds either way
    rgb = soften(np.asarray(im), car.get("plates", []))
    spare = None
    if "tyres" in car:
        rgb, a, spare = rebuild_tyres(rgb.astype(np.float32), a, car["tyres"])
    if "paint" in car:
        rgb = recolour(rgb, a, car["paint"], spare)
    if car.get("mirror"):
        rgb = rgb[:, ::-1]
        a = a[:, ::-1]
    rgb, a = level(np.ascontiguousarray(rgb), np.ascontiguousarray(a))
    ys, xs = np.nonzero(a > 0.02)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    rgb = np.ascontiguousarray(rgb[y0:y1, x0:x1])
    a = np.ascontiguousarray(a[y0:y1, x0:x1])
    scale = min(1.0, CAR_W / (x1 - x0))
    w, h = int(round((x1 - x0) * scale)), int(round((y1 - y0) * scale))
    if scale < 1:
        rgb = cv2.resize(rgb, (w, h), interpolation=cv2.INTER_AREA)
        a = cv2.resize(a, (w, h), interpolation=cv2.INTER_AREA)

    # Shadow from the car's own silhouette: a long soft pool under the body and
    # darker contact where the nearest tyres and bumper meet the ground.
    pad, room = int(w * 0.05), int(h * 0.08)
    W, H = w + 2 * pad, h + room
    shadow = np.zeros((H, W), np.float32)
    body = cv2.resize(a, (int(w * 0.96), max(4, int(h * 0.1))), interpolation=cv2.INTER_AREA)
    by = h - body.shape[0] // 2 - int(h * 0.03)
    bx = pad + (w - body.shape[1]) // 2
    shadow[by:by + body.shape[0], bx:bx + body.shape[1]] = body
    shadow = cv2.GaussianBlur(shadow, (0, 0), w * 0.012) * 0.6
    contact = np.zeros_like(shadow)
    band = a[int(h * 0.93):, :]
    lift = max(2, int(w * 0.002))
    contact[h - band.shape[0] + lift:h + lift, pad:pad + w] = band
    contact = cv2.GaussianBlur(contact, (0, 0), w * 0.003) * 0.75
    shadow = np.clip(np.maximum(shadow, contact), 0, 0.78)

    out = np.zeros((H, W, 4), np.float32)
    out[..., 3] = shadow
    out[..., :3] = 19  # shadow in the brand ink
    car_a = np.zeros((H, W), np.float32)
    car_a[:h, pad:pad + w] = a
    car_rgb = np.zeros((H, W, 3), np.float32)
    car_rgb[:h, pad:pad + w] = rgb
    # Car over shadow ("over" compositing with straight alpha).
    oa = car_a + out[..., 3] * (1 - car_a)
    safe = np.maximum(oa, 1e-6)[..., None]
    out[..., :3] = (car_rgb * car_a[..., None] + out[..., :3] * (out[..., 3] * (1 - car_a))[..., None]) / safe
    out[..., 3] = oa
    return Image.fromarray(np.clip(out * [1, 1, 1, 255] + [0.5, 0.5, 0.5, 0.5], 0, 255).astype(np.uint8), "RGBA")


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    lib = os.path.join(ROOT, "src", "lib", "fleet.ts")
    ts = open(lib, encoding="utf-8").read()
    for slug, car in CARS.items():
        img = cutout(slug, car)
        buf = io.BytesIO()
        img.save(buf, "WEBP", quality=86, method=6)
        name = f"{slug}-side-{hashlib.sha1(buf.getvalue()).hexdigest()[:8]}.webp"
        path = os.path.join(OUT, name)
        for old in glob.glob(os.path.join(OUT, f"{slug}-side*.webp*")):
            if os.path.basename(old) not in (name, name + ".json"):
                os.remove(old)
        open(path, "wb").write(buf.getvalue())
        ts = re.sub(rf'/media/fleet/{re.escape(slug)}-side[^"]*\.webp", width: \d+, height: \d+',
                    f'/media/fleet/{name}", width: {img.width}, height: {img.height}', ts)
        who = f"{car['license']}, {car['author']}{', colour adjusted' if car.get('paint') else ''}" if "commons" in car else "client's photo"
        print(f"{name}: {img.size} {os.path.getsize(path) // 1024} KB ({who})")
    open(lib, "w", encoding="utf-8", newline="\n").write(ts)


if __name__ == "__main__":
    main()
