"""V2 · The car drives through the word, baked into one film.

The word is drawn into every frame offline instead of being composited live in
the browser. Far to near: coast road (plate) → the word, standing on the road
at its baseline → the Jeep while it is nearer than the word.

The word is the logo's own JOOX, cut from the client's logo raster and reversed
for the film: J and X white, the OO infinity in JOOX yellow.

The curtain: as the car reaches the word, the letters part at the split
(JO | OX, at the crossing of the logo's infinity) like a curtain, the car
drives through the gap, and the letters close behind it. The car turns from
"in front" to "behind" while the gap is open, so the change is never seen.

The car's cutout comes from a segmentation model (BiRefNet, via rembg), run on
a crop around the car. The crop comes from background subtraction against the
car-free frames at both ends of the take. The cutout is only needed while the
car is in front and overlaps the letters; those alphas are cached in
.media-src/_cache/<source> so re-runs skip the model. A single frame's cutout
flickers and is soft (glass, the gap under the car, the antenna), which reads as
the letter turning see-through around the car. The matte actually used is
steadied: the median of the neighbouring frames' cutouts, aligned on the tracked
licence plate (its track smoothed), made solid, edge included.

The take plays as generated: every frame, at its own speed and colour. The loop
runs from START to the end of the take, after the car has gone over the hill,
and closes with a short dissolve between empty road and empty road.

Two layouts, one render each (LAYOUTS):
  desktop  1920x1080, word 44% of the width below the copy, split centred on the car's path
  phone    890x1080 crop centred on the car's crossing point, word 58% of the crop and higher

Outputs in public/media/v2/:
  film.av1.mp4/.mp4, film-720.*   desktop layout (1080p and 1280 wide)
  film-phone.av1.mp4/.mp4         phone layout
  poster-<hash>.webp, poster-phone-<hash>.webp  the frames at POSTER_SRC_T (LCP images), named by content

The car's licence plate is blurred in every frame.

Environment: FFMPEG as in common.py.
"""

import functools
import glob
import hashlib
import os

import cv2
import numpy as np
from PIL import Image

from common import ROOT, SRC, Encoder, out_dir, read_frames, save_webp, source_path

SOURCE = "hill"                   # key in sources.json
W, H = 1920, 1080
SRC_FPS = 24
START = 0.3                       # source second the loop starts at (road still empty)
DISSOLVE = 0.3                    # seconds of the loop dissolve (empty road both sides)
# Source second of each poster, where the film also starts playing: the empty road just
# before the loop comes round, so the car bursts in as soon as the film has faded in.
POSTER_SRC_T = {"desktop": 9.5, "phone": 9.5}
CLEAN = ((0.0, 0.3), (9.5, 10.1))  # car-free seconds for the clean plate: before the car, after the hill
ROI_TOP = 0.40                    # the car is tracked below this fraction of the frame (the palm canopy sways above)
LOGO = os.path.join(ROOT, "references", "brand", "joox-cars-logo.png")
LOGO_BAND = (0.24, 0.505)         # the JOOX line, as fractions of the logo's height (CARS and the tagline sit below)
YELLOW = np.array([0xFD, 0xCD, 0x03], np.float32)
WHITE = np.array([0xFF, 0xFF, 0xFF], np.float32)
CACHE = os.path.join(SRC, "_cache", SOURCE)
PHONE_W = 890
MARGIN = 0.03                     # min distance from the frame edge, fraction of the layout width

TEMPORAL = 2                      # the car matte is the median of the cutouts this many frames either side
HOLD = 2                          # the gap holds the car this many frames either side of the crossing

# Curtain timing, source seconds relative to the car crossing the word's baseline.
OPEN = (-0.6, -0.15)
CLOSE = (0.6, 1.5)

# name: (word ink width as a fraction of the layout width, baseline as a fraction of the height).
# On desktop the word stands below the copy; on phones the copy sits under the film, so the word
# can stand higher, where the car crosses it smaller.
LAYOUTS = {"desktop": (0.44, 0.8), "phone": (0.58, 0.7)}


# ---------- the word ----------

def _ink_x(alpha: np.ndarray) -> tuple[int, int]:
    cols = np.nonzero(alpha.max(axis=0) > 0.02)[0]
    return int(cols.min()), int(cols.max()) + 1


