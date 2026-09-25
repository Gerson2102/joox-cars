"""V2 · The car drives through the word, baked into one film.

The word is drawn into every frame offline instead of being composited live in
the browser. Far to near: forest road (plate) → the word, standing on the road
at its baseline → the SUV while it is nearer than the word.

The curtain: as the car reaches the word, the letters part at the split
(JO | OX, between the two O's of the logo's infinity) like a curtain, the car
drives through the gap, and the letters close behind it. The car turns from
"in front" to "behind" while the gap is open, so the change is never seen.

The car's cutout comes from a segmentation model (BiRefNet, via rembg), run on
a crop around the car. The crop comes from background subtraction against the
car-free first 1.8 s. The cutout is only needed while the car is in front and
overlaps the letters; those alphas are cached in .media-src/_cache/v2 so re-runs
skip the model. A single frame's cutout flickers and is soft (glass, the gap
under the car, the antenna), which reads as the letter turning see-through
around the car. The matte actually used is steadied: the median of the
neighbouring frames' cutouts, aligned on the tracked licence plate (its track
smoothed), made solid, edge included.

Pace: the clip plays at SPEED using every source frame (the output frame rate
is raised instead of dropping frames). The loop runs from START to the end of
the clip, after the car has driven out of frame, and closes with a short
dissolve between empty road and empty road, so nothing vanishes.

Two layouts, one render each:
  desktop  1920x1080, word 44% of the width, split centred on the car's path
  phone    890x1080 crop centred on the car's crossing point, word 58% of the crop

Outputs in public/media/v2/:
  film.av1.mp4/.mp4, film-720.*   desktop layout (1080p and 1280 wide)
  film-phone.av1.mp4/.mp4         phone layout
  poster.webp, poster-phone.webp  the frame at POSTER_SRC_T (LCP images)

The stand-in car's licence plate is blurred in every frame.

Environment: FFMPEG as in common.py. WORD and SPLIT (letters before the split)
override the word, e.g. for another language.
"""

import functools
import json
import os

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

from common import SRC, Encoder, grade, out_dir, read_frames, save_webp, source_path

W, H = 1920, 1080
SRC_FPS = 24000 / 1001
SPEED = 1.4                       # playback speed; the output keeps every source frame
OUT_FPS = f"{round(24000 * SPEED)}/1001"
START = 1.2                       # source second the loop starts at (road still empty)
DISSOLVE = 0.35                   # output seconds of the loop dissolve (empty road both sides)
POSTER_SRC_T = 5.0                # source second of the poster (car in front of the word)
BG_RANGE = (0.0, 1.8)             # car-free seconds for the clean plate
ROI_TOP = 0.46                    # the car never rises above this fraction of the frame
BASELINE = 0.8                    # the word's baseline, fraction of the frame height
WORD = os.environ.get("WORD", "JOOX")
SPLIT = int(os.environ.get("SPLIT", "2"))
BONE = np.array([0xF1, 0xEC, 0xE3], np.float32)
# Provisional face, close to the logo's heavy JOOX; re-bake when the site's display face is chosen.
FONT = os.path.join(SRC, "Archivo.ttf")
FONT_URL = "https://github.com/google/fonts/raw/main/ofl/archivo/Archivo%5Bwdth,wght%5D.ttf"
FONT_AXES = [800, 100]            # Weight, Width
CACHE = os.path.join(SRC, "_cache", "v2")
PHONE_W = 890
MARGIN = 0.03                     # min distance from the frame edge, fraction of the layout width

TEMPORAL = 2                      # the car matte is the median of the cutouts this many frames either side

# Curtain timing, source seconds relative to the car crossing the word's baseline.
OPEN = (-1.3, -0.35)
CLOSE = (0.7, 1.7)

# name: word ink width as a fraction of the layout width
LAYOUT_WORD = {"desktop": 0.44, "phone": 0.58}


# ---------- the word ----------

