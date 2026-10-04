import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/contact";
import { SERVICES, languages, pagePath, type Service } from "@/lib/sections";
import { locales } from "./[lang]/dictionaries";

/** Every page in every language: the homepage and the four services, each listing its other languages. */
export default function sitemap(): MetadataRoute.Sitemap {
  const absolute = (paths: Record<string, string>) => Object.fromEntries(Object.entries(paths).map(([l, p]) => [l, `${SITE_URL}${p}`]));
  return [undefined, ...SERVICES].flatMap((service?: Service) =>
    locales.map((l) => ({ url: `${SITE_URL}${pagePath(l, service)}`, alternates: { languages: absolute(languages(service)) } })),
  );
}