def _ink_rows(alpha: np.ndarray) -> tuple[int, int]:
    rows = np.nonzero(alpha.max(axis=1) > 0.02)[0]
    return int(rows.min()), int(rows.max()) + 1


@functools.cache
def logo_word() -> tuple[np.ndarray, float]:
    """The logo's JOOX as premultiplied RGBA (colour 0-255, alpha 0-1), trimmed to its ink, and
    the x of the infinity's crossing. On the white logo the J and X are near-black: each pixel's
    coverage is unmixed from the paper (yellow keeps red and green high and drops blue; black
    darkens all three), then the black share is drawn white."""
    rgb = np.asarray(Image.open(LOGO).convert("RGB")).astype(np.float32) / 255
    h = rgb.shape[0]
    band = rgb[int(h * LOGO_BAND[0]): int(h * LOGO_BAND[1])]
    r, g, b = band[..., 0], band[..., 1], band[..., 2]
    yellow = np.clip((np.minimum(r, g) - b - 0.25) / 0.45, 0, 1)
    dark = np.clip((0.92 - band.max(axis=2)) / 0.75, 0, 1) * (1 - yellow)
    alpha = np.maximum(yellow, dark)
    ys, xs = np.nonzero(alpha > 0.5)
    y0, y1 = max(0, ys.min() - 4), min(alpha.shape[0], ys.max() + 5)
    x0, x1 = max(0, xs.min() - 4), min(alpha.shape[1], xs.max() + 5)
    alpha, yellow = alpha[y0:y1, x0:x1], yellow[y0:y1, x0:x1]
    share = (yellow / np.maximum(alpha, 1e-6))[..., None]
    colour = WHITE * (1 - share) + YELLOW * share
    cols = np.nonzero((yellow > 0.5).any(axis=0))[0]
    return np.dstack([colour * alpha[..., None], alpha]).astype(np.float32), float(cols.min() + cols.max()) / 2


class Word:
    """The word as two halves (before and after the split), each premultiplied RGBA
    over the plate at rest, with measured ink edges in plate pixels."""

    def __init__(self, ink_w: float, baseline: float, anchor_x: float, lo: float, hi: float):
        word, split = logo_word()
        x0, x1 = _ink_x(word[..., 3])
        s = ink_w / (x1 - x0)
        word = cv2.resize(word, (round(word.shape[1] * s), round(word.shape[0] * s)), interpolation=cv2.INTER_AREA)
        cut = round(split * s)
        left, right = word.copy(), word.copy()
        left[:, cut:] = 0
        right[:, :cut] = 0
        # Place the split on anchor_x, clamped so the whole word stays inside [lo, hi];
        # the ink's bottom stands on the baseline.
        x = min(max(anchor_x - cut, lo - x0 * s), hi - x1 * s)
        y = baseline * H - _ink_rows(word[..., 3])[1]
        place = np.float32([[1, 0, x], [0, 1, y]])
        self.L = cv2.warpAffine(left, place, (W, H), flags=cv2.INTER_LINEAR)
        self.R = cv2.warpAffine(right, place, (W, H), flags=cv2.INTER_LINEAR)
        self.l0, self.l1 = _ink_x(self.L[..., 3])
        self.r0, self.r1 = _ink_x(self.R[..., 3])

    def at(self, dx_l: float, dx_r: float) -> np.ndarray:
        """The word's RGBA with the left half moved by dx_l and the right half by dx_r."""
        move = lambda m, dx: m if dx == 0 else cv2.warpAffine(m, np.float32([[1, 0, dx], [0, 1, 0]]), (W, H), flags=cv2.INTER_LINEAR)
        return move(self.L, dx_l) + move(self.R, dx_r)


def composite(frame: np.ndarray, word: np.ndarray, car: np.ndarray | None = None) -> np.ndarray:
    """The word over a float RGB frame, under the car where its matte is given."""
    if car is not None:
        word = word * (1 - car)[..., None]
    return frame * (1 - word[..., 3:]) + word[..., :3]


def ease(t: float) -> float:
    t = min(max(t, 0.0), 1.0)
    return 4 * t * t * t if t < 0.5 else 1 - (-2 * t + 2) ** 3 / 2


def curtain(i: int, cross: int) -> float:
    """0 = closed, 1 = fully open, for source frame i."""
    t = (i - cross) / SRC_FPS
    if t <= OPEN[0] or t >= CLOSE[1]:
        return 0.0
    if t < OPEN[1]:
        return ease((t - OPEN[0]) / (OPEN[1] - OPEN[0]))
    if t <= CLOSE[0]:
        return 1.0
    return 1 - ease((t - CLOSE[0]) / (CLOSE[1] - CLOSE[0]))


