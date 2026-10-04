# JOOX CARS: rental, US import, spare parts and vehicle sales

The website of JOOX CARS, a Costa Rican business that rents cars from its own fleet, imports vehicles from US auctions, and sells vehicles and spare parts. A light site in Spanish and English: the homepage, and a page for each service.

| Route | What it is |
| --- | --- |
| `/` | Redirects to `/en` when the browser's first language is English, to `/es` otherwise (`src/proxy.ts`) |
| `/es`, `/en` | The homepage |
| `/es/renta`, `/es/venta`, `/es/importacion`, `/es/repuestos` (`/en/rental`, `/en/sales`, `/en/import`, `/en/parts`) | Each service's page (`src/app/[lang]/[service]/page.tsx`) |
| Any other URL | A 404 in Spanish and English with the way home in each (`src/app/global-not-found.tsx`) |

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

### Test

End-to-end checks in `e2e/` (Playwright, Chromium) build the site, serve it on port 3100 and walk it: the language redirect, both homepages, every service page in both languages (title, h1, alternates, its questions and structured data), every car and the full import process in the HTML crawlers get, the sitemap, the 404, the parts form's WhatsApp message, the showroom and its photos, the language switch, and the phone menu. They read their text from `messages/`, so copy edits don't break them.

```bash
npx playwright install chromium   # once per machine
npm test
```

### Deploy

On Vercel, from the GitHub repo, with the defaults (framework Next.js, `npm run build`). No environment variables. Every page is prerendered; `src/proxy.ts` runs as a function for the `/` redirect. The media in `public/` is built ahead of time by `scripts/media/` and committed, so the build needs no Python or ffmpeg. The sources stay local and are gitignored: `.media-src/`, `work/`, the client's raw photos (`cars-*/`) and `references/` (except the logo).

Next.js 16 (App Router), React 19 and plain CSS modules. The homepage is set in Archivo (with its width axis, `font-stretch: 125%` for display type), loaded with `next/font`. No animation library: motion is CSS, plus a few small scripts.

## The homepage

One long page. The JOOX film fills the first screen, then the brand takes over: full-width bands of white, JOOX yellow and black, like the logo, one service per band. The logo's ◂ ▸ triangles mark titles, links and controls, and its infinity loop is drawn once, large, in About.

The page moves as you scroll. Coloured bands open from their centre like the JOOX curtain in the hero film. Titles unmask upward and lists come in one after another. The import road runs through its steps in a loop, and the import photos travel sideways as you scroll. The cars drive into the showrooms. Every button is the same premium pill: its icon capsule floods the button on hover while the label rolls.

