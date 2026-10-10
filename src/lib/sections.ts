import { locales, type Locale } from "@/app/[lang]/dictionaries";

/** The four services, in the client's order: each has its own page and its band on the homepage. */
export const SERVICES = ["rental", "sales", "import", "parts"] as const;
export type Service = (typeof SERVICES)[number];

/** Each service page's address, in its language's own words. */
const SLUGS: Record<Locale, Record<Service, string>> = {
  es: { rental: "renta", sales: "venta", import: "importacion", parts: "repuestos" },
  en: { rental: "rental", sales: "sales", import: "import", parts: "parts" },
};

export const slugs = (lang: Locale) => SERVICES.map((s) => SLUGS[lang][s]);
export const serviceOf = (lang: Locale, slug: string) => SERVICES.find((s) => SLUGS[lang][s] === slug);

/** The homepage, or a service's page. */
export const pagePath = (lang: Locale, service?: Service) => (service ? `/${lang}/${SLUGS[lang][service]}` : `/${lang}`);

/** A page in every language, and the one for any other language: the homepage's "/" picks by the
 *  browser's language (src/proxy.ts), a service page falls back to Spanish. */
export const languages = (service?: Service) => ({
  ...Object.fromEntries(locales.map((l) => [l, pagePath(l, service)])),
  "x-default": service ? pagePath("es", service) : "/",
});

/** The menu, in order (the header, the phone menu and the footer). */
export const NAV = [...SERVICES, "about", "contact"] as const;
export type NavKey = (typeof NAV)[number];

/** A service goes to its page, About to the homepage's band, Contact to the band every page ends with. */
export const navHref = (lang: Locale, k: NavKey) => (k === "contact" ? "#contact" : k === "about" ? `/${lang}#about` : pagePath(lang, k));
