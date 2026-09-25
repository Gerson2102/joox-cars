---
version: 2
slug: "src-app-lang-page-tsx"
primary_target: "src/app/[lang]/page.tsx"
related_targets: []
---

# Surface: JOOX CARS homepage (/es, /en)

Mode: Persuade. One long homepage, Spanish and English from the start, rental first.

## Audience, job, action
- Tourists and locals arriving from social links on phones; import customers who fear scams and surprise taxes; buyers of vehicles and spare parts.
- Primary action: rent a car (see the fleet, reserve over WhatsApp). Secondary: get an import quote. WhatsApp one tap away everywhere.
- Proof on hand (2026-09-25): the logo, the name, the tagline, the four services; the family's story; phone, email, Guápiles address and social profiles; 20 cars imported, 12 sold; the client's own phone photos of its three rental cars, its one car for sale and its imports (1280 px, front three-quarter views, no side profiles). Still promised: prices, the Jeep's year and mileage, import time, hours, reviews, FAQ answers, the parts catalogue, a family photo: until then, placeholders, never invented.
- Fleet size: three rental cars and one car for sale.

## Constraints
- Light site (client). Logo colours: yellow #FDCD03, near-black #131313, on white.
- The hero is the full-bleed V2 JOOX film (the client chose it on 2026-09-24, see FIRST VIEWPORT); it does not change in this redesign.
- Must not read as a generic dealership, cold tech, cheap/loud, or stiff corporate (client).

## Direction contract

THESIS: After the film, the page is the JOOX brand itself: full-width bands of white, JOOX yellow and black, like the logo, each carrying one service. Rental leads; the cars stand in a showroom on yellow, one at a time, side-on, like a manufacturer's configurator. It refuses the dealership grid of price-stickered thumbnails and the cheap loudness of a yellow-everything page: every band has one job and plenty of air.

OWN-WORLD: Three grounds only: paper white, JOOX yellow #FDCD03 and ink #131313, used as whole bands in a fixed rhythm (never two yellows or two blacks in a row). Text is ink on white and yellow and white on black; secondary text is the same ink or white at reduced strength, never grey on yellow. Brand devices from the logo, used sparingly: the ◂ ▸ triangles that flank CARS (markers, carousel controls, the import journey's direction) and the infinity loop of the OO (drawn once, large, in About). The lockup's yellow "ETERNAL" sets the About headline. Archivo throughout: expanded ExtraBold for display, normal width for text, semi-condensed tracked caps for short labels. Yellow is a ground and the primary action on white or black; on a yellow band the action is black. No gradients outside the hero film's scrims and no cards-with-icons. Depth is used twice and only for a reason: the floating header capsule (a soft offset shadow, a legibility blur over the content passing beneath) and each car's own ground shadow.

STORY: The visitor watches the car drive through JOOX and reads that they can rent a car JOOX imported itself. White band: the four services at a glance. Yellow band: the rental cars, one tap to book on WhatsApp. White band: how an import works, with the time and a quote. Black band: ask for a spare part. Yellow band: cars for sale, or ask JOOX to import one. Black band: who JOOX is, driven by eternal purpose. White: what customers say and the common questions. Black: WhatsApp, address, hours and the map.

FIRST VIEWPORT (revised 2026-09-24 at the client's request: the full-bleed stage from /heroes/2, with the brand applied): the JOOX film fills the whole first screen, the car driving through the word JOOX. The header floats over it, transparent: reversed logo (white letters, yellow infinity), white links, ES/EN switch, white WhatsApp pill; it turns into the white bar once the film is scrolled past. The copy sits in the dark canopy top-left: white Archivo display headline in 3 lines, sub, yellow Rent a car and a white outline Import quote. No film controls or captions (removed 2026-09-25 at the user's request); the film plays on its own, pauses offscreen, and is left as shot outside the scrims behind the header and the copy. Phone: the film is a band over the top, the copy on ink below it, actions stacked.

FORM: Yellow & black bands, chosen by the user on 2026-09-24 from four proposed directions (bands, cinematic showroom, refined route, editorial chapters). Replaces the Road Atlas route system below the hero. Band order: services (white), rental (yellow), import (white), parts (black), sales (yellow), about (black), reviews and FAQ (white), contact and location (black), footer (white).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Signature interaction

Revised 2026-09-24 at the client's request (reference: a "pick your dream car" side-profile carousel; "premium, like a 10k website", "the site feels static").

- Focal moment: the showroom carousels (rental and sales). Side-profile model photos of the client's cars (recoloured to their paint where needed, labelled and credited) on a dotted studio floor, the car on show at full size and in focus, its neighbours pushed to the page edges and blurred (revised 2026-09-25 at the user's request, after the configurator reference), the model's name huge and outlined behind it. The cars drive the way they face (the rental cars left; the car for sale faces right); the next arrives from behind as the current one moves on, and they drive in once when the band comes into view. A single car stands alone. Revised 2026-09-25 when the client's real photos arrived (the user chose "showroom + real photos"): each car's real photos open full screen from "See photos", the rental band closes on the fleet together at home, and the import band carries a strip of the client's own imports. Because the client's photos are three-quarter views, every car on the stage is a model photo; its own photos are under "See photos".
- Band transition: coloured bands open from their centre outward as they arrive, echoing the JOOX curtain in the hero film (CSS scroll-driven; finished state elsewhere and under reduced motion).
- Supporting: the import road runs through its steps in a loop while on screen (the user asked for a loop, not scroll-driven), and the import photos travel sideways as you scroll (the user asked for scroll-driven); titles unmask upward; lists stagger in; the About loop draws once, then a mark travels it without end.
- Feedback: one button across the site (the icon capsule floods the button, the label rolls); the header becomes a floating capsule past the film with a yellow pill under the section being read.
