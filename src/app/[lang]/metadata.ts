import type { Metadata } from "next";
import { languages, pagePath, type Service } from "@/lib/sections";
import { otherLocale, type Dictionary, type Locale } from "./dictionaries";

const OG_LOCALE: Record<Locale, string> = { es: "es_CR", en: "en_US" };

/** A page's title and description, its address in each language, and its link preview (the logo with the
 *  tagline; X takes the same card). */
export function pageMetadata(t: Dictionary, lang: Locale, service?: Service): Metadata {
  const { title, description } = service ? t.pages[service] : t.meta;
  const url = pagePath(lang, service);
  const image = { url: "/brand/joox-cars-preview.jpg", width: 1200, height: 630, alt: `JOOX CARS · ${t.footer.tagline}` };
  return {
    title,
    description,
    alternates: { canonical: url, languages: languages(service) },
    openGraph: { type: "website", siteName: "JOOX CARS", locale: OG_LOCALE[lang], alternateLocale: OG_LOCALE[otherLocale(lang)], url, title, description, images: [image] },
    twitter: { card: "summary_large_image" },
  };
}
