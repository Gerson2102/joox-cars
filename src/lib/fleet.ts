// Images the client doesn't edit: the showroom cutouts, the fleet photo, the service
// photos and the import strip. The cars themselves (copy and the client's own photos)
// are edited in the CMS and live in content/rental/ and content/sales/; see
// src/lib/content.ts. The captions below are in messages/*.json under `photos`.
//
// The showroom shows each car in side profile, like a configurator: a Wikimedia
// Commons photo of the same model and generation, cut out by
// scripts/media/fleet.py and recoloured to the client's paint where no photo in
// that colour exists ("adjusted"). The page labels them model photos and credits
// them; the client's own photos of each car open from "See photos". Those are
// prepared by scripts/media/photos.py (plates softened, metadata removed).
//
// A car added in the CMS has no cutout until one is made for it: the showroom then
// stands its first photo in a frame instead (see CarCarousel).

export type Img = { src: string; width: number; height: number };
export type Credit = { author: string; license: string; page: string; adjusted?: boolean };
export type Cutout = Img & { credit?: Credit };

const commons = (file: string) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, "_"))}`;

export const PHOTOS = {
  "fleet-grass": { src: "/media/photos/fleet-grass.webp", width: 1280, height: 960 },
  "fleet-row": { src: "/media/photos/fleet-row.webp", width: 1280, height: 960 },
  "wrangler-front": { src: "/media/photos/wrangler-front.webp", width: 960, height: 1280 },
  "import-lot": { src: "/media/photos/import-lot.webp", width: 960, height: 1280 },
  "import-rubicon": { src: "/media/photos/import-rubicon.webp", width: 960, height: 1280 },
  "import-tow": { src: "/media/photos/import-tow.webp", width: 1280, height: 960 },
  "import-container": { src: "/media/photos/import-container.webp", width: 960, height: 1280 },
  "import-x6": { src: "/media/photos/import-x6.webp", width: 960, height: 1280 },
  "import-papers": { src: "/media/photos/import-papers.webp", width: 960, height: 1280 },
  "import-4runner": { src: "/media/photos/import-4runner.webp", width: 960, height: 1280 },
  "import-containers": { src: "/media/photos/import-containers.webp", width: 1280, height: 960 },
  "import-rebel": { src: "/media/photos/import-rebel.webp", width: 960, height: 1280 },
  "import-keys": { src: "/media/photos/import-keys.webp", width: 1280, height: 960 },
} satisfies Record<string, Img>;

export type PhotoId = keyof typeof PHOTOS;

/** The white Outlander is for rent and for sale: one model photo, facing each showroom's way. */
const OUTLANDER_2016: Credit = {
  author: "Retired electrician",
  license: "CC0",
  page: commons("Moscow, Mitsubishi Outlander (third generation, 2018) Aug 2025 01.jpg"),
};

/** Each showroom's cutouts, by the car's file name in content/rental/ or content/sales/. */
export const CUTOUTS: Record<"rental" | "sales", Record<string, Cutout>> = {
  rental: {
    "mitsubishi-outlander-sport-2020": {
      src: "/media/fleet/mitsubishi-outlander-sport-2020-side-b1e0b8e1.webp", width: 1760, height: 671,
      credit: { author: "RL GNZLZ", license: "CC BY-SA 4.0", page: commons("Mitsubishi ASX 1.6 GLS 2024.jpg"), adjusted: true },
    },
    "kia-sportage-2020": {
      src: "/media/fleet/kia-sportage-2020-side-c62a84bc.webp", width: 1760, height: 658,
      credit: { author: "Retired electrician", license: "CC0", page: commons("Moscow, Kia Sportage, May 2026 01.jpg"), adjusted: true },
    },
    "mitsubishi-outlander-sport-2015": {
      src: "/media/fleet/mitsubishi-outlander-sport-2015-side-6399850e.webp", width: 1760, height: 662,
      credit: { author: "ГП", license: "CC BY-SA 4.0", page: commons("Mitsubishi ASX(1).jpg"), adjusted: true },
    },
    "mitsubishi-outlander-2016": { src: "/media/fleet/mitsubishi-outlander-2016-side-dc7e6d89.webp", width: 1760, height: 675, credit: OUTLANDER_2016 },
  },
  sales: {
    "jeep-wrangler-unlimited": {
      src: "/media/fleet/jeep-wrangler-unlimited-side-14ffba6d.webp", width: 1760, height: 735,
      credit: { author: "Albert Jankowski", license: "Public domain", page: commons("Cars 003.JPG") },
    },
    "mitsubishi-outlander-2016": { src: "/media/fleet/mitsubishi-outlander-2016-sale-side-11a483b8.webp", width: 1760, height: 675, credit: OUTLANDER_2016 },
  },
};

/** The rental band closes on the three cars together at home in Guápiles. */
export const FLEET_TOGETHER = "fleet-grass" satisfies PhotoId;

/** The services overview: each service's own photo, whole on wide screens (rental's is landscape, the others
 *  portrait). Parts has none yet; its tile is a yellow panel. */
export const SERVICE_PHOTOS: Partial<Record<"rental" | "sales" | "import" | "parts", PhotoId>> = {
  rental: "fleet-row",
  sales: "wrangler-front",
  import: "import-container",
};

/** The import strip, in order. */
export const IMPORTS = [
  "import-lot",
  "import-rubicon",
  "import-tow",
  "import-container",
  "import-x6",
  "import-papers",
  "import-4runner",
  "import-containers",
  "import-rebel",
  "import-keys",
] as const satisfies readonly PhotoId[];
