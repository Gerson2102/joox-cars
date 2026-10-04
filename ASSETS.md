# Assets

The cars on the homepage are the client's own: the rental fleet, the car for sale and the client's imports, from photos the client sent (`public/media/photos/`, and the showroom cutouts in `public/media/fleet/`). The showroom shows each car in side profile through a Wikimedia Commons photo of its model (recoloured to the client's paint where needed), labelled "Foto del modelo" / "Model photo" and credited; the client's own photos of each car open from "Ver fotos".

The hero film is **AI-generated** (Seedance 2.5 through the Higgsfield API), the version the client chose: a white Jeep Wrangler on a Caribbean coast road, not one of the fleet's own cars. It carries no label.

The logo files in `public/brand/` are the client's own, cut from the logo raster they supplied.

Sources are not committed. `scripts/media/sources.json` lists every source URL, and the scripts download them into `.media-src/` (gitignored); the hero film's take has no URL, so it is copied in from where its entry says it is kept. Each shipped raster also carries its origin in a `.webp.json` sidecar. Read it with `impeccable embed-prompt --read <file>`.

## Homepage (`/es`, `/en`)

| File | Size | Used in | Source (license) | How it was made | Client's real replacement |
| --- | --- | --- | --- | --- | --- |
| `v2/film*`, `v2/poster*.webp` | See the hero film below | Hero film and its posters | Seedance 2.5 (generated) | See below | See below |
| `../brand/joox-cars-mark.webp` (`public/brand/`) | 96 KB | Header logo | The client's logo raster (`references/brand/joox-cars-logo.png`) | White background unmixed to transparency (alpha = 1 − darkest channel), trimmed, 240 px tall | None: final (no vector logo is coming) |
| `../brand/joox-cars-mark-reversed.webp` (`public/brand/`) | 79 KB | Header logo over the hero film | The mark above | `scripts/media/brand_reversed.py`: near-black swapped for white, yellow kept, edges blended | None: final |
| `../brand/joox-cars-lockup.webp` (`public/brand/`) | 121 KB | Footer logo with the tagline | Same raster | Same, with "Driven by eternal purpose", 320 px tall | None: final |
| `src/app/[lang]/opengraph-image.jpg` | 55 KB | Link previews (WhatsApp, Facebook, X) | Same raster | Trimmed, centred on its own white at 66 % of the height, 1200 × 630, JPEG q90 | None: final |

The logos are lossless WebP. The homepage uses no grain overlay; the film keeps the look it was baked with, full-bleed as the hero.

### The client's photos

The client sent its photos through a chat app, already reduced to 1280 px on the long side, into three folders at the project root: `cars-to-rent/` (the rental fleet), `cars-to-export/` (its imports: lots, a tow truck, containers, papers, keys) and `cars-ready-to-sell/` (the car for sale). `scripts/media/photos.py` prepared the ones the page uses (`public/media/photos/<id>.webp`). The cars' photos and captions are now listed in each car's file in `content/` and edited in the panel; the fleet photo, the service photos and the import strip keep their ids in `src/lib/fleet.ts` and captions in both dictionaries under `photos`:

- **Plates** are softened into blank plates, and **a child** standing in a doorway behind the orange Outlander Sport is blurred.
- The backlit carport photo of the black Outlander Sport 2015 has its shadows lifted.
- All are saved as WebP (quality 82) without metadata (phone photos can carry the GPS position of the client's home) and never upscaled. The chat app had already compressed them, so the WebP files are about the size of those JPEGs; visitors get AVIF at the size shown.

| Photos | Used in |
| --- | --- |
| `fleet-grass`, `fleet-row`, `fleet-doors` (the three rental cars together at home in Guápiles) | `fleet-grass` closes the rental band; all three are in every rental car's photo viewer |
| `outlander-sport-2020`, `outlander-sport-2015`, `sportage-2020` | The first photo in each rental car's viewer |
| `wrangler-front`, `-rear`, `-back`, `-cabin`, `-key` | The Jeep's photo viewer (sales) |
| `outlander-2016`, `outlander-2016-front` (the white Outlander at the lot, sent 2 October, in `cars-to-rent/`) | Its photo viewer, in both showrooms (it is for rent and for sale) |
| `import-*` (10) | The import strip, in the order `IMPORTS` lists them |

**Photos added in the panel** (`/admin`, `docs/CMS.md`) land in the same folder, named after the car (`<make>-<model>-<year>-<id>.webp`). The panel converts them to WebP at 1600 px at most, quality 82, and strips their metadata (GPS included), all in the browser. It can't soften plates or blur people, so those are the client's to do before uploading. These photos have no `.webp.json` sidecar: their record is the commit that added them.

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
| `fleet/mitsubishi-outlander-2016-side-*.webp`, `fleet/mitsubishi-outlander-2016-sale-side-*.webp` | Rental and sales: Outlander 2016, white | [Moscow, Mitsubishi Outlander (third generation, 2018) Aug 2025 01.jpg](https://commons.wikimedia.org/wiki/File:Moscow,_Mitsubishi_Outlander_(third_generation,_2018)_Aug_2025_01.jpg) by Retired electrician (CC0): a 2018 of the same body (the 2016–2018 front), white as the client's, seen slightly from the front | Plate softened, a ribbon sticker on the rear side window filled in from the glass, cutout, levelled, own shadow; the sales copy mirrored (no lettering on the side) |

Earlier cutouts are kept, unused, in `.media-src/fleet/`: the sample cars of other models in `_samples/`, and the three-quarter cutouts of the client's own photos in `_old3q/`.

**Better photos, whenever the client can:** each car on its own, in true side profile (camera at wheel-hub height, square to the car, from 15–20 m with the zoom in, so the car is not distorted), on an even ground in open shade or overcast light, all facing the same way, sent as files rather than photos so they keep their full size. With those, the showroom shows the client's own cars and no model photo is needed: point a car in `CARS` in `scripts/media/fleet.py` at its `file` instead of `commons`, and drop its `credit` in `src/lib/fleet.ts`.

## The hero film

The take plays as generated: its own colour, speed and frames, at 1920×1080, 24 fps. It is composited in RGB and converted to YUV once, as tagged BT.709, so the video decodes to the same colours as its posters.

Each layout ships in two codecs, both at constant quality capped by a size budget: **AV1** (`.av1.mp4`, what Chrome, Edge, Firefox, Android and recent Safari play) and **H.264** (`.mp4`, the fallback, e.g. older iPhones). `useFilm` lists AV1 first with its codec string, so a browser that cannot decode it takes the H.264 file. The desktop layout also ships 1280 wide (`-720`) for screens up to 900 px; phones and portrait screens get their own crop.

| File | Size | Used in | Source (license) | How it was made | Client's real replacement |
| --- | --- | --- | --- | --- | --- |
| `v2/film.av1.mp4`, `v2/film.mp4` (+ `film-720.*`, `film-phone.*`) | 1920×1080: AV1 1.9 MB / H.264 2.8 MB (1280 wide: 0.9 / 1.1 MB; phone crop 890×1080: 0.9 / 1.9 MB) | The film with JOOX baked in: desktop layout, and a tall crop (centred on the car's crossing) for phones and portrait screens | Seedance 2.5 image-to-video through the Higgsfield API (request `b53e41f0-52f6-4f61-9455-5ce8a5d5b228`), 10 s at 1080p, first and last frame the same Higgsfield Soul 2 still of a Caribbean coast road; the take and its prompt are kept in the `joox-higgsfield` project | `scripts/media/v2_bake.py`: the logo's own JOOX (cut from the logo raster, J and X white, the infinity yellow) is drawn into every frame; as the car reaches it, JO and OX part like a curtain at the infinity's crossing, the car turns from in front to behind inside the gap, and the letters close behind it. The car is tracked by background subtraction against the empty road at both ends of the take; while it is in front and overlaps the letters, its matte is the larger of a BiRefNet cutout (steadied: the median of the neighbouring frames' cutouts, aligned on the tracked licence plate, or on the car's front while the frame edge cuts it) and its own outline against the empty road, which holds when the car fills BiRefNet's crop. Below the roof the matte is filled out to the car's sides (the dark fender flares and bumper against a dark road), and on the fast close pass its edge is smeared along the car's path like the car itself, so the letters fade into its blurred front. On desktop the word stands below the copy (baseline at 80 %); on phones it stands higher (70 %), where the car crosses it smaller. 9.75 s loop at the take's own speed, from the empty road before the car to the empty road after it has gone over the hill, closed by a 0.3 s dissolve. The licence plate is tracked and blurred | **Locked-off**, 10 s: the car enters close to the camera at once, drives away up the road and goes over the hill, then 1 s of empty road. Golden hour, no other traffic, no camera shake. |
| `v2/poster-<hash>.webp`, `v2/poster-phone-<hash>.webp` (named by content) | 214 KB / 93 KB (visitors get AVIF at the size shown) | Posters (LCP): desktop and phone crops | Same take, the frame at 9.5 s (film time 9.208 s): the empty road and the word just before the loop comes round. The film starts there, so the car bursts in as soon as it has faded in | Baked frame, word included | Rebaked from any new take |

## Other stand-ins and open items

Homepage (`messages/es.json`, `messages/en.json`):

- Contact details are real (`src/lib/contact.ts` and `src/lib/whatsapp.ts`): phone 8716-3308, also the business WhatsApp number (+506 8716 3308, confirmed by the client), the email, Guápiles, Pococí, Limón, and the Facebook, Instagram and TikTok profiles. The map link opens Guápiles itself; the client wants no exact address or pin.
- No content is left in brackets: prices, times, hours, requirements, insurance, warranty and the three reviews are all the client's. Rates and the Jeep's price are not shown on purpose.
- Not on the page until the client has them: the rental cars' drive (4x2 or 4x4), a family photo for About, and the spare-parts catalogue (meanwhile the parts section takes requests through its WhatsApp form).
- The favicon (`src/app/icon.svg`) is a neutral horizon mark, and it is final.

## Rebuilding the media

```bash
# Python 3.10+ with numpy, opencv-python-headless, pillow; rembg and onnxruntime for the
# cutouts (the BiRefNet model downloads on first use); ffmpeg with libaom-av1 and libx264
# (imageio-ffmpeg bundles one). A ready environment: python -m venv work/media-venv, then pip
# install those into it; FFMPEG=$(python -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())").
export FFMPEG=/path/to/ffmpeg
python scripts/media/v2_bake.py        # the hero film and posters: a few minutes (per-frame cutouts cached in .media-src/_cache)
python scripts/media/photos.py        # the client's photos: plates softened, people blurred, no metadata
python scripts/media/fleet.py         # showroom cutouts: the client's photos (or a Commons model photo), plates softened, shadows
IMPECCABLE=/path/to/impeccable python scripts/media/provenance.py
```

Each script documents its own method. To swap in another take, add it to `sources.json`, point `SOURCE` at the top of `v2_bake.py` to it, update the times there (the car-free `CLEAN` seconds, `START`, the poster time) and the plate's anchor position (`PLATE_RECESS`), rerun, and copy the printed poster time and file names into `HeroStage.tsx`; it works for a locked-off camera, as the shot brief above says.
