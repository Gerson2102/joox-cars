"""Shared helpers for the hero film (v2_bake.py).

The plate goes through two steps: a per-shot balance (exposure and white
balance) and the shared LOOK (the grade).

Environment:
  FFMPEG     path to ffmpeg (default: "ffmpeg")
  MEDIA_SRC  folder holding the downloaded sources (default: <project>/.media-src)
"""

import json
import os
import subprocess
import urllib.request

import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
FFMPEG = os.environ.get("FFMPEG", "ffmpeg")
SRC = os.environ.get("MEDIA_SRC", os.path.join(ROOT, ".media-src"))
OUT = os.path.join(ROOT, "public", "media")

# The one grade: greens pulled to olive, teal shadows, amber highlights, a soft
# filmic curve with lifted blacks and rolled-off whites.
LOOK = (
    "huesaturation=hue=-14:saturation=-0.42:colors=g+y,"
    "eq=saturation=0.84,"
    "colorbalance=rs=-0.07:gs=0.0:bs=0.07:rm=0.015:gm=-0.01:bm=-0.015:rh=0.08:gh=0.03:bh=-0.07,"
    "curves=master='0/0.025 0.25/0.215 0.5/0.49 0.78/0.8 1/0.965'"
)

# Per-shot balance, applied before LOOK.
BALANCE = {
    "forest": "eq=gamma=0.82:contrast=1.05,colortemperature=temperature=5600",
}


def grade(shot: str) -> str:
    return f"{BALANCE[shot]},{LOOK}"


def sources() -> dict:
    with open(os.path.join(os.path.dirname(__file__), "sources.json"), encoding="utf-8") as f:
        return json.load(f)


def source_path(key: str) -> str:
    """Return the local path of a source, downloading it once if missing."""
    entry = sources()[key]
    path = os.path.join(SRC, entry["file"])
    if not os.path.exists(path):
        os.makedirs(SRC, exist_ok=True)
        req = urllib.request.Request(entry["download"], headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req) as r, open(path, "wb") as f:
            f.write(r.read())
    return path


def out_dir(name: str) -> str:
    path = os.path.join(OUT, name)
    os.makedirs(path, exist_ok=True)
    return path


def ff(*args: str) -> None:
    subprocess.run([FFMPEG, "-loglevel", "error", "-y", *args], check=True)


def read_frames(path: str, vf: str, w: int, h: int, start: float = 0.0, duration: float | None = None):
    """Yield graded RGB frames (uint8, HxWx3) from a video."""
    args = [FFMPEG, "-loglevel", "error", "-ss", str(start)]
    if duration is not None:
        args += ["-t", str(duration)]
    args += ["-i", path, "-vf", f"{vf},scale={w}:{h}:flags=lanczos", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
    proc = subprocess.Popen(args, stdout=subprocess.PIPE)
    size = w * h * 3
    while True:
        buf = proc.stdout.read(size)
        if len(buf) < size:
            break
        yield np.frombuffer(buf, np.uint8).reshape(h, w, 3)
    proc.wait()






class Encoder:
    """Pipe raw RGB frames into ffmpeg and write one AV1 MP4 and one H.264 MP4.

    Frames are written to a lossless intermediate first so both codecs encode
    the same pixels.
    """

    def __init__(self, out_base: str, w: int, h: int, fps: str = "24000/1001"):
        self.out_base, self.w, self.h, self.fps = out_base, w, h, fps
        self.tmp = out_base + ".intermediate.mkv"
        self.proc = subprocess.Popen(
            [FFMPEG, "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
             "-s", f"{w}x{h}", "-r", fps, "-i", "-", "-c:v", "ffv1", "-pix_fmt", "gbrp", self.tmp],
            stdin=subprocess.PIPE,
        )
        self.count = 0

    def write(self, frame: np.ndarray) -> None:
        self.proc.stdin.write(np.ascontiguousarray(frame, dtype=np.uint8).tobytes())
        self.count += 1

    def close(self, max_mb: float = 3.8, small: bool = True) -> dict:
        self.proc.stdin.close()
        self.proc.wait()
        num, den = (int(x) for x in self.fps.split("/"))
        return encode_file(self.tmp, self.out_base, self.count * den / num, max_mb, small)


# Browsers decode untagged HD video as BT.709. Intermediates stay RGB (gbrp) and
# the final YUV conversion is explicitly BT.709 and tagged, so a film decodes to
# the same pixels as its poster and cutouts.
BT709 = ["-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv"]


def _encode(tmp: str, out_base: str, duration: float, max_mb: float, width: int | None) -> dict:
    """AV1 (`.av1.mp4`, what most browsers play) and H.264 (`.mp4`, the fallback), both
    at constant quality capped by the size budget, so easy shots come out well under it."""
    kbps = int(min(max_mb * 8 * 1024 / duration * 0.92, 3200))
    scale = f"scale={width}:-2:flags=lanczos:out_color_matrix=bt709:out_range=tv" if width else "scale=out_color_matrix=bt709:out_range=tv"
    common = ["-vf", f"{scale},format=yuv420p", *BT709, "-movflags", "+faststart", "-an"]
    ff("-i", tmp, "-c:v", "libaom-av1", "-crf", "30", "-b:v", f"{int(kbps * 0.6)}k",
       "-cpu-used", "4", "-row-mt", "1", "-tiles", "2x2", *common, out_base + ".av1.mp4")
    ff("-i", tmp, "-c:v", "libx264", "-preset", "slower", "-profile:v", "high", "-level", "4.2",
       "-crf", "22", "-maxrate", f"{kbps}k", "-bufsize", f"{kbps * 2}k", *common, out_base + ".mp4")
    return {k: round(os.path.getsize(out_base + ext) / 1048576, 2) for k, ext in (("av1_mb", ".av1.mp4"), ("mp4_mb", ".mp4"))}


def encode_file(tmp: str, out_base: str, duration: float, max_mb: float = 3.8, small: bool = True) -> dict:
    """Encode a lossless RGB intermediate to AV1 + H.264 under a size budget, plus
    (unless `small` is False) a 1280-wide pair (`-720`) for screens up to 900px,
    then delete it."""
    full = _encode(tmp, out_base, duration, max_mb, None)
    result = {"duration": round(duration, 2), **full}
    if small:
        result["720"] = _encode(tmp, out_base + "-720", duration, max_mb * 0.42, 1280)
    os.remove(tmp)
    return result


def save_webp(frame: np.ndarray, path: str, quality: int = 88) -> None:
    from PIL import Image

    Image.fromarray(frame).save(path, "WEBP", quality=quality, method=6)