def _font(size: float) -> ImageFont.FreeTypeFont:
    if not os.path.exists(FONT):
        import urllib.request

        os.makedirs(SRC, exist_ok=True)
        urllib.request.urlretrieve(FONT_URL, FONT)
    f = ImageFont.truetype(FONT, max(1, int(round(size))))
    f.set_variation_by_axes(FONT_AXES)
    return f


def _ink_x(mask: np.ndarray) -> tuple[int, int]:
    cols = np.nonzero(mask.max(axis=0) > 0.02)[0]
    return int(cols.min()), int(cols.max()) + 1


class Word:
    """The word as two groups (before and after the split), each a coverage
    mask over the plate at rest, with measured ink edges in plate pixels."""

    def __init__(self, ink_w: float, anchor_x: float, lo: float, hi: float, ss: int = 3):
        # Size from a measured render so the ink (not the advance) is ink_w wide.
        probe = _font(400)
        img = Image.new("L", (int(probe.getlength(WORD)) + 400, 600), 0)
        ImageDraw.Draw(img).text((100, 500), WORD, font=probe, fill=255, anchor="ls")
        x0, x1 = _ink_x(np.asarray(img) / 255)
        size = 400 * ink_w / (x1 - x0)
        big = _font(size * ss)
        left, right = WORD[:SPLIT], WORD[SPLIT:]
        adv = big.getlength(left)
        base = BASELINE * H * ss

        def render(text: str, pen_x: float) -> np.ndarray:
            c = Image.new("L", (W * ss, H * ss), 0)
            ImageDraw.Draw(c).text((pen_x, base), text, font=big, fill=255, anchor="ls")
            return np.asarray(c.resize((W, H), Image.Resampling.BOX)).astype(np.float32) / 255

        # Render at pen 0 to measure, then place the split centre on anchor_x,
        # clamped so the whole word stays inside [lo, hi].
        L, R = render(left, 0), render(right, adv)
        l0, l1 = _ink_x(L)
        r0, r1 = _ink_x(R)
        split_c = (l1 + r0) / 2
        shift = anchor_x - split_c
        shift = min(max(shift, lo - l0), hi - r1)
        self.L = render(left, shift * ss)
        self.R = render(right, adv + shift * ss)
        self.l0, self.l1 = _ink_x(self.L)
        self.r0, self.r1 = _ink_x(self.R)

    def at(self, dx_l: float, dx_r: float) -> np.ndarray:
        if dx_l == 0 and dx_r == 0:
            return np.maximum(self.L, self.R)
        m_l = cv2.warpAffine(self.L, np.float32([[1, 0, dx_l], [0, 1, 0]]), (W, H), flags=cv2.INTER_LINEAR)
        m_r = cv2.warpAffine(self.R, np.float32([[1, 0, dx_r], [0, 1, 0]]), (W, H), flags=cv2.INTER_LINEAR)
        return np.maximum(m_l, m_r)


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

def clean_plate(src: str, vf: str) -> np.ndarray:
    frames = list(read_frames(src, vf, W, H, start=BG_RANGE[0], duration=BG_RANGE[1] - BG_RANGE[0]))
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

# The plate recess on the tailgate in the anchor frame (plate at its centre):
# x, y, w, h in plate pixels at source second PLATE_ANCHOR_T.
PLATE_ANCHOR_T = 5.0
PLATE_RECESS = (965, 797, 99, 39)
PLATE_MIN_W = 12            # below this the plate is unreadable; stop blurring


