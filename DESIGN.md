---
name: "JOOX CARS"
description: "Yellow & black bands: the JOOX logo's three grounds as full-width bands, one service each, with the client's own cars in a showroom and its own photos as the proof."
colors:
  yellow: "#fdcd03"
  ink: "#131313"
  paper: "#ffffff"
  ink-2: "#545454"
  rule: "#e2e2e2"
  rule-strong: "#b4b4b4"
  ink-soft: "rgb(19 19 19 / 0.74)"
  ink-soft-on-yellow: "rgb(19 19 19 / 0.8)"
  white-soft: "rgb(255 255 255 / 0.74)"
  white-label: "rgb(255 255 255 / 0.62)"
  line-on-white: "rgb(19 19 19 / 0.14)"
  line-on-yellow: "rgb(19 19 19 / 0.22)"
  line-on-black: "rgb(255 255 255 / 0.16)"
  error: "#b3261e"
  error-on-black: "#ffb4a9"
typography:
  hero-display:
    fontFamily: "Archivo, Segoe UI, sans-serif"
    fontSize: "clamp(2rem, 3.9vw, 4rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 125"
  band-title:
    fontFamily: "Archivo, Segoe UI, sans-serif"
    fontSize: "clamp(2.25rem, 1.3rem + 3.4vw, 4.25rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 125"
  model-name:
    fontFamily: "Archivo, Segoe UI, sans-serif"
    fontSize: "clamp(1.875rem, 1.1rem + 2.4vw, 3rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 125"
  ghost-name:
    fontFamily: "Archivo, Segoe UI, sans-serif"
    fontSize: "clamp(4rem, 13vw, 13rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontVariation: "'wdth' 125"
  display-3:
    fontFamily: "Archivo, Segoe UI, sans-serif"
    fontSize: "clamp(1.25rem, 1.05rem + 0.8vw, 1.625rem)"
    fontWeight: 800
    lineHeight: 1.08
    fontVariation: "'wdth' 125"
  lead:
    fontFamily: "Archivo, Segoe UI, sans-serif"
    fontSize: "clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Archivo, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  small:
    fontFamily: "Archivo, Segoe UI, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.55
  button:
    fontFamily: "Archivo, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.3
  nav-link:
    fontFamily: "Archivo, Segoe UI, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.35
  label:
    fontFamily: "Archivo, Segoe UI, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.08em"
    fontVariation: "'wdth' 75"
  spec-value:
    fontFamily: "Archivo, Segoe UI, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 700
    fontVariation: "'wdth' 125"
rounded:
  pill: "999px"
  round: "50%"
  step: "12px"
  field: "14px"
  panel: "20px"
spacing:
  gutter: "clamp(16px, 4.2vw, 64px)"
  nav-h: "68px"
  measure: "58ch"
  band-pad: "clamp(80px, 11vw, 160px)"
  band-pad-phone: "72px 0 80px"
  showroom-top: "clamp(64px, 7vw, 104px)"
  band-gap: "clamp(36px, 4.5vw, 64px)"
  content-max: "1240px"
  car-w: "min(860px, 58vw)"
  car-w-phone: "86vw"
components:
  button-yellow:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "6px 6px 6px 26px"
    height: "56px"
  button-yellow-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.yellow}"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "6px 6px 6px 26px"
    height: "56px"
  button-ink-hover:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.ink}"
  button-white:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
  button-white-hover:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.ink}"
  button-ghost-dark:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
  button-ghost-dark-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  button-ghost-light:
    backgroundColor: "rgb(19 19 19 / 0.18)"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
  button-ghost-light-hover:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
  button-sm:
    typography: "{typography.nav-link}"
    padding: "5px 5px 5px 18px"
    height: "44px"
  button-lg:
    padding: "7px 7px 7px 30px"
    height: "64px"
  header-capsule:
    backgroundColor: "rgb(255 255 255 / 0.9)"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 10px 0 22px"
    height: "68px"
  nav-pill:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    rounded: "{rounded.pill}"
    height: "38px"
  menu-sheet:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  carousel-arrow:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.yellow}"
    rounded: "{rounded.round}"
    size: "56px"
  carousel-arrow-hover:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
  service-go:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.yellow}"
    rounded: "{rounded.round}"
    size: "40px"
  step-number:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.step}"
    size: "46px"
  step-number-lit:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.yellow}"
  text-field-dark:
    backgroundColor: "rgb(255 255 255 / 0.06)"
    textColor: "{colors.paper}"
    rounded: "{rounded.field}"
    padding: "0 18px"
    height: "58px"
  faq-panel:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.panel}"
    padding: "clamp(24px, 2.6vw, 36px)"
