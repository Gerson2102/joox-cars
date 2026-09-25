# Assets

The cars on the homepage are the client's own: the rental fleet, the car for sale and the client's imports, from photos the client sent (`public/media/photos/`, and the showroom cutouts in `public/media/fleet/`). The showroom shows each car in side profile through a Wikimedia Commons photo of its model (recoloured to the client's paint where needed), labelled "Foto del modelo" / "Model photo" and credited; the client's own photos of each car open from "Ver fotos".

The hero film is a **stand-in**: free-license stock (Mixkit) used until the client's own shoot arrives. The footer says so ("El video de portada es de muestra…"); the hero itself carries no label.

The logo files in `public/brand/` are the client's own, cut from the logo raster they supplied.

Sources are not committed. `scripts/media/sources.json` lists every source URL, and the scripts download them into `.media-src/` (gitignored). Each shipped raster also carries its origin in a `.webp.json` sidecar. Read it with `impeccable embed-prompt --read <file>`.

## Homepage (`/es`, `/en`)

| File | Size | Used in | Source (license) | How it was made | Client's real replacement |
| --- | --- | --- | --- | --- | --- |
| `v2/film*`, `v2/poster*.webp` | See the hero film below | Hero film and its posters | Mixkit 2025 | See below | See below |
| `../brand/joox-cars-mark.webp` (`public/brand/`) | 96 KB | Header logo | The client's logo raster (`references/brand/joox-cars-logo.png`) | White background unmixed to transparency (alpha = 1 − darkest channel), trimmed, 240 px tall | **The vector logo (SVG)** |
| `../brand/joox-cars-mark-reversed.webp` (`public/brand/`) | 79 KB | Header logo over the hero film | The mark above | `scripts/media/brand_reversed.py`: near-black swapped for white, yellow kept, edges blended | **The vector logo's reversed version (SVG)** |
| `../brand/joox-cars-lockup.webp` (`public/brand/`) | 121 KB | Footer logo with the tagline | Same raster | Same, with "Driven by eternal purpose", 320 px tall | The vector lockup (SVG) |

The logos are lossless WebP. The homepage uses no grain overlay; the film keeps the look it was baked with, full-bleed as the hero.

### The client's photos

The client sent its photos through a chat app, already reduced to 1280 px on the long side, into three folders at the project root: `cars-to-rent/` (the rental fleet), `cars-to-export/` (its imports: lots, a tow truck, containers, papers, keys) and `cars-ready-to-sell/` (the car for sale). `scripts/media/photos.py` prepares the ones the page uses (`public/media/photos/<id>.jpg`, ids in `src/lib/fleet.ts`, captions in both dictionaries under `photos`):

- **Plates** are softened into blank plates, and **a child** standing in a doorway behind the orange Outlander Sport is blurred.
- The backlit carport photo of the black Outlander Sport 2015 has its shadows lifted.
- All are saved as WebP (quality 82) without metadata (phone photos can carry the GPS position of the client's home) and never upscaled. The chat app had already compressed them, so the WebP files are about the size of those JPEGs; visitors get AVIF at the size shown.

| Photos | Used in |
| --- | --- |
| `fleet-grass`, `fleet-row`, `fleet-doors` (the three rental cars together at home in Guápiles) | `fleet-grass` closes the rental band; all three are in every rental car's photo viewer |
| `outlander-sport-2020`, `outlander-sport-2015`, `sportage-2020` | The first photo in each rental car's viewer |
| `wrangler-front`, `-rear`, `-back`, `-cabin`, `-key` | The Jeep's photo viewer (sales) |
| `import-*` (10) | The import strip, in the order `IMPORTS` lists them |

Not used yet: the other 18 import photos (more cars on the lots, a white Corolla with a young man beside it, an office). Captions stay neutral (the car, or what is happening) because who is in each photo and where it was taken has not been confirmed; the one place named, Houston, is lettered on the tow truck itself.

### Showroom cutouts (rental and sales)

The showroom shows each car in true side profile, like a manufacturer's configurator; the client's own photos (front three-quarter views, no side profiles) open from "Ver fotos". So each showroom car is a Wikimedia Commons photo of the same model and generation, labelled "Foto del modelo" / "Model photo" on the stage, with a credit under the specs that says where the car's own photos are.

No free photo of either Mitsubishi exists in the client's colour, so `scripts/media/fleet.py` recolours those two: only the painted body changes, in Lab, keeping the photo's own shading and reflections. The glass, wheels, lights, chrome and trim are traced by hand in `CARS` and left as photographed. The credit says "color ajustado" / "colour adjusted"; the adaptations of CC BY-SA photos carry CC BY-SA 4.0. The script also softens plates, levels each car on its tyres, cuts it out with BiRefNet and draws its ground shadow from its own silhouette. Rental cars face left (their carousel travels left); the car for sale faces right. Each file is named by its content (`<slug>-side-<hash>.webp`), so a changed cutout never hides behind a cached copy; `fleet.py` updates `src/lib/fleet.ts` to the new names.

| File | Used in | Source (licence) | How it was made |
| --- | --- | --- | --- |
| `fleet/mitsubishi-outlander-sport-2020-side-*.webp` | Rental: Outlander Sport 2020, orange | [Mitsubishi ASX 1.6 GLS 2024.jpg](https://commons.wikimedia.org/wiki/File:Mitsubishi_ASX_1.6_GLS_2024.jpg) by RL GNZLZ (CC BY-SA 4.0): the 2020 facelift front, sold as the ASX in Chile | Grey recoloured to Sunshine Orange (roof rails, grille, chrome and lower bumper kept), plate softened, cutout, levelled, own shadow |
| `fleet/kia-sportage-2020-side-*.webp` | Rental: Sportage 2020, black | [Moscow, Kia Sportage, May 2026 01.jpg](https://commons.wikimedia.org/wiki/File:Moscow,_Kia_Sportage,_May_2026_01.jpg) by Retired electrician (CC0): the same generation (QL), before its 2019 facelift | Navy-black taken to neutral black, plate softened, cutout, levelled, own shadow |
| `fleet/mitsubishi-outlander-sport-2015-side-*.webp` | Rental: Outlander Sport 2015, black | [Mitsubishi ASX(1).jpg](https://commons.wikimedia.org/wiki/File:Mitsubishi_ASX(1).jpg) by ГП (CC BY-SA 4.0): the 2013–2015 front | Bronze recoloured to black (headlight, fog trim and grille kept), mirrored (no lettering on the side), plate softened, cutout, levelled, own shadow |
| `fleet/jeep-wrangler-unlimited-side-*.webp` | Sales: Wrangler Unlimited, black | [Cars 003.JPG](https://commons.wikimedia.org/wiki/File:Cars_003.JPG) by Albert Jankowski (public domain): a black four-door JK | Cutout, levelled, own shadow |

Earlier cutouts are kept, unused, in `.media-src/fleet/`: the sample cars of other models in `_samples/`, and the three-quarter cutouts of the client's own photos in `_old3q/`.

**Better photos, whenever the client can:** each car on its own, in true side profile (camera at wheel-hub height, square to the car, from 15–20 m with the zoom in, so the car is not distorted), on an even ground in open shade or overcast light, all facing the same way, sent as files rather than photos so they keep their full size. With those, the showroom shows the client's own cars and no model photo is needed: point a car in `CARS` in `scripts/media/fleet.py` at its `file` instead of `commons`, and drop its `credit` in `src/lib/fleet.ts`.

## The hero film

The plate goes through a per-shot balance, then the shared look: greens pulled toward olive, teal shadows, amber highlights, and a soft filmic curve (`LOOK` in `scripts/media/common.py`). It is graded in RGB and converted to YUV once, as tagged BT.709, so the video decodes to the same colours as its posters.

Each layout ships in two codecs, both at constant quality capped by a size budget: **AV1** (`.av1.mp4`, what Chrome, Edge, Firefox, Android and recent Safari play) and **H.264** (`.mp4`, the fallback, e.g. older iPhones). `useFilm` lists AV1 first with its codec string, so a browser that cannot decode it takes the H.264 file. The desktop layout also ships 1280 wide (`-720`) for screens up to 900 px; phones and portrait screens get their own crop.

| File | Size | Used in | Source (license) | How it was made | Client's real replacement |
| --- | --- | --- | --- | --- | --- |
| `v2/film.av1.mp4`, `v2/film.mp4` (+ `film-720.*`, `film-phone.*`) | AV1 2.6 MB / H.264 3.3 MB (1280 wide: 1.1 / 1.4 MB; phone crop 890×1080: 1.9 / 3.2 MB) | The film with JOOX baked in: desktop layout, and a tall crop (centred on the car's crossing) for phones and portrait screens | [Mixkit 2025, SUV on a forest road](https://mixkit.co/free-stock-video/jeep-in-the-road-between-nature-2025/) (Mixkit Free License) | `scripts/media/v2_bake.py`: the car is tracked by background subtraction; while it is in front and overlaps the letters, a BiRefNet cutout is made per frame (cached). The matte actually used is steadied: the median of the neighbouring frames' cutouts, aligned on the tracked licence plate (its track smoothed), made solid (no see-through glass or haze, the gap under the car closed, only between the wheels), edge included. Without it, the letter behind the car flickered and turned see-through around it. JOOX (Archivo, provisional face) is drawn into every frame; as the car reaches it, JO and OX part like a curtain, the car turns from in front to behind inside the gap, and the letters close behind it. Played at 1.4× using every frame, 12.7 s loop that runs until the car has driven off behind the grass, then dissolves empty road into empty road. The stand-in's licence plate is tracked and blurred | **Locked-off telephoto**, 20 s: an empty road for the first 2 s, then **one of the fleet's own cars** entering close to the camera and driving away up the road. Golden hour, no other traffic, no camera shake. |
| `v2/poster.webp`, `v2/poster-phone.webp` | 438 KB / 158 KB (visitors get AVIF at the size shown, e.g. 57 KB at 1080 px) | Posters (LCP): desktop and phone crops | Same clip, frame at 5.0 s (film time 2.711 s) | Baked frame, word included | Rebaked from the client's shot |

## Placeholders that are not media

Homepage (`messages/es.json`, `messages/en.json`):

- Contact details are real (`src/lib/contact.ts` and `src/lib/whatsapp.ts`): phone 8716-3308, also used as the WhatsApp number (+506 8716 3308, to be confirmed), the email, Guápiles, Pococí, Limón, and the Facebook, Instagram and TikTok profiles. The map link opens Guápiles itself until there is an exact address or pin.
- In brackets: `[PRECIO]` (rental per day and the Jeep), the Jeep's `[AÑO]` and `[KM]`, `[X semanas]` (import time), `[HORARIO]`, the rental requirements, insurance and warranty answers in the FAQ, and the three reviews. The English file mirrors each one.
- Not on the page until the client has them: the rental cars' drive (4x2 or 4x4), a family photo for About, and the spare-parts catalogue (its section keeps a one-line "Placeholder" note).
- The favicon (`src/app/icon.svg`) is a neutral horizon mark until the vector logo exists.

## Rebuilding the media

```bash
# Python 3.10+ with numpy, opencv-python-headless, pillow; rembg and onnxruntime for the
# cutouts (the BiRefNet model downloads on first use); ffmpeg with libaom-av1 and libx264
# (imageio-ffmpeg bundles one). A ready environment: python -m venv work/media-venv, then pip
# install those into it; FFMPEG=$(python -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())").
export FFMPEG=/path/to/ffmpeg
python scripts/media/v2_bake.py        # the hero film and posters: ~40 min the first time (per-frame cutouts), minutes once cached
python scripts/media/photos.py        # the client's photos: plates softened, people blurred, no metadata
python scripts/media/fleet.py         # showroom cutouts: the client's photos (or a Commons model photo), plates softened, shadows
IMPECCABLE=/path/to/impeccable python scripts/media/provenance.py
```

Each script documents its own method. To swap in the client's footage, put it in `sources.json` under `forest`, update the times at the top of `v2_bake.py` (poster time, loop segment) and the plate's anchor position (`PLATE_RECESS`), and rerun; it works for a locked-off camera, as the shot brief above says. `WORD=...` renders another language.
