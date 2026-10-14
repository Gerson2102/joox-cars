// Moves the CMS (public/admin/index.html) to the latest Sveltia CMS release, or to the
// version given: `npm run cms:update`, or `npm run cms:update -- 0.228.0`. It pins the exact
// version with its integrity hash. Sveltia is still before 1.0 and a release can change
// behaviour: read its notes, then try /admin locally before deploying.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const file = new URL("../public/admin/index.html", import.meta.url);
const version = process.argv[2] ?? (await (await fetch("https://registry.npmjs.org/@sveltia/cms/latest")).json()).version;
const src = `https://unpkg.com/@sveltia/cms@${version}/dist/sveltia-cms.js`;

const res = await fetch(src);
if (!res.ok) throw new Error(`${src}: HTTP ${res.status}`);
const integrity = `sha384-${createHash("sha384").update(Buffer.from(await res.arrayBuffer())).digest("base64")}`;

const html = readFileSync(file, "utf8");
const next = html
  .replace(/https:\/\/unpkg\.com\/@sveltia\/cms@[^/]+\/dist\/sveltia-cms\.js/, src)
  .replace(/integrity="sha384-[^"]+"/, `integrity="${integrity}"`);
if (next === html) console.log(`Already on Sveltia CMS ${version}.`);
else writeFileSync(file, next);

console.log(`Sveltia CMS ${version}\n${integrity}\nRelease notes: https://github.com/sveltia/sveltia-cms/releases/tag/v${version}`);