def track_plate(src: str, vf: str, first: int, last: int) -> dict[int, tuple[float, float, float]]:
    """Follow the plate recess from the anchor frame forwards and backwards by
    multi-scale template matching. Returns frame -> (centre x, centre y, scale)."""
    anchor = round(PLATE_ANCHOR_T * SRC_FPS)
    x, y, w, h = PLATE_RECESS
    grays: dict[int, np.ndarray] = {}
    for i, fr in enumerate(read_frames(src, vf, W, H, start=0, duration=(last + 1) / SRC_FPS)):
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
    plate where both frames have it, else the box's bottom centre and width."""
    if i in plates and j in plates:
        (cxi, cyi, si), (cxj, cyj, sj) = plates[i], plates[j]
    else:
        bi, bj = info[i]["box"], info[j]["box"]
        cxi, cyi, si = (bi[0] + bi[2]) / 2, bi[3], bi[2] - bi[0]
        cxj, cyj, sj = (bj[0] + bj[2]) / 2, bj[3], bj[2] - bj[0]
    s = si / sj
    return np.float32([[s, 0, cxi - s * cxj], [0, s, cyi - s * cyj]])


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
    med = np.median(np.stack(stack), axis=0)
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
    # Under the car: close horizontal gaps in the lower part (between the wheels).
    # Padded with background first: erosion counts pixels beyond the border as set,
    # so an unpadded close filled whole rows out to the mirrors' width and cut
    # notches in the letters beside the bumper.
    rows = np.nonzero(b.any(axis=1))[0]
    cols = np.nonzero(b.any(axis=0))[0]
    if len(rows) and len(cols):
        low = int(rows.min() + 0.6 * (rows.max() - rows.min()))
        width = int(cols.max() - cols.min()) + 1
        lowp = cv2.copyMakeBorder(b[low:], 0, 0, width, width, cv2.BORDER_CONSTANT, value=0)
        b[low:] = cv2.morphologyEx(lowp, cv2.MORPH_CLOSE, np.ones((1, width), np.uint8))[:, width:-width]
    disc = lambda r: cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 1,) * 2)
    # Filled-in parts (holes, the gap under the car) are opaque to their edge.
    # The aligned shape can drift a pixel or two far from the plate (the roof), so
    # the edge band is wide enough to hold the true edge.
    inside = (cv2.erode(b, disc(3)) > 0) | ((b > 0) & (cut == 0))
    near = cv2.dilate(b, disc(5)) > 0
    edge = np.clip((med[y0:y1, x0:x1] - 0.1) / 0.8, 0, 1)
    out[y0:y1, x0:x1] = np.where(inside, 1.0, np.where(near, edge, 0.0))
    return out