---

# Design System: JOOX CARS

## Overview

**Creative North Star: "The Brand in Bands"**

Below the hero film, the homepage is the JOOX logo laid out flat: full-width bands of paper white, JOOX yellow and ink, each carrying one service, in a fixed rhythm (white, yellow, white, black, yellow, black, white, white, black, then a white footer). A band is the unit of the page; it sets its own ink, secondary ink and hairline, and everything inside reads them, so the same component is right on any ground. Rental leads, and the cars stand in a showroom on yellow, one at a time, like a manufacturer's configurator: each car in true side profile on a dotted studio floor, the model's name huge and outlined behind it, the neighbours waiting at the page edges, smaller and softly out of focus. The client's own photos are the proof beside the polish: every car's real photos a tap away, the whole fleet together at home in Guápiles, and a strip of the client's imports.

Air, not noise: every band has one job and generous padding, the yellow is spent in whole grounds rather than sprinkled, and the logo's own devices (the ◂ ▸ triangles that flank CARS and the OO infinity loop) are the only ornaments. Motion carries the premium feel: the cars drive the way their carousel travels, coloured bands open from the centre like the curtain in the hero film, the import road runs through its steps in a loop, the import photos travel sideways as you scroll, and the one button floods from its icon capsule.

Archivo carries the whole page on its width axis: expanded ExtraBold for display, normal width for reading, semi-condensed tracked caps for short labels. The system refuses the dealership grid of price-stickered thumbnails, a yellow-everything page, cards-with-icons, and gradients outside the hero film's scrims.

**Key Characteristics:**
- Three grounds only, as whole bands; never two yellows or two blacks in a row.
- Ink on white and yellow, white on black; secondary text is the same ink or white at reduced alpha.
- The showroom carousel is the focal moment: one car in side profile, sharp, its neighbours blurred at the page edges; the client's real photos one tap away.
- One button everywhere: a pill whose icon capsule floods the button on hover while the label rolls.
- Logo devices, drawn in CSS and SVG: ◂ ▸ triangles and the OO loop.
- Depth twice only: the floating header capsule and each car's own ground shadow.
- Bilingual ES/EN from the same components; placeholders stay bracketed.

## Colors

The logo's three colours as grounds, with ink and white at reduced alpha for everything secondary.

### Primary
- **JOOX Yellow** (`yellow`): a whole band ground (rental, sales); the primary action on white, black and the film (Rent a car, the parts request, the FAQ and contact WhatsApp buttons); and the brand marks and states that belong to it: the title triangle on white and black bands, the About loop and the word ETERNAL, the contact pin, lit import numerals, the header's scroll-spy pill, an open FAQ ring, the service tile's hover flood, the carousel arrows' triangles, and the focus ring on black.

### Neutral
- **Ink** (`ink`): the third ground (parts, about, contact, the FAQ panel, the phone menu sheet), all text on white and yellow, the primary action on a yellow band, carousel arrow discs, service discs, lit import steps, the 3px top rules over services, reviews and the FAQ list, and the focus ring on white and yellow.
- **Paper** (`paper`): the white bands and footer, the header capsule (at 0.9), text on black.
- **Soft Ink** (`ink-soft`, `ink-soft-on-yellow`): leads, notes, secondary lines, spec labels and short labels. 0.74 on white, 0.8 on yellow.
- **Soft White** (`white-soft`, `white-label`): leads and body on black at 0.74; short labels on black at 0.62.
- **Band Lines** (`line-on-white`, `line-on-yellow`, `line-on-black`): hairlines, dashed placeholder frames and the import road's unfilled track, one strength per ground.
- **Neutral Grey** (`ink-2`): secondary text on white only: the default short-label colour and the footer notes.
- **Rule Grey** (`rule`) and **Scroll Grey** (`rule-strong`): text selection and the scrollbar thumb, nothing else.

### Scoped exceptions
- **Error** (`error` on white, `error-on-black` on black): the parts form's invalid field border and its message.
- The hero film's scrims are a green-black (`rgb(12 16 14)`) inside the film stage, and only where type sits: under the header and the canopy behind the copy. They are the film's shade, not a palette colour; the rest of the film is left as shot, with no controls or captions over it.

