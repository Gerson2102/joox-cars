import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/contact";
import { locales } from "./[lang]/dictionaries";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}`]));
  return locales.map((l) => ({ url: `${SITE_URL}/${l}`, alternates: { languages } }));
}
