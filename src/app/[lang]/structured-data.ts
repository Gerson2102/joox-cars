import { EMAIL, PHONE, RENTAL_OPERATOR, SITE_URL, SOCIAL } from "@/lib/contact";
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
    ...("km" in c ? { mileageFromOdometer: { "@type": "QuantitativeValue", value: c.km, unitCode: "KMT" } } : {}),
  },
});

/** The rentals are contracted with GAMA Car Rental; its legal ID is the cédula jurídica. */
const operator = { "@type": "Organization", name: RENTAL_OPERATOR.name, taxID: RENTAL_OPERATOR.id };

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
      { "@type": "OfferCatalog", name: t.rental.title, itemListElement: t.rental.cars.map((c) => ({ ...offer(c), offeredBy: operator })) },
      { "@type": "OfferCatalog", name: t.sales.title, itemListElement: t.sales.cars.map(offer) },
    ],
  };
}

/** The common questions as schema.org JSON-LD; an answer still waiting for the client's details stays out. */
export function faqJsonLd(t: Dictionary) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.faq.items
      .filter((f) => known(f.a))
      .map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}
