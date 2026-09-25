# JOOX CARS: rental, US import, spare parts and vehicle sales

The website of JOOX CARS, a Costa Rican business that rents cars from its own fleet, imports vehicles from US auctions, and sells vehicles and spare parts. The homepage is light, in Spanish and English from the start.

| Route | What it is |
| --- | --- |
| `/` | Redirects to `/en` when the browser's first language is English, to `/es` otherwise (`src/proxy.ts`) |
| `/es`, `/en` | The homepage |

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

### Deploy

On Vercel, from the GitHub repo, with the defaults (framework Next.js, `npm run build`). No environment variables. Every page is prerendered; `src/proxy.ts` runs as a function for the `/` redirect. The media in `public/` is built ahead of time by `scripts/media/` and committed, so the build needs no Python or ffmpeg. The sources stay local and are gitignored: `.media-src/`, `work/`, the client's raw photos (`cars-*/`) and `references/` (except the logo).

Next.js 16 (App Router), React 19 and plain CSS modules. The homepage is set in Archivo (with its width axis, `font-stretch: 125%` for display type), loaded with `next/font`. No animation library: motion is CSS, plus a few small scripts.

## The homepage

One long page. The JOOX film fills the first screen, then the brand takes over: full-width bands of white, JOOX yellow and black, like the logo, one service per band. The logo's ◂ ▸ triangles mark titles, links and controls, and its infinity loop is drawn once, large, in About.

The page moves as you scroll. Coloured bands open from their centre like the JOOX curtain in the hero film. Titles unmask upward and lists come in one after another. The import road runs through its steps in a loop, and the import photos travel sideways as you scroll. The cars drive into the showrooms. Every button is the same premium pill: its icon capsule floods the button on hover while the label rolls.