# ---------- background subtraction (coarse car mask, bbox, road contact) ----------

def clean_plate(src: str) -> np.ndarray:
    frames = [f for a, b in CLEAN for f in read_frames(src, W, H, start=a, duration=b - a)]
    return np.median(np.stack(frames), axis=0).astype(np.float32)


class Tracker:
    """Keeps the mask on the car: blobs far from the last known car are grass in the wind."""

    def __init__(self) -> None:
        self.center: np.ndarray | None = None
        self.size = 0.0


def coarse_mask(frame: np.ndarray, plate: np.ndarray, track: Tracker) -> np.ndarray | None:
    s = W / 1600
    f = cv2.GaussianBlur(frame.astype(np.float32), (0, 0), 1.0)
    diff = np.abs(f - plate).max(axis=2)
    chroma = frame.max(axis=2).astype(np.int16) - frame.min(axis=2)
    binary = ((diff > 26) & ((chroma <= 70) | (diff > 70))).astype(np.uint8)
    binary[: int(H * ROI_TOP)] = 0
    k = lambda r: cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (max(3, int(r * s)) | 1,) * 2)
    binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, k(3))
    binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, k(15))
    n, labels, stats, cents = cv2.connectedComponentsWithStats(binary, 8)
    if n <= 1:
        return None
    areas = stats[1:, cv2.CC_STAT_AREA].astype(np.float32)
    keep = np.zeros(n, bool)
    if track.center is not None:
        reach = max(40 * s, np.sqrt(track.size) * 1.1)
        dist = np.linalg.norm(cents[1:] - track.center, axis=1)
        keep[1:] = (dist < reach) & (areas >= max(12 * s * s, track.size * 0.08))
    if not keep.any():
        if areas.max() < 2500 * s * s:
            track.center = None
            return None
        keep[1:] = areas >= areas.max() * 0.25
    mask = keep[labels].astype(np.uint8)
    ys, xs = np.nonzero(mask)
    track.center = np.array([xs.mean(), ys.mean()], np.float32)
    track.size = float(len(xs))
    return mask


# ---------- licence plate ----------

# The licence plate in the anchor frame (on the rear bumper, under the spare wheel):
# x, y, w, h in frame pixels at source second PLATE_ANCHOR_T.
PLATE_ANCHOR_T = 1.167
PLATE_RECESS = (797, 754, 64, 34)
PLATE_MIN_W = 12            # below this the plate is unreadable; stop blurring


def track_plate(src: str, first: int, last: int) -> dict[int, tuple[float, float, float]]:
    """Follow the plate recess from the anchor frame forwards and backwards by
    multi-scale template matching. Returns frame -> (centre x, centre y, scale)."""
    anchor = round(PLATE_ANCHOR_T * SRC_FPS)
    x, y, w, h = PLATE_RECESS
    grays: dict[int, np.ndarray] = {}
    for i, fr in enumerate(read_frames(src, W, H, start=0, duration=(last + 1) / SRC_FPS)):
        if i >= first:
            grays[i] = cv2.cvtColor(fr, cv2.COLOR_RGB2GRAY)
    templ = grays[anchor][y:y + h, x:x + w].astype(np.float32)
    found = {anchor: (x + w / 2, y + h / 2, 1.0)}
    for step in (1, -1):
        cx, cy, sc = found[anchor]
        vx = vy = 0.0
        i = anchor + step
        while first <= i <= last:
            best = None
            for f in (0.97, 0.985, 1.0, 1.015, 1.03):
                s2 = sc * f
                tw, th = max(8, int(round(w * s2))), max(4, int(round(h * s2)))
                t = cv2.resize(templ, (tw, th), interpolation=cv2.INTER_AREA)
                r = int(40 * s2 + 16)
                px, py = cx + vx, cy + vy
                sx0, sy0 = int(max(0, px - tw / 2 - r)), int(max(0, py - th / 2 - r))
                sx1, sy1 = int(min(W, px + tw / 2 + r)), int(min(H, py + th / 2 + r))
                area = grays[i][sy0:sy1, sx0:sx1].astype(np.float32)
                if area.shape[0] <= th or area.shape[1] <= tw:
                    continue
                res = cv2.matchTemplate(area, t, cv2.TM_CCOEFF_NORMED)
                _, score, _, loc = cv2.minMaxLoc(res)
                if best is None or score > best[0]:
                    best = (score, sx0 + loc[0] + tw / 2, sy0 + loc[1] + th / 2, s2)
            if best is None or best[0] < 0.45 or w * best[3] < PLATE_MIN_W:
                break
            _, nx, ny, sc = best
            vx, vy = nx - cx, ny - cy
            cx, cy = nx, ny
            found[i] = (cx, cy, sc)
            i += step
    return found