### Named Rules
**The Three Grounds Rule.** White, yellow and ink are grounds used as whole bands in the fixed rhythm; there are never two yellows or two blacks in a row. White may follow white once (reviews, then questions), parted by a hairline.

**The No Grey on Yellow Rule.** Secondary text is the band's own ink or white at reduced alpha. Grey (`ink-2`) appears only on white; on a yellow band short labels are overridden to ink at 0.8.

**The Action Follows the Ground Rule.** On white, black or the film the primary action is yellow; on a yellow band it is ink. A secondary action is ink on white (the import quote), an ink outline on light grounds, a white outline on dark ones.

## Typography

**Display Font:** Archivo at 125% width, weight 800 (via `next/font`, `wdth` axis), fallback Segoe UI
**Body Font:** Archivo at normal width
**Label Font:** Archivo at 75% width

**Character:** One family on three widths, like the logo's wide JOOX: expanded and heavy for statements and names, plain for reading, compact tracked caps for the few short labels.

### Hierarchy
- **Hero display** (800, 125%, `hero-display`, 0.98, -0.02em, balanced): the H1 over the film, three lines in both languages. Short desktops and phones step it down inside the hero stage.
- **Band title** (800, 125%, `band-title`, 0.98, -0.02em, max 15em): each band's H2, led by the logo's triangle in the band's accent (yellow on white and black, ink on yellow). The About title runs larger (`clamp(2.5rem, 1.2rem + 4.6vw, 5.5rem)`, max 9em) and sets ETERNAL in yellow, as in the lockup.
- **Ghost name** (800, 125%, uppercase, `ghost-name`): the model's name behind the car on show, transparent with a 1.5px ink stroke at 0.26.
- **Model name** (800, 125%, `model-name`): the car on show; the make before it at 100% width, weight 500.
- **Display 3** (800, 125%, `display-3`): service names, the FAQ panel title, the import time value, the sales "not seeing it" title.
- **Lead** (400, `lead`, max 58ch, pretty wrapping): each band's lead, FAQ answers, the price line.
- **Body** (400, 1rem, 1.55): default text. Review quotes are 1.25rem at 500; FAQ questions 600 at `clamp(1.0625rem, 1rem + 0.35vw, 1.3125rem)`.
- **Small** (0.875rem): step bodies, field labels (600), spec labels, notes (italic).
- **Spec value** (700, 125%, tabular): the value under each spec label (1rem on phones).
- **Label** (600, 75%, 0.75rem, 0.08em, uppercase): short labels only: the import time key, contact keys, review names, the map key, the model-photo tag, photo captions under the fleet photo and the import strip, hero film captions, the menu sheet's place line.

### Named Rules
**The Three Widths Rule.** 125% for display and values that should read as the brand's voice, 100% for reading and pressing, 75% only for short tracked labels.

**The Short Labels Rule.** Tracked caps are for a few words that key a value or tag an object. They never sit above a heading as a kicker; the band title's only lead-in is the logo triangle.

## Layout

**Bands.** Every section is a full-width band: `band-pad` top and bottom (72px and 80px on phones) inside the fluid `gutter`, content in a grid of max `content-max` with `band-gap` between the head and the body. Band heads stack title and lead (max 920px); the showroom bands set title and lead side by side (lead aligned right, stacking at ≤1100px) and start sooner (`showroom-top`) so the stage arrives early.

**Band compositions.** Services: four tiles in a row under a 3px ink rule (2×2 at ≤1100px, a list at ≤700px). Import: six steps on a horizontal road (3 columns and no road at ≤1100px; a vertical road at ≤700px). Parts: title and lead left, the request right (5/7). About: the family's story and the loop (7/5), the loop sticky beside the story. Reviews: three columns under 3px rules. Questions: the list and a sticky black panel beside it (8/4). Contact: WhatsApp and the keys, beside the map card (7/5). Two-column bands stack at ≤1100px.

