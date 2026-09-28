# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router, TypeScript) and plain CSS; motion is CSS plus small scripts. Deployed on Vercel from GitHub.

## Users

- **Rental customers (primary: tourists, secondary: locals).** Serve both, but tourists lead. They want to see the daily price, what the insurance includes, and a fast way to reach the company on WhatsApp.
- **Import customers (Costa Ricans).** They are afraid of auction scams and surprise import taxes. Before they bid, they want an estimate of the full cost.
- **Car enthusiasts.** People who care about cars. The site should make them stop scrolling.
- **Spare-parts buyers and vehicle buyers.** Confirmed as services; who these customers are and what they need has not been described yet.

Most traffic will likely come from social media on phones.

## Product Purpose

**JOOX CARS** is a Costa Rican company with four services (client's own wording, Spanish):

1. **Renta de vehículos:** car rental from its own fleet.
2. **Importación de vehículos 🇺🇸:** buying cars for clients at US auctions and bringing them to Costa Rica.
3. **Venta de repuestos de vehículo:** vehicle spare-parts sales.
4. **Venta de vehículos:** vehicle sales.

The company bought every car in its rental fleet at a US auction and imported it itself. That story ties rental and import together: renters are driving proof of the import service. Vehicle sales follow the same road: the company imports cars, repairs them if needed and prepares them for sale (client, 2026-09-25). Spare parts began as parts the company imported for its own cars from international platforms.

**About (client, 2026-09-28):** the client chose not to tell the family story on the site. About shows her mission, vision, JOOX DNA (Conectar · Resolver · Acompañar), what JOOX does, and the official meaning of the name: movement, global connection and complete automotive solutions, the "OO" as wheels in endless motion. Her pasted brand-interpretation suggestions ("¿Qué transmite el nombre JOOX?") were left out.

**Import (client, 2026-09-28):** the client's own process, twelve steps in two stages (in the US: contact, search, offer, purchase and payments, overland transport, shipping; in Costa Rica: unloading and warehouse, DEKRA inspection, tax assessment, tax payment, storage and release, approval and exit), summarised on the page as eight. An exact import price can't be given up front: the tow depends on where the car is, the ship on its size, storage on the time in the warehouse, and taxes on the vehicle; JOOX gives an approximate cost.

The project started as five hero explorations; the client chose "Car through the word" (the V2 film), which is the homepage hero, and the explorations were removed (2026-09-25). Success for the hero: a stranger understands what JOOX CARS offers within 5 seconds, and can see the primary CTA and WhatsApp without scrolling.

## Positioning

Premium. The website itself is the sales pitch, so it should feel like a high-end automotive brand, not a used-car lot. What competitors can't honestly claim: every rental car went through the company's own auction-to-Costa-Rica import process, so the rental fleet is visible proof of the import service.

## Operating Context

- Visitors mostly arrive on phones from social media links, often on slow Costa Rican mobile connections.
- WhatsApp is the main contact channel for both services.
- Import customers need to trust the company with money and a process they can't see, so a cost estimate before bidding is the key step.

## Capabilities and Constraints

- Mobile first. The primary CTA and WhatsApp must be visible in the first viewport on a phone.
- Fast on Costa Rican mobile networks. Hero media must be sized and loaded for slow connections.
- Language: Spanish (Costa Rica, vos form, the client's own voice since 2026-09-28) and English, both from the start, with a working language switch. All copy lives in dictionary files (`messages/es.json`, `messages/en.json`), and layouts must hold Spanish strings that run about 25% longer.
- Never invent numbers, prices, or claims. Use placeholders such as `[PRICE]`, `[X weeks]`, `[N cars imported]`.
- **Undecided:** which rental audience the final site leads with beyond "tourists first"; the exact primary CTA for each service.

## Brand Commitments

- **Name:** JOOX CARS.
- **Logo:** `references/brand/joox-cars-logo.png` (raster, 1254×1254 on white). A heavy black "JOOX" whose "OO" is drawn as a yellow infinity sign; "CARS" below, between two yellow arrow triangles. A vector original is needed for production use.
- **Tagline:** "Driven by eternal purpose" (the logo sets ETERNAL in yellow).
- **Brand colours (from the logo):** yellow ≈ #FDCD03, near-black ≈ #131313, on white.
- **Light site (binding, from the client):** the new homepage is a light design, not dark.
- **Video word:** the V2 hero film shows "JOOX"; the car passes through the gap between the two O's.
- **Premium means restraint and craft:** real cinematic footage, confident typography, deliberate pacing, one signature motion moment, nothing cheap or cluttered.
- **Voice:** short, confident, specific. No hype words ("best", "unbeatable", "luxury", "dream car"). Spanish copy uses vos ("buscás", "Conocé") and sentence case.
- **Hero technique (binding):** "fleet film + layering", as V2 "Car through the word". Photographic and cinematic, never illustrated. The exploration references are in `references/`:
  - `3. Fleet film@2x.png` and variants `3A. Word behind the ridge`, `3B. Car crosses the word`, `3C. Video inside the word`, `3D. Tropical foreground`, `3E. Out of the frame`
  - `6. Layered@2x.png`
  - `dribble-layering.png`

## Evidence on Hand

In the project: the logo (raster), the name, the tagline, the four services, and (from 2026-09-25):

- **Contact:** phone 8716-3308 (taken to be the WhatsApp number too, unconfirmed), joox.joy.1813@gmail.com, Guápiles, Pococí, Limón; Facebook, Instagram (@joox6287) and TikTok (@joox7731).
- **Track record:** 20 cars imported, 12 sold.
- **Rental fleet (three cars, all automatic):** Mitsubishi Outlander Sport 2015 black (2000 cc), Mitsubishi Outlander Sport 2020 orange (2000 cc), Kia Sportage 2020 black (2400 cc). The client wrote "Outlander"; the photos show the compact Outlander Sport, confirmed by the user.
- **For sale:** one black Jeep Wrangler Unlimited (automatic, 4x4); year, mileage and price not given.
- **Photos:** the client's own phone photos (1280 px, sent through a chat app) of the rental fleet at home in Guápiles, the car for sale, and its imports (lots, a tow truck, containers, papers). Front three-quarter views, no side profiles. See `ASSETS.md`.
- **Mission, vision, DNA, the name's meaning and the full import process** (above).

Still missing; use placeholders and never make anything up:

- A vector version of the logo
- Real footage for the hero film
- Rental prices, the rental cars' drive (4x2 or 4x4), rental requirements, insurance details
- The Jeep's year, mileage and price; the import time in weeks; opening hours; an exact address or map pin

We have no testimonials, tax figures or parts catalogue. Don't create any.

## Product Principles

1. **No surprises.** State costs, insurance coverage, and import fees plainly, or leave a visible placeholder. Never hide them or guess at them.
2. **The fleet is the proof.** The rental cars show what the import service delivers, so connect the two services instead of presenting them as separate businesses.
3. **Restraint signals trust.** Premium feel comes from showing less and doing it well, which is how this site stands apart from used-car lots and auction middlemen.
4. **WhatsApp is always one tap away.** Contact is never buried, on any screen size.
5. **Built for the phone on a slow network.** The first mobile viewport has to work on a Costa Rican data connection before anything else gets attention.
