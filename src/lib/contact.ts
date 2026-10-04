// JOOX CARS's fixed details, the same in both languages. Labels live in messages/*.json;
// the phone, WhatsApp, email, hours and social profiles are edited in the CMS
// (content/contact.json, read by src/lib/content.ts).

export const SITE_URL = "https://jooxcars.com";

/** The company the rental contract is with: JOOX's rentals are operated by it. */
export const RENTAL_OPERATOR = { name: "GAMA Car Rental", id: "3-101-842761" };

/** Guápiles centre until the client shares an exact address or a pin. */
const PLACE = encodeURIComponent("Guápiles, Pococí, Limón, Costa Rica");
export const MAP_URL = `https://www.google.com/maps/search/?api=1&query=${PLACE}`;
/** The same place as an embedded map (no API key needed), labelled in the page's language. */
export const mapEmbed = (lang: string) => `https://www.google.com/maps?q=${PLACE}&hl=${lang}&z=13&output=embed`;