def main() -> None:
    out = out_dir("v2")
    src = source_path("forest")
    vf = grade("forest")
    dry = bool(os.environ.get("DRY"))

    # Pass 1: track the car (box, padded crop box, road contact).
    plate = clean_plate(src, vf)
    track = Tracker()
    info: list[dict] = []
    for i, fr in enumerate(read_frames(src, vf, W, H, start=0)):
        m = coarse_mask(fr, plate, track) if i / SRC_FPS >= BG_RANGE[1] else None
        if m is None:
            info.append({"car": False})
            continue
        ys, xs = np.nonzero(m)
        x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
        pad = int(0.18 * max(x1 - x0, y1 - y0)) + 8
        bbox = (max(0, x0 - pad), max(0, y0 - pad), min(W, x1 + pad), min(H, y1 + pad))
        info.append({"car": True, "box": [int(x0), int(y0), int(x1), int(y1)], "bbox": [int(v) for v in bbox], "contact": float(y1) / H})
    n_src = len(info)
    last_car = max(i for i, d in enumerate(info) if d["car"])

    entered = next(i for i, d in enumerate(info) if d["car"] and d["contact"] > BASELINE)
    cross = next(i for i in range(entered, n_src) if info[i]["car"] and info[i]["contact"] <= BASELINE)

    # The gap must hold the car around the crossing, where it turns from in front
    # of the word to behind it; before and after, the occlusion is simply correct.
    hold = [i for i in range(cross - 3, cross + 4) if info[i]["car"]]
    car_l = min(info[i]["box"][0] for i in hold)
    car_r = max(info[i]["box"][2] for i in hold)
    pad = 0.1 * (car_r - car_l)
    gap_l, gap_r = car_l - pad, car_r + pad
    anchor = (gap_l + gap_r) / 2

    phone_x0 = int(min(max(anchor - PHONE_W / 2, 0), W - PHONE_W))
    crops = {"desktop": (0, W), "phone": (phone_x0, PHONE_W)}
    words: dict[str, Word] = {}
    open_dx: dict[str, tuple[float, float]] = {}
    for name, (cx0, cw) in crops.items():
        lo, hi = cx0 + MARGIN * cw, cx0 + cw - MARGIN * cw
        wd = Word(LAYOUT_WORD[name] * cw, anchor, lo, hi)
        dx_l = min(0.0, gap_l - wd.l1)
        dx_r = max(0.0, gap_r - wd.r0)
        # Keep both halves in frame (the word is sized so the gap still fits).
        dx_r = min(dx_r, hi - wd.r1)
        dx_l = max(dx_l, lo - wd.l0)
        fits = wd.l1 + dx_l <= car_l and wd.r0 + dx_r >= car_r
        words[name], open_dx[name] = wd, (dx_l, dx_r)
        print(f"{name}: word ink {wd.l0}-{wd.r1}, split {wd.l1}|{wd.r0}; car in hold {car_l}-{car_r}; "
              f"curtain dx {dx_l:.0f}/{dx_r:.0f}; car fits the gap: {fits}")

    start_i, end_i = round(START * SRC_FPS), n_src
    dissolve_n = round(DISSOLVE * SPEED * SRC_FPS)
    lead_i = start_i - dissolve_n
    print(f"entered {entered / SRC_FPS:.2f} s; crosses {cross / SRC_FPS:.2f} s; last car frame {last_car / SRC_FPS:.2f} s; "
          f"dissolve from {(end_i - dissolve_n) / SRC_FPS:.2f} s (the car is behind the grass on the left by ~18 s); "
          f"loop {(end_i - start_i) / (SRC_FPS * SPEED):.2f} s")

    def word_at(name: str, i: int) -> np.ndarray:
        p = curtain(i, cross)
        dx_l, dx_r = open_dx[name]
        return words[name].at(p * dx_l, p * dx_r)

    def needs_alpha(i: int) -> bool:
        d = info[i]
        if not d["car"] or i >= cross:
            return False
        x0, y0, x1, y1 = d["bbox"]
        return any(word_at(name, i)[y0:y1, x0:x1].max() > 0.02 for name in crops)

    todo = [i for i in range(n_src) if needs_alpha(i)]
    uncached = [i for i in todo if not any(f.startswith(f"{i:04d}_") for f in os.listdir(CACHE))] if os.path.isdir(CACHE) else todo
    print("frames needing a fine matte:", len(todo), "not cached yet:", len(uncached))
    if dry:
        fr = next(read_frames(src, vf, W, H, start=cross / SRC_FPS, duration=0.1)).astype(np.float32)
        for name, (cx0, cw) in crops.items():
            wm = word_at(name, cross)[..., None]
            comp = (fr * (1 - wm) + BONE * wm)[:, cx0:cx0 + cw]
            save_webp(np.clip(comp, 0, 255).astype(np.uint8), os.path.join(SRC, "_debug", f"v2-curtain-{name}.webp"))
        return
    plates = smooth_track(track_plate(src, vf, entered, n_src - 1))
    print("plate tracked in", len(plates), "frames:", min(plates), "to", max(plates))

    # Cutouts for every frame that needs a matte and its neighbours (the median's window).
    need = sorted({j for i in todo for j in range(i - TEMPORAL, i + TEMPORAL + 1) if 0 <= j < n_src and info[j]["car"]})
    missing = {j for j in need if not os.path.exists(_alpha_path(j, tuple(info[j]["bbox"])))}
    print("cutouts in the median windows:", len(need), "to compute:", len(missing))
    if missing:
        for j, fr in enumerate(read_frames(src, vf, W, H, start=0, duration=(max(missing) + 1) / SRC_FPS)):
            if j in missing:
                fine_alpha(fr, tuple(info[j]["bbox"]), j)
    have = set(need)

    check = os.environ.get("CHECK")
    if check:
        # Before/after crops of the listed frames: per-frame cutout vs steadied matte.
        lo_i, hi_i = (int(v) for v in check.split("-"))
        todo_set = set(todo)
        for i, fr in enumerate(read_frames(src, vf, W, H, start=lo_i / SRC_FPS, duration=(hi_i - lo_i + 1) / SRC_FPS), start=lo_i):
            if i > hi_i or i not in todo_set:
                continue
            x0, y0, x1, y1 = info[i]["bbox"]
            x0, y0, x1, y1 = max(0, x0 - 80), max(0, y0 - 80), min(W, x1 + 80), min(H, y1 + 40)
            cover = word_at("desktop", i)
            f = fr.astype(np.float32)
            tiles = []
            for a in (cached_alpha(i, tuple(info[i]["bbox"])), car_matte(i, info, plates, have)):
                c = cover * (1 - a)
                tiles.append(np.clip(f * (1 - c[..., None]) + BONE * c[..., None], 0, 255).astype(np.uint8)[y0:y1, x0:x1])
            save_webp(np.concatenate(tiles, axis=1), os.path.join(SRC, "_debug", f"v2-matte-{i:04d}.webp"))
        return

    # Pass 2: composite, retime, loop.
    widths = {name: cw for name, (_, cw) in crops.items()}
    encs = {
        "desktop": Encoder(os.path.join(out, "film"), W, H, OUT_FPS),
        "phone": Encoder(os.path.join(out, "film-phone"), widths["phone"], H, OUT_FPS),
    }
    lead: dict[str, list[np.ndarray]] = {k: [] for k in crops}
    poster_i = round(POSTER_SRC_T * SRC_FPS)
    done = 0
    for i, fr in enumerate(read_frames(src, vf, W, H, start=0)):
        if i < lead_i:
            continue
        if i >= end_i:
            break
        a = None
        if needs_alpha(i):
            a = car_matte(i, info, plates, have)
            done += 1
            if done % 20 == 0:
                print(f"matte {done}/{len(todo)}", flush=True)
        if i in plates:
            fr = blur_plate(fr, plates[i])
        f = fr.astype(np.float32)
        for name, (cx0, cw) in crops.items():
            cover = word_at(name, i)
            if a is not None:
                cover = cover * (1 - a)
            comp = (f * (1 - cover[..., None]) + BONE * cover[..., None])[:, cx0:cx0 + cw]
            comp8 = np.clip(comp + 0.5, 0, 255).astype(np.uint8)
            if i == poster_i:
                save_webp(comp8, os.path.join(out, "poster.webp" if name == "desktop" else "poster-phone.webp"))
            if i < start_i:
                lead[name].append(comp8)
                continue
            tail_k = i - (end_i - dissolve_n)
            if 0 <= tail_k < dissolve_n:
                w = (tail_k + 1) / (dissolve_n + 1)
                comp8 = (comp8.astype(np.float32) * (1 - w) + lead[name][tail_k].astype(np.float32) * w + 0.5).astype(np.uint8)
            encs[name].write(comp8)

    poster_t = round((poster_i - start_i) / (SRC_FPS * SPEED), 3)
    for name, enc in encs.items():
        print(name, enc.close(small=name == "desktop"))
    with open(os.path.join(CACHE, "timing.json"), "w", encoding="utf-8") as fh:
        json.dump({"posterTime": poster_t, "phoneX0": phone_x0,
                   "curtain_out_s": [round((cross + OPEN[0] * SRC_FPS - start_i) / (SRC_FPS * SPEED), 2),
                                     round((cross + CLOSE[1] * SRC_FPS - start_i) / (SRC_FPS * SPEED), 2)]}, fh)
    print("poster at film time", poster_t, "; phone crop x0", phone_x0)


if __name__ == "__main__":
    main()
