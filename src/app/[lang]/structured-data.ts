import { DELIVERY, HOURS, RENTAL_FROM_CRC, RENTAL_OPERATOR, SITE_URL } from "@/lib/contact";
import type { Car, Contact } from "@/lib/content";
import { FLEET_TOGETHER, PHOTOS } from "@/lib/fleet";
import { SERVICES, pagePath, type Service } from "@/lib/sections";
import type { Dictionary, Locale } from "./dictionaries";

// schema.org JSON-LD, for search engines and AI assistants. The homepage describes the business; each
// service page describes its service, with its own questions, so every fact is marked up once.

/** JSON-LD for a script tag, with "<" escaped so the data can never close the tag. */
export const ld = (data: object) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });

const graph = (...nodes: object[]) => ({ "@context": "https://schema.org", "@graph": nodes });
const url = (path: string) => `${SITE_URL}${path}`;
const serviceId = (lang: Locale, s: Service) => `${url(pagePath(lang, s))}#service`;

/** Placeholder copy is bracketed ("[AÑO]"); it stays out of structured data. */
const known = (value: string) => (value.includes("[") ? undefined : value);

const BUSINESS_ID = `${SITE_URL}/#business`;
const BUSINESS_TYPE = ["AutoRental", "AutoDealer"];
const COUNTRY = { "@type": "Country", name: "Costa Rica" };

/** The rentals are contracted with GAMA Car Rental; its legal ID is the cédula jurídica. */
const operator = { "@type": "Organization", name: RENTAL_OPERATOR.name, taxID: RENTAL_OPERATOR.id };

const offer = (t: Dictionary, c: Car) => ({
  "@type": "Offer",
  itemOffered: {
    "@type": "Car",
    name: `${c.brand} ${c.model}`,
    image: c.photos[0] && url(c.photos[0].src),
    brand: { "@type": "Brand", name: c.brand },
    model: c.model,
    vehicleModelDate: known(c.year),
    bodyType: c.body,
    color: c.color,
    vehicleTransmission: t.carousel.gearbox[c.gearbox],
    seatingCapacity: Number(c.seats),
    ...(c.drive ? { driveWheelConfiguration: c.drive } : {}),
    ...(c.mileage ? { mileageFromOdometer: { "@type": "QuantitativeValue", value: c.mileage, unitCode: c.unit === "mi" ? "SMI" : "KMT" } } : {}),
  },
});

const catalog = (name: string, items: object[]) => ({ "@type": "OfferCatalog", name, itemListElement: items });

/** The import fee as the client writes it in the CMS ("$1000"): colones with a "₡", dollars otherwise; none if it has no amount. */
function feeOffer(name: string, fee: string) {
  const price = Number(fee.replace(/[^\d.]/g, ""));
  return price > 0 ? { offers: { "@type": "Offer", name, price, priceCurrency: fee.includes("₡") ? "CRC" : "USD" } } : {};
}

/** What each service offers: the cars with the rental's starting rate, the cars for sale, the import fee. Parts
 *  are priced per part (the description says how). */
function offers(t: Dictionary, s: Service, cars: Car[], fee: string) {
  switch (s) {
    case "rental":
      return {
        offers: { "@type": "Offer", priceSpecification: { "@type": "UnitPriceSpecification", minPrice: RENTAL_FROM_CRC, priceCurrency: "CRC", unitCode: "DAY" } },
        hasOfferCatalog: catalog(t.rental.list, cars.map((c) => ({ ...offer(t, c), offeredBy: operator }))),
      };
    case "sales":
      return { hasOfferCatalog: catalog(t.sales.list, cars.map((c) => offer(t, c))) };
    case "import":
      return feeOffer(t.import.fee, fee);
    case "parts":
      return {};
  }
}

/** The homepage: the business, its four services, and the site. */
export function homeJsonLd(t: Dictionary, lang: Locale, contact: Contact) {
  return graph(
    {
      "@type": BUSINESS_TYPE,
      "@id": BUSINESS_ID,
      name: "JOOX CARS",
      url: url(pagePath(lang)),
      logo: url("/brand/joox-cars-lockup.webp"),
      image: url(PHOTOS[FLEET_TOGETHER].src),
      description: t.meta.description,
      slogan: t.footer.tagline,
      telephone: contact.phone.href.replace("tel:", ""),
      email: contact.email,
      address: { "@type": "PostalAddress", addressLocality: "Guápiles", addressRegion: "Limón", addressCountry: "CR" },
      openingHoursSpecification: { "@type": "OpeningHoursSpecification", dayOfWeek: HOURS.days, opens: HOURS.opens, closes: HOURS.closes },
      priceRange: t.meta.priceRange,
      areaServed: COUNTRY,
      knowsLanguage: ["es", "en"],
      sameAs: contact.social.map((s) => s.href),
      makesOffer: SERVICES.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", "@id": serviceId(lang, s), name: t.services.items[s].name, url: url(pagePath(lang, s)) },
      })),
    },
    { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: "JOOX CARS", inLanguage: lang, publisher: { "@id": BUSINESS_ID } },
  );
}

/** A service page: the service (who provides it, where, at what price), its place in the site, and its questions. */
export function serviceJsonLd(t: Dictionary, lang: Locale, s: Service, { cars, faq, fee }: { cars: Car[]; faq: { q: string; a: string }[]; fee: string }) {
  const page = url(pagePath(lang, s));
  const faqs = faq.filter((f) => known(f.a));
  return graph(
    {
      "@type": "Service",
      "@id": serviceId(lang, s),
      name: t.pages[s].h1,
      serviceType: t.services.items[s].name,
      description: t.pages[s].description,
      url: page,
      provider: { "@type": BUSINESS_TYPE, "@id": BUSINESS_ID, name: "JOOX CARS", url: url(pagePath(lang)) },
      // The rental car is delivered in three towns; the rest reaches the whole country.
      areaServed: s === "rental" ? DELIVERY.map((name) => ({ "@type": "Place", name })) : COUNTRY,
      ...offers(t, s, cars, fee),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "JOOX CARS", item: url(pagePath(lang)) },
        { "@type": "ListItem", position: 2, name: t.services.items[s].name, item: page },
      ],
    },
    ...(faqs.length
      ? [{ "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }]
      : []),
  );
}
