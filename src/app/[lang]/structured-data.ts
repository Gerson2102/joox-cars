import { EMAIL, PHONE, SITE_URL, SOCIAL } from "@/lib/contact";
import { FLEET_TOGETHER, PHOTOS } from "@/lib/fleet";
import type { Dictionary, Locale } from "./dictionaries";

type Car = Dictionary["rental"]["cars"][number] | Dictionary["sales"]["cars"][number];

/** Placeholder copy is bracketed ("[AÑO]"); it stays out of structured data. */
const known = (value: string) => (value.includes("[") ? undefined : value);

const offer = (c: Car) => ({
  "@type": "Offer",
  itemOffered: {
    "@type": "Car",
    name: `${c.brand} ${c.model}`,
    brand: { "@type": "Brand", name: c.brand },
    model: c.model,
    vehicleModelDate: known(c.year),
    color: c.color,
    vehicleTransmission: c.gearbox,
    seatingCapacity: Number(c.seats),
  },
});

/** The business as schema.org JSON-LD, for search engines and AI assistants. */
export function businessJsonLd(t: Dictionary, lang: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": ["AutoRental", "AutoDealer"],
    "@id": `${SITE_URL}/#business`,
    name: "JOOX CARS",
    url: `${SITE_URL}/${lang}`,
    logo: `${SITE_URL}/brand/joox-cars-lockup.webp`,
    image: `${SITE_URL}${PHOTOS[FLEET_TOGETHER].src}`,
    description: t.meta.description,
    slogan: t.footer.tagline,
    telephone: PHONE.href.replace("tel:", ""),
    email: EMAIL,
    address: { "@type": "PostalAddress", addressLocality: "Guápiles", addressRegion: "Limón", addressCountry: "CR" },
    areaServed: { "@type": "Country", name: "Costa Rica" },
    knowsLanguage: ["es", "en"],
    sameAs: SOCIAL.map((s) => s.href),
    hasOfferCatalog: [
      { "@type": "OfferCatalog", name: t.rental.title, itemListElement: t.rental.cars.map(offer) },
      { "@type": "OfferCatalog", name: t.sales.title, itemListElement: t.sales.cars.map(offer) },
    ],
  };
}
