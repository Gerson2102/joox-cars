// Images for the showrooms, the photo viewer and the import strip. Copy (brand,
// model, specs, photo captions) lives in messages/es.json and messages/en.json,
// keyed by the same slugs and photo ids.
//
// The showroom shows each car in side profile, like a configurator: a Wikimedia
// Commons photo of the same model and generation, cut out by
// scripts/media/fleet.py and recoloured to the client's paint where no photo in
// that colour exists ("adjusted"). The page labels them model photos and credits
// them; the client's own photos of each car open from "See photos". Those are
// prepared by scripts/media/photos.py (plates softened, metadata removed).

export type Img = { src: string; width: number; height: number };
export type Credit = { author: string; license: string; page: string; adjusted?: boolean };
/** A car in the showroom: its side-profile model photo and the client's own photos of it. */
type Car = { cutout: Img & { credit?: Credit }; photos: PhotoId[] };

const commons = (file: string) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, "_"))}`;

export const PHOTOS = {
  "fleet-grass": { src: "/media/photos/fleet-grass.webp", width: 1280, height: 960 },
  "fleet-row": { src: "/media/photos/fleet-row.webp", width: 1280, height: 960 },
  "fleet-doors": { src: "/media/photos/fleet-doors.webp", width: 960, height: 1280 },
  "outlander-sport-2020": { src: "/media/photos/outlander-sport-2020.webp", width: 960, height: 1280 },
  "outlander-sport-2015": { src: "/media/photos/outlander-sport-2015.webp", width: 960, height: 1280 },
  "sportage-2020": { src: "/media/photos/sportage-2020.webp", width: 960, height: 1280 },
  "wrangler-front": { src: "/media/photos/wrangler-front.webp", width: 960, height: 1280 },
  "wrangler-rear": { src: "/media/photos/wrangler-rear.webp", width: 960, height: 1280 },
  "wrangler-key": { src: "/media/photos/wrangler-key.webp", width: 960, height: 1280 },
  "wrangler-cabin": { src: "/media/photos/wrangler-cabin.webp", width: 960, height: 1280 },
  "wrangler-back": { src: "/media/photos/wrangler-back.webp", width: 960, height: 1280 },
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

/** The three rental cars together, shown with every rental car's own photos. */
const TOGETHER: PhotoId[] = ["fleet-grass", "fleet-row", "fleet-doors"];

export const FLEET: Record<string, Car> = {
  "mitsubishi-outlander-sport-2020": {
    cutout: {
      src: "/media/fleet/mitsubishi-outlander-sport-2020-side-b1e0b8e1.webp", width: 1760, height: 671,
      credit: { author: "RL GNZLZ", license: "CC BY-SA 4.0", page: commons("Mitsubishi ASX 1.6 GLS 2024.jpg"), adjusted: true },
    },
    photos: ["outlander-sport-2020", ...TOGETHER],
  },
  "kia-sportage-2020": {
    cutout: {
      src: "/media/fleet/kia-sportage-2020-side-c62a84bc.webp", width: 1760, height: 658,
      credit: { author: "Retired electrician", license: "CC0", page: commons("Moscow, Kia Sportage, May 2026 01.jpg"), adjusted: true },
    },
    photos: ["sportage-2020", ...TOGETHER],
  },
  "mitsubishi-outlander-sport-2015": {
    cutout: {
      src: "/media/fleet/mitsubishi-outlander-sport-2015-side-6399850e.webp", width: 1760, height: 662,
      credit: { author: "ГП", license: "CC BY-SA 4.0", page: commons("Mitsubishi ASX(1).jpg"), adjusted: true },
    },
    photos: ["outlander-sport-2015", ...TOGETHER],
  },
  "jeep-wrangler-unlimited": {
    cutout: {
      src: "/media/fleet/jeep-wrangler-unlimited-side-14ffba6d.webp", width: 1760, height: 735,
      credit: { author: "Albert Jankowski", license: "Public domain", page: commons("Cars 003.JPG") },
    },
    photos: ["wrangler-front", "wrangler-rear", "wrangler-back", "wrangler-cabin", "wrangler-key"],
  },
};

/** The rental band closes on the three cars together at home in Guápiles. */
export const FLEET_TOGETHER: PhotoId = "fleet-grass";

/** The import strip, in order. */
export const IMPORTS: PhotoId[] = [
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
];
