"""Embed each shipped raster's origin into the file (Impeccable provenance).

Only the hero posters are generated (frames of the AI-generated hero film); the
rest are the client's own photos, cutouts of Wikimedia Commons model photos,
or cutouts of the client's logo. The embedded text says where each came
from and which script made it, so the file explains itself after it leaves
this repo. Run after any script in this folder rewrites a raster.

Environment: IMPECCABLE = path to the impeccable launcher.
"""

import glob
import os
import subprocess

from common import OUT, sources
from fleet import CARS
from photos import PHOTOS
from v2_bake import POSTER_SRC_T, SOURCE


def origin(key: str) -> str:
    s = sources()[key]
    return f"{s['made']} ({s['license']})"


def poster(stem: str) -> str:
    """A hero poster's path under OUT (v2_bake.py names them by content)."""
    return "v2/" + os.path.basename(glob.glob(os.path.join(OUT, "v2", f"{stem}-????????.webp"))[0])


ORIGINS = {
    poster("poster"): f"Baked frame at {POSTER_SRC_T['desktop']} s of the hero film, {origin(SOURCE)}: the logo's JOOX drawn in, plate blurred. Made by scripts/media/v2_bake.py.",
    poster("poster-phone"): f"Phone crop (890x1080) of the baked frame at {POSTER_SRC_T['phone']} s of the hero film, {origin(SOURCE)}. Made by scripts/media/v2_bake.py.",
    **{
        "fleet/" + os.path.basename(glob.glob(os.path.join(OUT, "fleet", f"{slug}-side-*.webp"))[0]): (
            f"Side-profile showroom cutout of a model photo for the client's car: the Wikimedia Commons photo \"{car['commons']}\" by {car['author']} "
            f"({car['license']}, https://commons.wikimedia.org/wiki/File:{car['commons'].replace(' ', '_')})"
            if "commons" in car
            else f"Showroom cutout of the client's own photo of the car ({car['file']})"
        )
        + f", plates softened, {'paint recoloured to the client’s colour, ' if car.get('paint') else ''}{'mirrored, ' if car.get('mirror') else ''}cut out with BiRefNet, levelled on its tyres, with a ground shadow drawn from its own silhouette. "
        "Made by scripts/media/fleet.py."
        for slug, car in CARS.items()
    },
    **{
        f"photos/{pid}.webp": f"The client's own photo ({src}), as sent through a chat app at 1280 px"
        f"{', plates softened' if plates else ''}{', a bystander blurred' if people else ''}{', shadows lifted' if amount else ''}, metadata removed. "
        "Made by scripts/media/photos.py."
        for pid, (src, plates, people, amount) in PHOTOS.items()
    },
    "../brand/joox-cars-mark.webp": "JOOX CARS mark (JOOX and CARS, no tagline) cut from the client's logo raster (references/brand/joox-cars-logo.png): "
    "white background unmixed to transparency (alpha = 1 - darkest channel), trimmed, 240 px tall. A stand-in until the vector logo arrives.",
    "../brand/joox-cars-mark-reversed.webp": "Reversed JOOX CARS mark for the header over the hero film: the mark cutout (public/brand/joox-cars-mark.webp, from the client's logo raster) with its near-black ink swapped for white and the yellow kept, each pixel read as a yellow/black mix from its red channel. Made by scripts/media/brand_reversed.py.",
    "../brand/joox-cars-lockup.webp": "JOOX CARS lockup with the tagline 'Driven by eternal purpose', cut from the client's logo raster (references/brand/joox-cars-logo.png): "
    "white background unmixed to transparency (alpha = 1 - darkest channel), trimmed, 320 px tall. A stand-in until the vector logo arrives.",
}


def main() -> None:
    launcher = os.environ.get("IMPECCABLE", "impeccable")
    for rel, text in ORIGINS.items():
        path = os.path.join(OUT, rel)
        subprocess.run([launcher, "embed-prompt", path, "--prompt", text], check=True)
    subprocess.run([launcher, "embed-prompt", "--scan", OUT], check=False)
    subprocess.run([launcher, "embed-prompt", "--scan", os.path.join(OUT, "..", "brand")], check=False)


if __name__ == "__main__":
    main()