def smooth_track(found: dict[int, tuple[float, float, float]], r: int = 6) -> dict[int, tuple[float, float, float]]:
    """The matcher steps the scale 1.5% at a time, so the tracked scale hops from
    frame to frame while the car recedes smoothly; carried 200 px up to the roof,
    that hop shakes the aligned cutouts by several pixels. Each frame takes the
    value of a quadratic fitted to its neighbours within r frames."""
    idx = sorted(found)
    t = np.array(idx, np.float64)
    v = np.array([found[i] for i in idx], np.float64)
    out = {}
    for k, i in enumerate(idx):
        lo, hi = max(0, k - r), min(len(idx), k + r + 1)
        deg = min(2, hi - lo - 1)
        coef = np.polyfit(t[lo:hi] - i, v[lo:hi], deg)
        out[i] = tuple(float(c) for c in coef[-1])
    return out


def blur_plate(frame: np.ndarray, where: tuple[float, float, float]) -> np.ndarray:
    """Soft-edged blur over the plate recess: no hard rectangle, nothing readable."""
    cx, cy, sc = where
    w, h = PLATE_RECESS[2] * sc * 1.25, PLATE_RECESS[3] * sc * 1.5
    pad = int(max(w, h))
    x0, y0 = int(max(0, cx - w / 2 - pad)), int(max(0, cy - h / 2 - pad))
    x1, y1 = int(min(W, cx + w / 2 + pad)), int(min(H, cy + h / 2 + pad))
    region = frame[y0:y1, x0:x1].astype(np.float32)
    if region.size == 0:
        return frame
    k = max(5, (int(0.35 * w) // 2) * 2 + 1)
    blurred = cv2.GaussianBlur(region, (k, k), 0)
    m = np.zeros(region.shape[:2], np.float32)
    mx0, my0 = int(cx - w / 2) - x0, int(cy - h / 2) - y0
    m[max(0, my0):max(0, my0 + int(h)), max(0, mx0):max(0, mx0 + int(w))] = 1
    m = cv2.GaussianBlur(m, (0, 0), max(1.0, 0.12 * h))[..., None]
    out = frame.copy()
    out[y0:y1, x0:x1] = np.clip(region * (1 - m) + blurred * m + 0.5, 0, 255).astype(np.uint8)
    return out


# ---------- fine car matte ----------

_session = None


def _alpha_path(idx: int, bbox: tuple[int, int, int, int]) -> str:
    x0, y0, x1, y1 = bbox
    return os.path.join(CACHE, f"{idx:04d}_{x0}_{y0}_{x1}_{y1}.png")


def fine_alpha(frame: np.ndarray, bbox: tuple[int, int, int, int], idx: int) -> np.ndarray:
    """Car alpha over the whole plate, from BiRefNet on a crop around the car (cached)."""
    x0, y0, x1, y1 = bbox
    path = _alpha_path(idx, bbox)
    if os.path.exists(path):
        crop_a = np.asarray(Image.open(path)).astype(np.float32) / 255
    else:
        global _session
        if _session is None:
            from rembg import new_session

            _session = new_session("birefnet-general-lite")
        from rembg import remove

        m = remove(Image.fromarray(frame[y0:y1, x0:x1]), session=_session, only_mask=True)
        crop_a = np.asarray(m).astype(np.float32) / 255
        # Keep only the car: the largest piece and what touches it.
        n, labels, stats, _ = cv2.connectedComponentsWithStats((crop_a > 0.5).astype(np.uint8), 8)
        if n > 1:
            main = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
            region = cv2.dilate((labels == main).astype(np.uint8), np.ones((9, 9), np.uint8))
            crop_a = crop_a * region
        os.makedirs(CACHE, exist_ok=True)
        Image.fromarray((crop_a * 255 + 0.5).astype(np.uint8)).save(path)
    a = np.zeros((H, W), np.float32)
    a[y0:y1, x0:x1] = crop_a
    return a


@functools.lru_cache(maxsize=2 * TEMPORAL + 2)
def cached_alpha(idx: int, bbox: tuple[int, int, int, int]) -> np.ndarray:
    x0, y0, x1, y1 = bbox
    a = np.zeros((H, W), np.float32)
    a[y0:y1, x0:x1] = np.asarray(Image.open(_alpha_path(idx, bbox))).astype(np.float32) / 255
    return a


def _align(i: int, j: int, info: list[dict], plates: dict) -> np.ndarray:
    """Similarity transform carrying frame j's car onto frame i's: the tracked
    plate where both frames have it, else the box's bottom centre and width. A box
    cut by the frame's left edge (the close pass) has no meaningful centre or width:
    there the fronts are aligned, at the same scale."""
    if i in plates and j in plates:
        (cxi, cyi, si), (cxj, cyj, sj) = plates[i], plates[j]
    elif min(info[i]["box"][0], info[j]["box"][0]) == 0:
        return np.float32([[1, 0, info[i]["box"][2] - info[j]["box"][2]], [0, 1, 0]])
    else:
        bi, bj = info[i]["box"], info[j]["box"]
        cxi, cyi, si = (bi[0] + bi[2]) / 2, bi[3], bi[2] - bi[0]
        cxj, cyj, sj = (bj[0] + bj[2]) / 2, bj[3], bj[2] - bj[0]
    s = si / sj
    return np.float32([[s, 0, cxi - s * cxj], [0, s, cyi - s * cyj]])


def key_matte(d: dict) -> np.ndarray:
    """The car from its difference against the locked-off plate (pass 1's silhouette), softened
    a pixel. BiRefNet loses a car that fills its crop: on the close pass its cutout comes back
    holed or empty and the letters show through the door. The car's own outline against the
    empty road does not, so car_matte takes the larger of the two."""
    x0, y0, x1, y1 = d["bbox"]
    k = np.unpackbits(d["key"], count=(y1 - y0) * (x1 - x0)).reshape(y1 - y0, x1 - x0)
    a = np.zeros((H, W), np.float32)
    a[y0:y1, x0:x1] = cv2.GaussianBlur(k.astype(np.float32), (0, 0), 1.5)
    return a


def car_matte(i: int, info: list[dict], plates: dict, have: set[int]) -> np.ndarray:
    """The car as a solid, steady occluder for frame i.

    Median of the aligned cutouts of frames i-TEMPORAL..i+TEMPORAL (the car is
    rigid; the per-frame segmentation is not), made solid: no see-through glass
    or haze, no antenna or specks, no holes, and the gap under the car between
    the wheels closed, so the letter never blinks through it. That solid shape
    decides the inside (opaque) and the outside (clear); the few pixels of the
    edge keep the median's soft values, for a natural edge. (This frame's own
    cutout at the edge brought back its one-frame mistakes: an antenna stub, grey
    patches on the roof rack.)
    """
    stack = [
        cached_alpha(j, tuple(info[j]["bbox"])) if j == i
        else cv2.warpAffine(cached_alpha(j, tuple(info[j]["bbox"])), _align(i, j, info, plates), (W, H), flags=cv2.INTER_LINEAR)
        for j in range(i - TEMPORAL, i + TEMPORAL + 1) if j in have
    ]
    med = np.maximum(np.median(np.stack(stack), axis=0), key_matte(info[i]))
    ys, xs = np.nonzero(med > 0.5)
    out = np.zeros((H, W), np.float32)
    if not len(xs):
        return out
    m = 8
    x0, y0 = max(0, xs.min() - m), max(0, ys.min() - m)
    x1, y1 = min(W, xs.max() + m + 1), min(H, ys.max() + m + 1)
    b = (med[y0:y1, x0:x1] > 0.5).astype(np.uint8)
    b = cv2.morphologyEx(b, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
    n, labels, stats, _ = cv2.connectedComponentsWithStats(b, 8)
    if n > 1:
        b = (labels == 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))).astype(np.uint8)
    cut = b.copy()
    # Holes: what the outside cannot reach.
    pad = cv2.copyMakeBorder(b, 1, 1, 1, 1, cv2.BORDER_CONSTANT, value=0)
    reach = np.zeros((pad.shape[0] + 2, pad.shape[1] + 2), np.uint8)
    cv2.floodFill(pad, reach, (0, 0), 1)
    b = b | (reach[2:-2, 2:-2] == 0).astype(np.uint8)
    # Below the roof the Jeep is a box: fill its lower three quarters between the box's
    # sides (pass 1's extent, from the car's well-lit upper body). That closes the gap
    # under the car between the wheels, and the dark front (fender flares, grille,
    # bumper), which neither the cutout nor the plate difference holds against a dark road.
    bx0, by0, bx1, by1 = info[i]["box"]
    b[max(0, int(by0 + 0.25 * (by1 - by0)) - y0): max(0, by1 + 1 - y0), max(0, bx0 - x0): max(0, bx1 + 1 - x0)] = 1
    disc = lambda r: cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 1,) * 2)
    # Filled-in parts (holes, the gap under the car) are opaque to their edge.
    # The aligned shape can drift a pixel or two far from the plate (the roof), so
    # the edge band is wide enough to hold the true edge.
    inside = (cv2.erode(b, disc(3)) > 0) | ((b > 0) & (cut == 0))
    near = cv2.dilate(b, disc(5)) > 0
    edge = np.clip((med[y0:y1, x0:x1] - 0.1) / 0.8, 0, 1)
    out[y0:y1, x0:x1] = np.where(inside, 1.0, np.where(near, edge, 0.0))
    # Fast past the camera, the car is smeared along its path by the shutter: smear the matte's
    # edge the same way (half its front's travel per frame), so the letters fade into the blurred
    # front rather than a ragged cut flickering beside it. Grown by half the smear first, so the
    # smear lies outside the car and the car itself stays solid.
    near_i = [j for j in (i - 1, i + 1) if info[j]["car"]] or [i]
    smear = int(abs(info[near_i[-1]]["box"][2] - info[near_i[0]]["box"][2]) / max(1, near_i[-1] - near_i[0]) / 2)
    if smear < 3:
        return out
    return cv2.blur(cv2.dilate(out, np.ones((1, smear // 2 * 2 + 1), np.uint8)), (smear, 1))


def save_poster(frame: np.ndarray, out: str, stem: str) -> str:
    """Saves a poster named by its content, like the fleet cutouts, so a new frame never hides behind a
    cached optimised copy; removes the one it replaces. Returns the file name (HeroStage.tsx points at it)."""
    for old in glob.glob(os.path.join(out, f"{stem}-????????.webp*")) + glob.glob(os.path.join(out, f"{stem}.webp*")):
        os.remove(old)
    name = f"{stem}-{hashlib.sha1(frame.tobytes()).hexdigest()[:8]}.webp"
    save_webp(frame, os.path.join(out, name))
    return name


def main() -> None:
    out = out_dir("v2")
    src = source_path(SOURCE)
    dry = bool(os.environ.get("DRY"))

    # Pass 1: track the car (box, padded crop box, road contact).
    plate = clean_plate(src)
    track = Tracker()
    info: list[dict] = []
    for i, fr in enumerate(read_frames(src, W, H, start=0)):
        m = None if any(a <= i / SRC_FPS < b for a, b in CLEAN) else coarse_mask(fr, plate, track)
        if m is None:
            info.append({"car": False})
            continue
        ys, xs = np.nonzero(m)
        y0, y1 = ys.min(), ys.max()
        # x from the car's upper body, and the road contact inside those columns: the low sun
        # smears the car's shadow along the road beside it. (Upper 60%: on the close pass the
        # car's top is cut at ROI_TOP, and three quarters of what is left reached the shadow.)
        upper = ys <= y0 + 0.6 * (y1 - y0)
        x0, x1 = xs[upper].min(), xs[upper].max()
        y1 = ys[(xs >= x0) & (xs <= x1)].max()
        pad = int(0.18 * max(x1 - x0, y1 - y0)) + 8
        bbox = (max(0, x0 - pad), max(0, y0 - pad), min(W, x1 + pad), min(H, y1 + pad))
        # The car's silhouette against the plate, holes filled, inside the box's columns.
        key = np.zeros_like(m)
        cv2.drawContours(key, cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)[0], -1, 1, thickness=cv2.FILLED)
        key[:, :x0] = 0
        key[:, x1 + 1:] = 0
        info.append({"car": True, "box": [int(x0), int(y0), int(x1), int(y1)], "bbox": [int(v) for v in bbox], "contact": float(y1) / H,
                     "key": np.packbits(key[bbox[1]:bbox[3], bbox[0]:bbox[2]])})
    n_src = len(info)
    first_car = next(i for i, d in enumerate(info) if d["car"])
    last_car = max(i for i, d in enumerate(info) if d["car"])

    # Per layout: the frame the car's road contact rises past the baseline, where it turns from
    # in front of the word to behind it. The gap must hold the car around that frame; before
    # and after, the occlusion is simply correct.
    cross: dict[str, int] = {}
    crops: dict[str, tuple[int, int]] = {}
    words: dict[str, Word] = {}
    open_dx: dict[str, tuple[float, float]] = {}
    for name, (ink_w, baseline) in LAYOUTS.items():
        entered = next(i for i, d in enumerate(info) if d["car"] and d["contact"] > baseline)
        c = cross[name] = next(i for i in range(entered, n_src) if info[i]["car"] and info[i]["contact"] <= baseline)
        hold = [i for i in range(c - HOLD, c + HOLD + 1) if info[i]["car"]]
        car_l = min(info[i]["box"][0] for i in hold)
        car_r = max(info[i]["box"][2] for i in hold)
        pad = 0.1 * (car_r - car_l)
        gap_l, gap_r = car_l - pad, car_r + pad
        anchor = (gap_l + gap_r) / 2
        cx0, cw = crops[name] = (0, W) if name == "desktop" else (int(min(max(anchor - PHONE_W / 2, 0), W - PHONE_W)), PHONE_W)
        lo, hi = cx0 + MARGIN * cw, cx0 + cw - MARGIN * cw
        wd = Word(ink_w * cw, baseline, anchor, lo, hi)
        dx_l = min(0.0, gap_l - wd.l1)
        dx_r = max(0.0, gap_r - wd.r0)
        # Keep both halves in frame (the word is sized so the gap still fits).
        dx_r = min(dx_r, hi - wd.r1)
        dx_l = max(dx_l, lo - wd.l0)
        fits = wd.l1 + dx_l <= car_l and wd.r0 + dx_r >= car_r
        words[name], open_dx[name] = wd, (dx_l, dx_r)
        print(f"{name}: crosses {c / SRC_FPS:.2f} s, curtain opens from {c / SRC_FPS + OPEN[0]:.2f} s; word ink {wd.l0}-{wd.r1}, "
              f"split {wd.l1}|{wd.r0}; car in hold {car_l}-{car_r}; curtain dx {dx_l:.0f}/{dx_r:.0f}; car fits the gap: {fits}")

    start_i, end_i = round(START * SRC_FPS), n_src
    dissolve_n = round(DISSOLVE * SRC_FPS)
    lead_i = start_i - dissolve_n
    print(f"car from {first_car / SRC_FPS:.2f} s to {last_car / SRC_FPS:.2f} s; loop starts {START} s, "
          f"dissolve from {(end_i - dissolve_n) / SRC_FPS:.2f} s; loop {(end_i - start_i) / SRC_FPS:.2f} s")

    def word_at(name: str, i: int) -> np.ndarray:
        p = curtain(i, cross[name])
        dx_l, dx_r = open_dx[name]
        return words[name].at(p * dx_l, p * dx_r)

    def needs_alpha(name: str, i: int) -> bool:
        d = info[i]
        if not d["car"] or i >= cross[name]:
            return False
        x0, y0, x1, y1 = d["bbox"]
        return word_at(name, i)[y0:y1, x0:x1, 3].max() > 0.02

    todo = [i for i in range(n_src) if any(needs_alpha(name, i) for name in LAYOUTS)]
    uncached = [i for i in todo if not os.path.exists(_alpha_path(i, tuple(info[i]["bbox"])))]
    print("frames needing a fine matte:", len(todo), "not cached yet:", len(uncached))
    if dry:
        for name, (cx0, cw) in crops.items():
            fr = next(read_frames(src, W, H, start=cross[name] / SRC_FPS, duration=0.1)).astype(np.float32)
            comp = composite(fr, word_at(name, cross[name]))[:, cx0:cx0 + cw]
            save_webp(np.clip(comp, 0, 255).astype(np.uint8), os.path.join(SRC, "_debug", f"v2-curtain-{name}.webp"))
        return
    plates = smooth_track(track_plate(src, first_car, n_src - 1))
    print("plate tracked in", len(plates), "frames:", min(plates), "to", max(plates))

    # Cutouts for every frame that needs a matte and its neighbours (the median's window).
    need = sorted({j for i in todo for j in range(i - TEMPORAL, i + TEMPORAL + 1) if 0 <= j < n_src and info[j]["car"]})
    missing = {j for j in need if not os.path.exists(_alpha_path(j, tuple(info[j]["bbox"])))}
    print("cutouts in the median windows:", len(need), "to compute:", len(missing))
    if missing:
        for j, fr in enumerate(read_frames(src, W, H, start=0, duration=(max(missing) + 1) / SRC_FPS)):
            if j in missing:
                fine_alpha(fr, tuple(info[j]["bbox"]), j)
    have = set(need)

    check = os.environ.get("CHECK")
    if check:
        # Before/after crops of the listed frames: per-frame cutout vs the matte used.
        lo_i, hi_i = (int(v) for v in check.split("-"))
        todo_set = set(todo)
        for i, fr in enumerate(read_frames(src, W, H, start=lo_i / SRC_FPS, duration=(hi_i - lo_i + 1) / SRC_FPS), start=lo_i):
            if i > hi_i or i not in todo_set:
                continue
            x0, y0, x1, y1 = info[i]["bbox"]
            x0, y0, x1, y1 = max(0, x0 - 80), max(0, y0 - 80), min(W, x1 + 80), min(H, y1 + 40)
            cover = word_at("desktop", i)
            f = fr.astype(np.float32)
            tiles = []
            for a in (cached_alpha(i, tuple(info[i]["bbox"])), car_matte(i, info, plates, have)):
                tiles.append(np.clip(composite(f, cover, a), 0, 255).astype(np.uint8)[y0:y1, x0:x1])
            save_webp(np.concatenate(tiles, axis=1), os.path.join(SRC, "_debug", f"v2-matte-{i:04d}.webp"))
        return

    # Pass 2: composite, loop.
    tag = {name: "" if name == "desktop" else f"-{name}" for name in LAYOUTS}  # film.*, film-phone.*; poster-*, poster-phone-*
    encs = {name: Encoder(os.path.join(out, f"film{tag[name]}"), cw, H, f"{SRC_FPS}/1") for name, (_, cw) in crops.items()}
    lead: dict[str, list[np.ndarray]] = {k: [] for k in crops}
    poster_i = {name: round(t * SRC_FPS) for name, t in POSTER_SRC_T.items()}
    posters: dict[str, str] = {}
    done = 0
    for i, fr in enumerate(read_frames(src, W, H, start=0)):
        if i < lead_i:
            continue
        if i >= end_i:
            break
        front = {name: needs_alpha(name, i) for name in LAYOUTS}
        a = None
        if any(front.values()):
            a = car_matte(i, info, plates, have)
            done += 1
            if done % 20 == 0:
                print(f"matte {done}/{len(todo)}", flush=True)
        if i in plates:
            fr = blur_plate(fr, plates[i])
        f = fr.astype(np.float32)
        for name, (cx0, cw) in crops.items():
            comp = composite(f, word_at(name, i), a if front[name] else None)[:, cx0:cx0 + cw]
            comp8 = np.clip(comp + 0.5, 0, 255).astype(np.uint8)
            if i == poster_i[name]:
                posters[name] = save_poster(comp8, out, f"poster{tag[name]}")
            if i < start_i:
                lead[name].append(comp8)
                continue
            tail_k = i - (end_i - dissolve_n)
            if 0 <= tail_k < dissolve_n:
                w = (tail_k + 1) / dissolve_n   # the last frame is all lead: the frame just before the loop's first
                comp8 = (comp8.astype(np.float32) * (1 - w) + lead[name][tail_k].astype(np.float32) * w + 0.5).astype(np.uint8)
            encs[name].write(comp8)

    for name, enc in encs.items():
        print(name, enc.close(small=name == "desktop"))
    poster_t = {name: round((pi - start_i) / SRC_FPS, 3) for name, pi in poster_i.items()}
    print("posters", posters, "at film time", poster_t, "(HeroStage.tsx: POSTER_TIME and the files); phone crop x0", crops["phone"][0])


if __name__ == "__main__":
    main()
