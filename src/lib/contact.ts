// JOOX CARS's own details, the same in both languages. Labels live in messages/*.json.

export const SITE_URL = "https://jooxcars.com";
export const PHONE = { label: "+506 8716-3308", href: "tel:+50687163308" };
export const EMAIL = "joox.joy.1813@gmail.com";

/** The company the rental contract is with: JOOX's rentals are operated by it. */
export const RENTAL_OPERATOR = { name: "GAMA Car Rental", id: "3-101-842761" };

/** Central Guápiles: the client wants no exact address or pin. */
const PLACE = encodeURIComponent("Guápiles, Pococí, Limón, Costa Rica");
export const MAP_URL = `https://www.google.com/maps/search/?api=1&query=${PLACE}`;
/** The same place as an embedded map (no API key needed), labelled in the page's language. */
export const mapEmbed = (lang: string) => `https://www.google.com/maps?q=${PLACE}&hl=${lang}&z=13&output=embed`;

// Profile links without the share-tracking parameters they were copied with.
export const SOCIAL = [
  { name: "Facebook", href: "https://www.facebook.com/profile.php?id=61587259602081" },
  { name: "Instagram", href: "https://www.instagram.com/joox6287" },
  { name: "TikTok", href: "https://www.tiktok.com/@joox7731" },
];
