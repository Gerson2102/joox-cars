// The content the client edits in the CMS (/admin, Sveltia CMS): the cars, contact
// details, import time and fee, the FAQ and the reviews. Each file under content/
// holds both languages, { es: {...}, en: {...} }, the way the CMS saves them. Spanish
// is the default: fields that are the same in both languages are read from it, and
// an English text left empty falls back to the Spanish one.
//
// Read at build time (every page is prerendered); in `next dev` a saved change shows
// on reload.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, normalize } from "node:path";
import { cache } from "react";
import sharp from "sharp";
import type { Locale } from "@/app/[lang]/dictionaries";
import type { Img } from "./fleet";

const CONTENT = join(process.cwd(), "content");
const PUBLIC = join(process.cwd(), "public");

type Localized<T> = { es: T; en?: Partial<T> };

const read = <T>(file: string): Localized<T> => JSON.parse(readFileSync(join(CONTENT, file), "utf8"));

/** The English value when there is one, the Spanish one otherwise. */
const pick = <T, K extends keyof T>(data: Localized<T>, lang: Locale, key: K): T[K] => {
  const value = lang === "en" ? data.en?.[key] : undefined;
  return value === undefined || value === "" ? data.es[key] : (value as T[K]);
};

/* ---------- Images ---------- */

/** A photo in public/ with its size, or null (with a build warning) if the file is missing. */
const image = cache(async (src: string): Promise<Img | null> => {
  const file = normalize(join(PUBLIC, src));
  if (!src.startsWith("/") || !file.startsWith(PUBLIC) || !existsSync(file)) {
    console.warn(`[content] image not found in public/: ${src}`);
    return null;
  }
  const { width = 0, height = 0, orientation = 1 } = await sharp(file).metadata();
  // EXIF orientations 5-8 are quarter turns: the photo shows with its sides swapped.
  return orientation >= 5 ? { src, width: height, height: width } : { src, width, height };
});

/* ---------- Cars ---------- */

export type Kind = "rental" | "sales";

type CarFile = {
  brand: string;
  model: string;
  year: string;
  body: string;
  color: string;
  engine?: string;
  mileage?: number;
  unit?: "km" | "mi";
  gearbox: "automatic" | "manual";
  drive?: string;
  seats: number;
  photos: { image: string; caption?: string }[];
  status?: string;
  visible?: boolean;
  order?: number;
};

export type Car = Omit<CarFile, "photos" | "visible" | "order" | "seats"> & {
  /** The file name, without .json: also the key of the car's showroom cutout in src/lib/fleet.ts. */
  slug: string;
  seats: string;
  photos: (Img & { caption: string })[];
};

/** The cars in the rental or sales showroom, in the client's order; hidden ones are left out. */
export const getCars = cache(async (kind: Kind, lang: Locale): Promise<Car[]> => {
  const files = readdirSync(join(CONTENT, kind)).filter((f) => f.endsWith(".json"));
  const cars = await Promise.all(
    files.map(async (file) => {
      const data = read<CarFile>(`${kind}/${file}`);
      const es = data.es;
      if (es.visible === false) return null;
      const name = `${es.brand} ${es.model} ${es.year}`;
      const captions = lang === "en" ? data.en?.photos : undefined;
      const photos = await Promise.all(
        (es.photos ?? []).map(async (p, n) => {
          const img = await image(p.image);
          return img ? { ...img, caption: captions?.[n]?.caption || p.caption || name } : null;
        }),
      );
      const car: Car = {
        slug: file.replace(/\.json$/, ""),
        brand: es.brand,
        model: es.model,
        year: String(es.year),
        body: pick(data, lang, "body"),
        color: pick(data, lang, "color"),
        engine: es.engine || undefined,
        mileage: es.mileage,
        unit: es.unit,
        gearbox: es.gearbox,
        drive: es.drive || undefined,
        seats: String(es.seats),
        status: pick(data, lang, "status") || undefined,
        photos: photos.filter((p) => p !== null),
      };
      return { car, order: es.order ?? 999 };
    }),
  );
  return cars
    .filter((c) => c !== null)
    .sort((a, b) => a.order - b.order || `${a.car.brand} ${a.car.model}`.localeCompare(`${b.car.brand} ${b.car.model}`))
    .map(({ car }) => car);
});

/* ---------- Contact ---------- */

type ContactFile = {
  phone: string;
  whatsapp: string;
  email: string;
  hours: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
};

export type Contact = {
  phone: { label: string; href: string };
  /** Digits only, with the country code (506…). */
  whatsapp: string;
  email: string;
  hours: string;
  social: { name: string; href: string }[];
};

const SOCIAL = [
  ["Facebook", "facebook"],
  ["Instagram", "instagram"],
  ["TikTok", "tiktok"],
] as const;

export const getContact = cache((lang: Locale): Contact => {
  const data = read<ContactFile>("contact.json");
  const c = data.es;
  const digits = c.phone.replace(/\D/g, "");
  // Costa Rica numbers are 8 digits: shown with the country code, as +506 XXXX-XXXX.
  const label = digits.length === 8 ? `+506 ${digits.slice(0, 4)}-${digits.slice(4)}` : c.phone;
  return {
    phone: { label, href: `tel:+${digits.length === 8 ? `506${digits}` : digits}` },
    whatsapp: c.whatsapp.replace(/\D/g, ""),
    email: c.email,
    hours: pick(data, lang, "hours"),
    // Only full https links are published; an empty field hides that profile.
    social: SOCIAL.flatMap(([name, key]) => (c[key]?.startsWith("https://") ? [{ name, href: c[key] }] : [])),
  };
});

/* ---------- Import ---------- */

export const getImport = cache((lang: Locale) => {
  const data = read<{ time: string; fee: string }>("import.json");
  return { time: pick(data, lang, "time"), fee: data.es.fee };
});

/* ---------- FAQ and reviews ---------- */

// Both are one list in the CMS for the two languages: the items are added, removed and
// ordered in Spanish, and their texts are translated beside it.

type Faq = { q: string; a: string };

export const getFaq = cache((lang: Locale): Faq[] => {
  const data = read<{ items: Faq[] }>("faq.json");
  const en = lang === "en" ? data.en?.items : undefined;
  return data.es.items.map((f, n) => ({ q: en?.[n]?.q || f.q, a: en?.[n]?.a || f.a }));
});

export type Review = { name: string; service: "rental" | "sales" | "import" | "parts"; quote: string };

export const getReviews = cache((lang: Locale): Review[] => {
  const data = read<{ items: Review[] }>("reviews.json");
  const en = lang === "en" ? data.en?.items : undefined;
  return data.es.items.map((r, n) => ({ ...r, quote: en?.[n]?.quote || r.quote }));
});
