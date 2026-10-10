// JOOX CARS's fixed details, the same in both languages. Labels live in messages/*.json;
// the phone, WhatsApp, email, hours and social profiles are edited in the CMS
// (content/contact.json, read by src/lib/content.ts).

export const SITE_URL = "https://jooxcars.com";

/** The company the rental contract is with: JOOX's rentals are operated by it. */
export const RENTAL_OPERATOR = { name: "GAMA Car Rental", id: "3-101-842761" };

/** The hours for search engines: they must match the hours the client writes in the CMS. */
export const HOURS = { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "09:00", closes: "18:00" };

/** Where the rental car is delivered and collected at no cost. */
export const DELIVERY = ["Guápiles, Limón", "Jiménez, Pococí, Limón", "Guácimo, Limón"];

/** The rental price the FAQ states, as a number for structured data. */
export const RENTAL_FROM_CRC = 40000;

/** Central Guápiles: the client wants no exact address or pin. */
const PLACE = encodeURIComponent("Guápiles, Pococí, Limón, Costa Rica");
export const MAP_URL = `https://www.google.com/maps/search/?api=1&query=${PLACE}`;
/** The same place as an embedded map (no API key needed), labelled in the page's language. */
export const mapEmbed = (lang: string) => `https://www.google.com/maps?q=${PLACE}&hl=${lang}&z=13&output=embed`;
