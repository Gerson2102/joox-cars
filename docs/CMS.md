# The content panel (Sveltia CMS)

JOOX edits its own cars and business details at **jooxcars.com/admin**, without a developer. The panel is [Sveltia CMS](https://sveltiacms.app/en/docs), free and open source: there is no database and no subscription. The content lives in this repository as JSON files, and every save in the panel is a commit to `master`. Vercel sees the commit and redeploys, so a change is live about a minute after saving.

```
client at /admin ──save──▶ commit to GitHub (content/*.json, public/media/photos/*.webp)
                                   │
                                   ▼
                    Vercel builds the site again ──▶ jooxcars.com
```

## What the client can edit

| In the panel | File | Shows on the site as |
| --- | --- | --- |
| Carros de renta | `content/rental/<car>.json` | The rental showroom (yellow band) |
| Carros en venta | `content/sales/<car>.json` | The sales showroom (white band) |
| Datos del negocio › Contacto y redes | `content/contact.json` | Phone, WhatsApp number (every WhatsApp button), email, hours, Facebook / Instagram / TikTok; also the structured data |
| Datos del negocio › Importación | `content/import.json` | The approximate time and the JOOX fee under the import steps |
| Datos del negocio › Preguntas frecuentes | `content/faq.json` | The FAQ (and its structured data) |
| Datos del negocio › Reseñas | `content/reviews.json` | The reviews |

For each car the client sets the make, model, year, type, colour, engine or mileage, gearbox, drive, seats and photos. Two more fields are optional: a bold notice line ("En preparación: disponible pronto."), and a **Posición** number that sets its place in the showroom. **Mostrar en el sitio** hides a car without deleting it.

Everything else stays in code: the hero, About, the import steps, button labels and the layout (`messages/*.json`, components). Prices are not a field: as DESIGN.md says, rates change with the season and cars are asked about on WhatsApp.

**Two languages.** The panel shows Spanish and English side by side. Fields that are the same in both (make, model, year, numbers, photos) are entered once, in Spanish. Type, colour, notice, photo descriptions, hours, import time, FAQ and reviews have an English column. An English field left empty shows the Spanish text on `/en`, so the client is never blocked on a translation.

The panel's "translate" button needs an API key that the client adds in the panel's own settings, stored in their browser only. Google Cloud Translation and Gemini have free tiers, and the panel's security policy allows both. Without a key, they type the English themselves.

**Photos.** The panel shrinks every photo to 1600 px and converts it to WebP in the browser before uploading it; iPhone HEIC photos are converted too. It also strips the camera data (EXIF, including the GPS position). Uploads land in `public/media/photos/`, named after the car (`jeep-wrangler-rubicon-2018-f1402a33af58.webp`).

The panel can't blur number plates. Ask the client to cover or blur them before uploading, as `scripts/media/photos.py` did for the first photos.

**New cars and the showroom cutouts.** The side-profile cutouts on the showroom stage are made by `scripts/media/fleet.py` and listed in `CUTOUTS` in `src/lib/fleet.ts`, keyed by the car's file name. A car added in the panel has no cutout, so its first photo stands on the studio floor in a 4:3 frame instead (`CarCarousel`, `.print`). To give it a cutout later: make one with `fleet.py`, then add it to `CUTOUTS` under its showroom and file name (`content/sales/jeep-wrangler-rubicon-2018.json` → `sales["jeep-wrangler-rubicon-2018"]`).

## One-time setup (before the client's first sign-in)

1. **GitHub OAuth app.** On GitHub: Settings → Developer settings → OAuth Apps → New OAuth App.
   - Application name: `JOOX CARS panel`
   - Homepage URL: `https://jooxcars.com`
   - Authorization callback URL: `https://jooxcars.com/api/callback`

   Create it, then generate a client secret.
2. **Vercel environment variables** (Project → Settings → Environment Variables, Production), then redeploy:
   - `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`: from the OAuth app.
   - `CMS_ADMIN_KEY`: run `node scripts/generate-key.mjs` and paste the result.
3. **The client's GitHub account.** The client needs a free GitHub account. Invite it to `Gerson2102/joox-cars` with **Write** access (repo → Settings → Collaborators). Only collaborators with write access can sign in, so this is the real lock on the panel.
4. **The secret link.** Send the client `https://jooxcars.com/admin?key=<CMS_ADMIN_KEY>` once. It sets a signed cookie for 30 days, and after that `jooxcars.com/admin` opens directly in that browser. Without it, `/admin` is a plain 404 to everyone (`src/proxy.ts`), so bots never find the sign-in page. To cut off every link and cookie at once, change `CMS_ADMIN_KEY` in Vercel and redeploy.

The panel signs in only on `jooxcars.com` (the `base_url` in `public/admin/config.yml` must be the domain the admin is opened on; `www.jooxcars.com` redirects there).

## Editing locally (for you)

No accounts or keys needed:

```bash
npm run dev
# open http://localhost:3000/admin/index.html in Chrome or Edge
# → "Trabajar con un repositorio local" / "Work with Local Repository" → select this project's folder
```

The panel then reads and writes the files on your disk. Reload the site to see a change, and commit it with git as usual. Firefox and Safari can't do this (no File System Access API). Sveltia has no `decap-server`.

## How it's wired

- `public/admin/index.html`: loads Sveltia from UNPKG, pinned to one version with its integrity hash (SRI), so the browser refuses any other file.
- `public/admin/config.yml`: the collections and fields (labels in Spanish), the two languages (`i18n: single_file`: each file is `{ "es": {...}, "en": {...} }`), and the photo settings.
- `src/lib/content.ts`: reads `content/` at build time, picks each language with the Spanish fallback, and reads each photo's size with `sharp`. In `next dev`, a saved change shows on reload.
- `src/app/api/auth` + `src/app/api/callback`: the GitHub sign-in (OAuth with a state cookie against CSRF). The token is only ever handed to the site's own origin; it is never broadcast to `*`. The scope is `public_repo`, because the repo is public.
- `src/proxy.ts`: the language redirect for `/`, and the secret-link gate for `/admin`.
- `next.config.ts`: `/admin` serves `public/admin/index.html` under its own Content-Security-Policy (UNPKG, jsDelivr fonts, the GitHub API, the two translation services). The rest of the site keeps its strict policy.

## Updating Sveltia

```bash
npm run cms:update            # latest release
npm run cms:update -- 0.228.0 # or a given one
```

This rewrites the version and integrity hash in `public/admin/index.html`. Sveltia is still before 1.0 (1.0 is planned for late 2026), and a release can change behaviour. Read the release notes the script prints, try `/admin` locally, then deploy.

## When something goes wrong

- **`/admin` is a 404:** the browser has no access cookie yet, or `CMS_ADMIN_KEY` changed. Open the secret link again.
- **The sign-in popup closes or hangs:** check that `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set in Vercel. The OAuth app's callback URL must be exactly `https://jooxcars.com/api/callback`, and the admin must be opened on `jooxcars.com`.
- **"You don't have access to this repository":** the client's GitHub account isn't a collaborator with Write access, or hasn't accepted the invitation.
- **A change isn't on the site yet:** check the deployment in Vercel; each save is one build.
- **A bad edit:** every save is a commit, so revert it on GitHub (or `git revert`).