**The showroom stage.** It bleeds to the viewport edges. Every car is a side-profile cutout on the same canvas, shown `car-w` wide. A step is `50vw + car-w × 0.14`, so a neighbour sits most of the way off the page: only its nearer end shows, at 0.86 scale and out of focus; cars further off fade out. The ◂ ▸ arrows sit in the gaps either side of the car on show, at the height of its body. The stage is the tallest car (`car-w × 0.42`) plus a 40px floor and room for the ghost name. A car on its own stands with no arrows, dots or count. On phones the car is `car-w-phone`, a step is `50vw + car-w × 0.3` (the neighbours are slivers at 0.8 scale), the arrows sit together under the car, and specs run three across.

**Photo bleed.** The import strip starts at the content edge and runs off the right of the page, like the showroom stage; the fleet photo stays inside the content width (21:9, 4:3 on phones) because the client's photos are 1280 px.

**Folding (≤700px, with JS).** Import and parts show title and lead first; a toggle unfolds the rest. Without JS everything shows.

**Breakpoints:** 420px (language switch hidden), 700px (phone band padding, folds, vertical road, phone showroom), 719px (hero film band over ink), 960px (header links collapse to the menu), 1100px (two-column bands stack, services 2×2).

## Elevation & Depth

Flat bands. Depth appears twice, each for a reason: the header capsule floats over content passing beneath it, and each car stands on its own ground shadow. Everything else separates by ground change, 3px ink rules and band hairlines.