- **Hero:** the JOOX film (V2, baked: the car drives through the word) fills the whole first screen, with the header floating over it (reversed logo, white type). The client's headline "Tu vehículo. Nuestra experiencia.", the sub (what JOOX CARS is, in one sentence: see Search and AI below) and two calls to action (yellow "Ver vehículos", white outline "Cotizar importación") sit in the dark canopy top-left; the rest of the film is left as shot, with no controls or captions on it. On phones the film is a band on top and the copy sits on black below it.
- **Services (white):** the four services at a glance, in the client's order (rental, sales, import, parts); each tile turns yellow on hover and leads to its page.
- **Rental (yellow):** a showroom carousel of the client's four rental cars (Outlander Sport 2020 orange, Sportage 2020, Outlander Sport 2015, and the white Outlander 2016, marked as coming soon), after the configurator reference the client chose. One car in side profile at full size and in focus on a dotted studio floor, the model's name huge and outlined behind it; its neighbours wait at the page edges, smaller and blurred. The cars on the stage are model photos (Commons photos of the same model, recoloured to the client's paint where needed), labelled and credited; "See photos (4)" opens the client's own photos full screen. Below: make and model, a note that rates change with the season (no price) and "Book on WhatsApp" (the message names the car), then year, engine, gearbox, seats and colour, and the progress bars with the count. ◂ ▸ beside the car (or a swipe, a click on a neighbour, or the arrow keys) bring the next one into focus as the cars drive left. They drive in the first time the band comes into view. The band closes on the client's photo of the three together on the grass in Guápiles, captioned with the tagline.
- **Sales (white):** the same showroom with the two cars for sale, a black Jeep Wrangler Unlimited and the white Outlander 2016 (coming soon, also for rent), in side profile, with the Jeep's five real photos, and year and mileage but no price (it is asked about on WhatsApp); here the WhatsApp button is yellow. Below it, "¿Ya tenés tu próximo vehículo en mente?" leads to the import page.
- **Import (black):** the eight steps as a journey left to right (4 × 2 at ≤1100px, downward on phones). While on screen the road runs through the steps on its own, in a loop, each number lighting as the fill reaches it. "Ver el proceso completo" leads to the import page, which has the client's full process: twelve steps in two stages, in the US and in Costa Rica. Then "20 cars imported so far": the client's own import photos, which the band holds in view while scrolling carries them sideways, with a count and a progress line (any photo opens full screen). Then the approximate time and the quote button.
- **Spare parts (yellow):** title left, the make/model/year/part form right, in ink wells. There is no backend; it writes the request into a WhatsApp message.
- **About (black):** "Driven by eternal purpose" (ETERNAL in yellow, as in the lockup) over what JOOX CARS is in one sentence, then the client's mission, vision, JOOX DNA (Conectar · Resolver · Acompañar), what JOOX does, and what the name means (the OO as wheels in endless motion). The loop draws itself when it comes into view, then a small mark travels it without end, staying beside the text as it scrolls.
- **Reviews and FAQ (white):** three customer reviews, then the common questions. One opens at a time; the answer slides open and the plus turns into a yellow cross. A black panel beside the list offers WhatsApp for anything else.
- **Contact (black):** a large WhatsApp button; phone, email, address (Guápiles, Pococí, Limón), hours (Monday to Saturday, 9 to 6) and the Facebook, Instagram and TikTok profiles; beside them, Guápiles in the display voice with a link to Google Maps.

### The service pages

Each service has its own page, so a search for that service lands on a page about it alone. It opens on the service's band, whose title is the page's h1 ("Renta de carros en Guápiles", "Importación de vehículos desde EE. UU. a Costa Rica"…); there is no film above it, so the header is the capsule from the start and the band has no curtain. Then the service's own questions, then contact.

- **Rental (`/es/renta`):** the showroom and the fleet together; the four rental questions (requirements, rates, delivery, insurance).
- **Sales (`/es/venta`):** the showroom of the cars for sale and the import callout; the warranty question.
- **Import (`/es/importacion`):** the journey, the full twelve-step process under it (open, `#process`), the import photos, the time, the fee and the quote; the three import questions.
- **Parts (`/es/repuestos`):** the request form and how parts are priced, unfolded on phones too; the two parts questions.

The homepage keeps every band as before (the questions all together), and its menu, service tiles and footer lead to these pages.

### Where things live

- Copy: `messages/es.json` and `messages/en.json` (same shape; the `Dictionary` type comes from the Spanish file).
- Routing and the pages: `src/app/[lang]/` (`layout.tsx` with the header and footer, `page.tsx` the homepage, `[service]/page.tsx` the service pages, `dictionaries.ts`, `metadata.ts` and `structured-data.ts` for search, `site.css` with the colour and type tokens) and `src/proxy.ts`. The services, their addresses in each language and the menu: `src/lib/sections.ts`.
- Components: `src/components/site/`.
  - `SiteHeader`: fixed header with the logo, the menu links, the language switch, WhatsApp, and the phone menu. Transparent over the homepage's hero film; past it, and on the service pages, a floating white capsule with a yellow pill under the section being read.
  - `Bands`: the bands the homepage and the service pages share (rental, sales, import, parts, questions, contact); a service page opens on its band with the title as the h1.
  - `SiteFooter`: every page's footer.
  - `HeroStage`: the full-bleed hero: film and poster, the scrims behind the header and the copy, and the copy. `useFilm` loads the film (poster first; AV1, or H.264 where AV1 cannot play).
  - `CarCarousel`: the showroom carousel (rental and sales; a single car stands without arrows). The car copy is in the dictionaries; the side-view cutouts with their credits, and the client's photos, in `src/lib/fleet.ts`.
  - `PhotoViewer`: the client's photos full screen on ink (a native modal dialog: arrows, swipe, keys, thumbnails).
  - `ProofStrip`: the import band's strip of the client's own import photos, carried sideways by the scroll.
  - `Journey`: the import steps, their road running through them in a loop while on screen.
  - `ImportProcess`: the client's full import process, on the import page under the journey.
  - `Btn`: the site's button (variants for each ground; arrow, WhatsApp, photos or external icon).
  - `Faq`: the questions accordion.
  - `ScrollFX`: marks elements as they enter the view, for the title and list reveals.
  - `Loop`: the About band's infinity loop.
  - `PartsForm`: the spare-parts request.
  - `Fold`: on the homepage on phones, import and parts fold to their title and lead until opened (arriving by their link opens them).
- WhatsApp links: `src/lib/whatsapp.ts`. Phone, email, social profiles and the map link: `src/lib/contact.ts`.
- Media and the source of every asset: `scripts/media/`, documented in `ASSETS.md`.

### Behaviour

- **Loading:** the poster is the LCP (preloaded, with a separate phone crop). The film loads after the page does (or after 3 s at most), and never for reduced motion, Save-Data, 2G or 3G. Images are WebP in `public/` and reach the browser as AVIF at the size shown (`next/image`).
- **Scroll effects:** the band curtains are CSS scroll-driven animations (Chrome, Edge, Safari 26+); other browsers show them finished. The import strip is carried sideways by the page's scroll from a script (`ProofStrip`), eased each frame; without it, it is a swipeable row. Reveals are gated on `<html data-fx="on">`, which the script sets, so a failed script never hides content.
- **Reduced motion:** the poster only; bands open, the import road full and still, the import strip a plain row, the About loop drawn and still; titles, lists and cars appear without moving.
- **Phones:** on the homepage the import steps and the parts form fold flat until opened (the import photos, time and quote button stay open); their own pages show them open, and without JavaScript everything shows. The carousels, the import strip and the photo viewer swipe.
- **Menu (phones):** a black sheet rendered on `<body>`: the tagline, then the links, each marked with the logo's yellow triangle. The page behind it is inert and Escape closes it.
- **Language:** each page links to the same page in the other language in the header and the footer.

### Search and AI

- **One sentence says what JOOX CARS is:** "JOOX CARS es una empresa de renta, venta e importación de vehículos en Guápiles, Costa Rica." ("JOOX CARS is a car rental, sales and import company in Guápiles, Costa Rica."). The same words open the homepage's description, the hero and About; use them for the Instagram, Facebook and TikTok bios and the Google Business Profile too, so search engines and AI assistants describe the business the same way everywhere.
- **Every page** has its own title, description, canonical, alternates (es, en, x-default) and link preview (`public/brand/joox-cars-preview.jpg`), from `src/app/[lang]/metadata.ts`; the copy is under `meta` and `pages` in `messages/`.
- **Structured data** (`structured-data.ts`), each fact marked up once: the homepage carries the business (AutoRental and AutoDealer: contact, hours, area, price range, profiles, its four services) and the website; each service page carries its Service (provider, area, price, the cars), its place in the site and its own questions (FAQPage). The numbers it needs that the copy states in words (the rental's starting rate, the import fee, the hours) are in `src/lib/contact.ts`: change them with the copy.
- **`/sitemap.xml`** lists all ten pages with their languages; **`/robots.txt`** lets every crawler in, AI ones included.

### Stand-ins and sources

- **WhatsApp number:** +506 8716 3308, confirmed by the client as the business WhatsApp (the phone in the contact band opens it too).
- **Content:** no bracketed placeholders are left; every time, hours, review and FAQ answer on the page is the client's. The showrooms deliberately show no prices (rates change with the season; the cars for sale are asked about on WhatsApp); the questions give the rental's starting rate (₡40,000 a day) and the import fee ($1000).
- **Photos:** the showroom cars are Wikimedia Commons side views of the same models, recoloured to the client's paint where needed, labelled "Model photo" and credited; the client's own photos (plates softened) are in each car's viewer, the fleet photo and the import strip. The hero film is AI-generated, the version the client chose.
- **Logo and map:** the logo is cut from the logo raster (plus a reversed version for the header over the film); no vector logo is coming, so these and the favicon are final. The map shows central Guápiles, with no exact address or pin; that is final too.

`ASSETS.md` lists each one and what replaces it.