- **Hero:** the JOOX film (V2, baked: the car drives through the word) fills the whole first screen, with the header floating over it (reversed logo, white type). The headline, sub and two calls to action (yellow "Rent a car", white outline import quote) sit in the dark canopy top-left; the rest of the film is left as shot, with no controls or captions on it. On phones the film is a band on top and the copy sits on black below it.
- **Services (white):** the four services at a glance; each tile turns yellow on hover and jumps to its band.
- **Rental (yellow):** a showroom carousel of the client's three rental cars (Outlander Sport 2020 orange, Sportage 2020, Outlander Sport 2015), after the configurator reference the client chose. One car in side profile at full size and in focus on a dotted studio floor, the model's name huge and outlined behind it; its neighbours wait at the page edges, smaller and blurred. The cars on the stage are model photos (Commons photos of the same model, recoloured to the client's paint where needed), labelled and credited; "See photos (4)" opens the client's own photos full screen. Below: make and model, daily price and "Book on WhatsApp" (the message names the car), then year, engine, gearbox, seats and colour, and the progress bars with the count. ◂ ▸ beside the car (or a swipe, a click on a neighbour, or the arrow keys) bring the next one into focus as the cars drive left. They drive in the first time the band comes into view. The band closes on the client's photo of the three together on the grass in Guápiles.
- **Import (white):** the six steps as a journey left to right (downward on phones). While on screen the road runs through the steps on its own, in a loop, each number lighting as the fill reaches it. Then "20 cars imported so far": the client's own import photos, which the band holds in view while scrolling carries them sideways, with a count and a progress line (any photo opens full screen). Then the approximate time and the quote button.
- **Spare parts (black):** title left, the make/model/year/part form right. There is no backend; it writes the request into a WhatsApp message.
- **Sales (yellow):** "We import them, repair them if needed and get them ready to sell. 12 sold so far." The same showroom with the one car for sale, a black Jeep Wrangler Unlimited, in side profile and standing on its own (no arrows), with its five real photos, and year, mileage and price in brackets. Below it, "Not seeing the one you want?" leads to the import quote.
- **About (black):** "Driven by eternal purpose" (ETERNAL in yellow, as in the lockup), then the family's story in their own words (from 2021 in Puntarenas and Cóbano to Guápiles, and JOOX Cars in 2026). The loop draws itself when it comes into view, then a small mark travels it without end, staying beside the story as it scrolls.
- **Reviews and FAQ (white):** three review placeholders, then the common questions. One opens at a time; the answer slides open and the plus turns into a yellow cross. A black panel beside the list offers WhatsApp for anything else.
- **Contact (black):** a large WhatsApp button; phone, email, address (Guápiles, Pococí, Limón), hours and the Facebook, Instagram and TikTok profiles; beside them, Guápiles in the display voice with a link to Google Maps.

### Where things live

- Copy: `messages/es.json` and `messages/en.json` (same shape; the `Dictionary` type comes from the Spanish file).
- Routing and the page: `src/app/[lang]/` (`layout.tsx`, `page.tsx`, `dictionaries.ts`, `site.css` with the colour and type tokens) and `src/proxy.ts`.
- Homepage components: `src/components/site/`.
  - `SiteHeader`: fixed header with the logo, section links, the language switch, WhatsApp, and the phone menu. Transparent over the hero film; past it, a floating white capsule with a yellow pill under the section being read.
  - `HeroStage`: the full-bleed hero: film and poster, the scrims behind the header and the copy, and the copy. `useFilm` loads the film (poster first; AV1, or H.264 where AV1 cannot play).
  - `CarCarousel`: the showroom carousel (rental and sales; a single car stands without arrows). The car copy is in the dictionaries; the side-view cutouts with their credits, and the client's photos, in `src/lib/fleet.ts`.
  - `PhotoViewer`: the client's photos full screen on ink (a native modal dialog: arrows, swipe, keys, thumbnails).
  - `ProofStrip`: the import band's strip of the client's own import photos, carried sideways by the scroll.
  - `Journey`: the import steps, their road running through them in a loop while on screen.
  - `Btn`: the site's button (variants for each ground; arrow, WhatsApp, photos or external icon).
  - `Faq`: the questions accordion.
  - `ScrollFX`: marks elements as they enter the view, for the title and list reveals.
  - `Loop`: the About band's infinity loop.
  - `PartsForm`: the spare-parts request.
  - `Fold`: on phones, import and parts fold to their title and lead until opened (arriving by their link opens them).
- WhatsApp links: `src/lib/whatsapp.ts`. Phone, email, social profiles and the map link: `src/lib/contact.ts`.
- Media and the source of every asset: `scripts/media/`, documented in `ASSETS.md`.

### Behaviour

- **Loading:** the poster is the LCP (preloaded, with a separate phone crop). The film loads after the page does (or after 3 s at most), and never for reduced motion, Save-Data, 2G or 3G. Images are WebP in `public/` and reach the browser as AVIF at the size shown (`next/image`).
- **Scroll effects:** the band curtains are CSS scroll-driven animations (Chrome, Edge, Safari 26+); other browsers show them finished. The import strip is carried sideways by the page's scroll from a script (`ProofStrip`), eased each frame; without it, it is a swipeable row. Reveals are gated on `<html data-fx="on">`, which the script sets, so a failed script never hides content.
- **Reduced motion:** the poster only; bands open, the import road full and still, the import strip a plain row, the About loop drawn and still; titles, lists and cars appear without moving.
- **Phones:** the import steps and the parts form fold flat until opened (the import photos, time and quote button stay open); without JavaScript everything shows. The carousels, the import strip and the photo viewer swipe.
- **Menu (phones):** a black sheet rendered on `<body>`: the tagline, then the links, each marked with the logo's yellow triangle. The page behind it is inert and Escape closes it.
- **Language:** each page links to the other language in the header and the footer.

### Placeholders

- **WhatsApp number:** set to the client's phone (+506 8716 3308), to be confirmed as its WhatsApp.
- **Content in brackets:** rental prices, the Jeep's year, mileage and price, import time, hours, reviews, and the FAQ answers that need the client (requirements, insurance, warranty) (`[PRECIO]`, `[X semanas]` and so on).
- **Photos:** the showroom cars are Wikimedia Commons side views of the same models, recoloured to the client's paint where needed, labelled "Model photo" and credited; the client's own photos (plates softened) are in each car's viewer, the fleet photo and the import strip. The hero film is still stock, labelled on the page.
- **Logo:** cut from the logo raster (plus a reversed version for the header over the film) until the vector logo arrives.

`ASSETS.md` lists each one and what replaces it.