### Shadow Vocabulary
- **Header capsule** (`box-shadow: 0 18px 40px -22px rgb(19 19 19 / 0.45)`, with `backdrop-filter: saturate(1.4) blur(14px)`): only on the floating capsule past the film; over the film the bar is transparent and shadowless.
- **Car ground shadow** (baked into each cutout WebP by `scripts/media/fleet.py`, a soft pool drawn from the car's own silhouette plus a contact line): never a CSS shadow on a car or its stage.

### Named Rules
**The Two Depths Rule.** No other surface casts a shadow. The dark field's focus glow (`0 0 0 3px` yellow at 0.28) and the import numbers' 2px inset ring are rings, not elevation.

## Shapes

Pills and discs for everything pressable or moving: buttons, nav links, the scroll-spy pill, the header capsule, the language switch, the menu and close buttons, the fold toggle (`pill`); carousel arrows, service discs, FAQ rings (`round`). Softened squares for the few objects that hold something: import numbers and viewer thumbnails (`step`), dark form fields and the import photos (`field`), the FAQ panel, the map card and the fleet photo (`panel`). Bands themselves are square; only while a coloured band's curtain is opening do its corners round (56px), flattening to 0 as it opens. The logo's triangle is drawn with `clip-path: polygon(0 0, 100% 50%, 0 100%)` and mirrored for ◂; the contact pin is the same triangle pointing down. Rules are 3px ink for the top of a list, 1.5px for spec and sales dividers, 1px for band hairlines; placeholders are 1.5px dashed band lines.

## Components

### Buttons
One button across the site, confident and tactile.
- **Shape:** a pill (`pill`) with a 44px icon capsule at its end (a 20px arrow or WhatsApp glyph), 56px tall; `sm` is 44px with a 34px capsule (the header WhatsApp), `lg` 64px with a 50px capsule (contact).
- **Variants, one per ground:** yellow (yellow pill, ink capsule) on white, black and the film; ink (ink pill, yellow capsule) on white and yellow; white (in the header over the film); ghostLight (white 0.62 outline on a light ink wash) on dark grounds.
- **Flood follows the ground:** the capsule's colour is the hover colour, so it always stands out from the band. On white: the yellow button floods ink and the ink button floods yellow. On yellow: the ink button carries a white capsule and floods white. On black and the FAQ panel: the yellow button carries a white capsule and floods white. On the film the yellow button keeps its ink capsule. Grounds set `--ink-flood` / `--yellow-flood`.
- **Hover:** the capsule's colour floods the whole button as a growing circle clipped from the capsule (0.6s), the label rolls up to a copy of itself in the capsule's ink (0.55s), the icon nudges 3px forward. Press scales to 0.97 in 0.08s. Focus is a 2px ring at 3px offset in ink, or white on dark variants.
- **Reduced motion:** the flood and roll are instant; the label and icon stay put.

### Navigation
- **Over the film:** a transparent full-width bar: reversed logo, white links, white language switch, the white WhatsApp button and a white-outlined menu button.
- **Past the film:** a floating white capsule (`header-capsule`), inset by the gutter and 10px from the top, with the Header capsule shadow and blur. Links are 0.9375rem at 600; a yellow pill slides under the link of the section being read; labels roll to a copy of themselves on hover. The WhatsApp button turns ink.
- **≤960px:** links collapse into a 44px round menu button. The menu is a full-screen black sheet that opens downward (clip, 0.45s): the brand line in 125% display with ETERNAL in yellow, then the links in display width, each marked by a yellow triangle and parted by white hairlines, sliding in 50ms apart. Focus is yellow on the sheet.

### The Showroom (signature)
The focal moment, on yellow only, after the reference the client chose (a configurator's "pick your car" row). A dotted studio floor (1.2px ink dots at 0.16 on a 22px grid) bleeds to the viewport edges; the car on show stands in side profile at full size and in focus, the ghost name behind it. Its neighbours wait at the page edges at 0.86 scale, blurred 7px (4px on phones), a little desaturated and lighter, so one car holds the eye while the others say there are more; hovering a neighbour pulls its focus in a little, and a click brings it forward. Every car holds a step offset from centre, and moving the index shifts them all at once, so the cars drive through the stage the way they face (1.1s, `cubic-bezier(0.65, 0, 0.2, 1)`), their scale and focus changing on the same curve: the next car sharpens as it arrives. The rental cars face and travel left; the car for sale faces right. The first time the stage is 35% in view the cars drive in from the edge they come from (1.25s). ◂ ▸ ink discs (`carousel-arrow`) sit in the gaps beside the car; hover turns them white with the triangle nudging 4px outward. Arrows, keys, swipe and a click on a neighbour all move it. The ghost name is the model's first word. Below: make and model with body and year, and an ink-outline "See photos (n)" button (photos icon) that opens the client's own photos of that car in the Photo viewer; then the bracketed price and the ink reserve button, whose WhatsApp message names the exact car ("…the orange 2020 Mitsubishi Outlander Sport"); a spec row (label over value, 1.5px rule above each); a credit line; progress bars (the car on show long and ink, others short at 0.28) and a large `01 of 03` count. The info block fades up in 0.08s steps on each change.

The cars on the stage are model photos: Commons photos of the same model and generation, recoloured to the client's paint where needed, because the client's own photos are three-quarter views. A "Model photo" pill tag sits top-left of the stage, and the credit line says so, names the photographer and licence (and "colour adjusted" where recoloured), and points to "See photos". Reduced motion: cars, focus and the ghost name change by a 0.3s cross-fade, no drive, no drive-in, no info rise.

### Photo viewer
The client's real photos, full screen on ink, as a native modal dialog (focus held inside, Escape closes, the page behind inert and still). A bar with the car's name in display-3, the count, and a 48px outlined close disc that fills yellow on hover. The photo sits contained in the middle with its caption under it; yellow discs with ink triangles either side (on ink the action is yellow), 44px over the photo's edges on phones; swipe and the arrow keys move too. Thumbnails run along the bottom, the current one ringed in yellow. It opens with a 0.35s fade and each photo settles in from 0.985 scale; reduced motion drops both.

### The fleet together
The rental band closes on the client's photo of the three rental cars on the grass in Guápiles: inside the content width, `panel` corners, 21:9 (4:3 on phones), with a label caption under it. No overlay, no type on the photo.

### Import strip
Under the import journey: a display-3 line that carries the track record in words ("20 cars imported so far."), a soft line under it, and the client's import photos at one height, each as wide as its own proportions, `field` corners, a label caption under each. Scrolling carries it: the band holds the strip in view (a sticky frame on a runway one viewport plus the strip's travel tall) while the page's scroll moves it sideways, eased toward the scroll position each frame (10% of the remaining distance) so it glides rather than ticks. Each photo drifts slightly against the travel inside its frame (±7% at 1.16 scale), a large `01 of 10` count sits at the head's right, and a 2px line under the strip fills in ink as it goes. Focusing a photo by keyboard scrolls the page to where it sits; a click opens it in the Photo viewer. Without the script, and under reduced motion, it is a plain strip that swipes and scroll-snaps, paged by ink ◂ ▸ discs (hidden on phones), hover easing a photo up to 1.035.

### Services
Four tiles under a 3px ink rule, parted by band hairlines: a display-3 name, one line, and an ink disc with a yellow ▸ in the bottom corner. Hover floods the tile yellow from the ground up (0.55s) and slides the disc 8px right; reduced motion drops the flood's transition.

### Import journey
Six numbered steps on a road: a 2px band-line track with a ▸ at its end. While the journey is on screen it runs on its own, in a loop: the road fills in ink from step to step (1s on the drive curve, a step every 1.1s), each number (`step-number`) lights from a paper square with an ink ring to ink with a yellow numeral as the fill reaches it, and the step just reached wears a yellow ring and grows to 1.06. The finished road holds for 2.4s, empties, and runs again; it pauses off screen and starts again from the first step when it returns. On phones the road runs vertically beside the numbers. Beneath: the import strip, then the approximate time (a label over a display-3 value) and the ink WhatsApp quote button. Before the script runs and under reduced motion the road is full and every number lit.

### Inputs / Fields
- **Style (black band):** dark wells (`text-field-dark`), 1.5px white 0.18 border, `field` corners, white text, yellow caret, placeholder white 0.56; labels above at 0.875rem, 600, soft white.
- **Hover / Focus:** border lifts to white 0.36; focus turns it yellow with a 3px yellow 0.28 glow and a slightly lighter well.
- **Error:** border and message in `error-on-black`. The request is written into a WhatsApp message; the submit is the yellow button.

### Questions
A list under a 3px ink rule, 1px hairlines between. Each question is a 72px trigger at 600 with a 44px ring holding a plus; hover fills the ring yellow, open turns it to a yellow cross (rotated 45°) and the answer grows open (0.5s) with its text fading down in. Beside it, the sticky black `faq-panel` with a display-3 title, soft-white body and the yellow WhatsApp button.

### About loop
The logo's OO as one yellow figure-eight (16px stroke, round caps), drawn once in 1.6s when 40% in view; then a white dot travels it every 9s without end. Reduced motion: drawn and still, no dot.

### Placeholders
Content the client has not supplied yet stays visible: bracketed prices, the Jeep's year and mileage, the import time and the hours, and an italic soft note where a whole piece is missing (the parts catalogue). Track-record numbers are written into sentences ("12 sold so far"), never set as big-number stat tiles.

### Motion
One ease, `cubic-bezier(0.16, 1, 0.3, 1)`, for state changes and reveals; one drive curve for the cars. Coloured bands open as a curtain (clip from 18% inset each side with 56px corners to full, over the band's first 55vh of scroll, scroll-driven). Band titles unmask upward (clip plus 0.45em rise, 1.1s); leads and blocks rise 28px; services and reviews stagger 90ms apart. Reveals only hide content while `html[data-fx="on"]`, which the script sets, so a failed script hides nothing; under reduced motion everything is revealed at once, the curtain is finished, the import road is full and still, the import strip is a plain swipeable row, and smooth scrolling is off. The import journey is the one loop on the page: it runs only while in view.

## Do's and Don'ts

### Do:
- **Do** build every section as a full-width band on one ground, keeping the rhythm with no two yellows or two blacks in a row.
- **Do** read the band's own ink, secondary ink and hairline inside a band, so a component works on any ground.
- **Do** make the action yellow on white, black and the film, and ink on a yellow band.
- **Do** lead band titles with the logo triangle in the band's accent, and use ◂ ▸ for direction and controls.
- **Do** use the one button (pill, icon capsule, flood, label roll) for every action, choosing the variant by ground.
- **Do** show cars in side profile on the dotted floor, one in focus and its neighbours blurred at the page edges, with the client's own photos a tap away; label and credit every model photo, and say when its colour was adjusted.
- **Do** soften plates and blur bystanders in the client's photos, and ship them without metadata.
- **Do** keep depth to the header capsule and the cars' baked ground shadows.
- **Do** give every motion a finished state for reduced motion and for browsers without scroll timelines.

### Don't:
- **Don't** set grey text on yellow; secondary text on yellow is ink at 0.8.
- **Don't** put two yellow or two black bands next to each other, or tint a band with any fourth colour.
- **Don't** use gradients outside the hero film's scrims, or shadows beyond the two depths.
- **Don't** build cards-with-icons or a price-stickered thumbnail grid; cars stand one at a time in the showroom.
- **Don't** put a tracked label above a heading as a kicker.
- **Don't** invent numbers, prices, reviews or counts; leave the bracketed placeholder.
- **Don't** set type over the client's photos or crop them past what they hold; they are 1280 px phone photos and the proof, not decoration.
