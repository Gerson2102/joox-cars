import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import en from "../messages/en.json";
import es from "../messages/es.json";

// What the client edits in the CMS, read the way the site reads it (Spanish is the default locale).
const read = (file: string) => JSON.parse(readFileSync(join(process.cwd(), "content", file), "utf8"));
const content = (file: string) => read(file).es;
type CarFile = { brand: string; model: string; year: string; engine?: string; visible?: boolean; order?: number };
const cars = (kind: "rental" | "sales"): CarFile[] =>
  readdirSync(join(process.cwd(), "content", kind))
    .filter((f) => f.endsWith(".json"))
    .map((f) => content(`${kind}/${f}`) as CarFile)
    .filter((c) => c.visible !== false)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
const rental = cars("rental");
const sales = cars("sales");
const businessNumber: string = content("contact.json").whatsapp;
/** The questions the way the site reads them: an English text left empty falls back to the Spanish one. */
const faq = (lang: "es" | "en") => {
  const data = read("faq.json") as Record<"es" | "en", { items: { q: string; service?: string }[] }>;
  return data.es.items.map((f, n) => ({ ...f, q: (lang === "en" && data.en.items[n]?.q) || f.q }));
};

/** Each service's page, in each language: these addresses are public, so they are spelled out here. */
const PAGES = {
  rental: { es: "/es/renta", en: "/en/rental" },
  sales: { es: "/es/venta", en: "/en/sales" },
  import: { es: "/es/importacion", en: "/en/import" },
  parts: { es: "/es/repuestos", en: "/en/parts" },
} as const;
type Service = keyof typeof PAGES;

/** The page's JSON-LD nodes, one of them by type, and its HTML with the entities React escapes turned back. */
const nodes = (html: string) => [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].flatMap((m) => JSON.parse(m[1])["@graph"]);
const ofType = (html: string, type: string) => nodes(html).find((n) => [n["@type"]].flat().includes(type));
const unescape = (html: string) => html.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

test("/ sends English browsers to /en and everyone else to /es", async ({ browser }) => {
  for (const [locale, path] of [["en-US", "/en"], ["es-CR", "/es"], ["fr-FR", "/es"]]) {
    const context = await browser.newContext({ locale });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page).toHaveURL(path);
    await context.close();
  }
});

for (const [lang, t] of [["es", es], ["en", en]] as const) {
  test(`/${lang} renders the homepage`, async ({ page }) => {
    await page.goto(`/${lang}`);
    await expect(page).toHaveTitle(t.meta.title);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(t.hero.title);
  });

  test(`every service has its own page in ${lang}, with its questions for crawlers`, async ({ request }) => {
    const other = lang === "es" ? "en" : "es";
    for (const [service, paths] of Object.entries(PAGES) as [Service, (typeof PAGES)[Service]][]) {
      const response = await request.get(paths[lang]);
      expect(response.status()).toBe(200);
      const html = unescape(await response.text());
      expect(html).toContain(`<title>${t.pages[service].title}</title>`);
      expect(html).toMatch(new RegExp(`<h1[^>]*>${t.pages[service].h1.replace(/\./g, "\\.")}</h1>`));
      expect(html).toContain(`hrefLang="${other}" href="https://jooxcars.com${paths[other]}"`);

      const questions = faq(lang).filter((f) => f.service === service).map((f) => f.q);
      for (const q of questions) expect(html).toContain(q);
      expect(ofType(html, "Service").name).toBe(t.pages[service].h1);
      expect(ofType(html, "FAQPage").mainEntity.map((q: { name: string }) => q.name)).toEqual(questions);
    }
  });
}

test("crawlers that don't run JavaScript get every car and the business data", async ({ request }) => {
  const html = await (await request.get("/es")).text();
  const headings = [...html.matchAll(/<h3[^>]*>(.*?)<\/h3>/g)].map((m) => m[1].replace(/<[^>]+>/g, ""));
  for (const car of [...rental, ...sales]) expect(headings).toContain(`${car.brand} ${car.model} ${car.year}`);
  for (const car of rental) if (car.engine) expect(html).toContain(car.engine);

  const business = ofType(html, "AutoRental");
  expect(business.name).toBe("JOOX CARS");
  expect(business.openingHoursSpecification.dayOfWeek).toHaveLength(6); // Monday to Saturday
  expect(business.telephone).toBe(`+${businessNumber}`);
  expect(business.makesOffer).toHaveLength(Object.keys(PAGES).length);
  expect(ofType(html, "WebSite").name).toBe("JOOX CARS");
  expect(JSON.stringify(nodes(html))).not.toMatch(/\[\p{L}/u); // no "[AÑO]"-style placeholders
});

test("the import page has the whole process, the rental page every car", async ({ request }) => {
  const imports = await (await request.get(PAGES.import.es)).text();
  for (const step of es.import.process.stages.flatMap((s) => s.steps)) expect(imports).toContain(step.title);
  const rentals = await (await request.get(PAGES.rental.es)).text();
  expect(ofType(rentals, "Service").hasOfferCatalog.itemListElement).toHaveLength(rental.length);
  expect(ofType(imports, "Service").offers.price).toBe(Number(content("import.json").fee.replace(/[^\d.]/g, "")));
});

test("the sitemap lists every page in both languages", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].replace("https://jooxcars.com", ""));
  expect(urls.sort()).toEqual(["/es", "/en", ...Object.values(PAGES).flatMap((p) => [p.es, p.en])].sort());
});

test("an unknown URL shows the 404 page, with the way home", async ({ page }) => {
  const response = await page.goto("/es/nada");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(es.notFound.title);
  await page.getByRole("link", { name: en.notFound.home }).click();
  await expect(page).toHaveURL("/en");
});

test("the parts form writes the request into a WhatsApp message", async ({ page, context }) => {
  await context.route("https://wa.me/**", (route) => route.fulfill({ body: "" }));
  await page.goto("/es");
  const form = es.parts.form;
  await page.getByLabel(form.make).fill("Toyota");
  await page.getByLabel(form.part).fill("Alternador");
  const [whatsapp] = await Promise.all([context.waitForEvent("page"), page.getByRole("button", { name: form.send }).click()]);
  const url = new URL(whatsapp.url());
  expect(url.origin + url.pathname).toBe(`https://wa.me/${businessNumber}`);
  expect(url.searchParams.get("text")).toBe(`${form.message}\n${form.make}: Toyota\n${form.part}: Alternador`);
});

test("the rental showroom moves to the next car and opens its photos", async ({ page }) => {
  await page.goto("/es");
  const showroom = page.getByRole("region", { name: es.rental.list });
  const model = showroom.getByRole("heading", { level: 3 });
  await expect(model).toContainText(rental[0].model);
  await showroom.getByRole("button", { name: es.carousel.next }).click();
  await expect(model).toContainText(rental[1].model);

  await showroom.getByRole("button", { name: es.carousel.photos }).click();
  const viewer = page.getByRole("dialog");
  await expect(viewer).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(viewer).toBeHidden();
});

test("switching language keeps the section being read", async ({ page }) => {
  await page.goto("/es");
  await expect(page.locator("html")).toHaveAttribute("data-fx", "on"); // hydrated
  await page.locator("#faq").evaluate((el) => el.scrollIntoView({ behavior: "instant" }));
  await page.locator("header").getByRole("link", { name: es.nav.languageLabel }).click();
  await expect(page).toHaveURL("/en#faq");
  await expect(page.getByRole("heading", { level: 2, name: en.faq.title })).toBeInViewport();
});

test("a service page switches to the same page in the other language", async ({ page }) => {
  await page.goto(PAGES.import.es);
  await page.locator("header").getByRole("link", { name: es.nav.languageLabel }).click();
  await expect(page).toHaveURL(new RegExp(`${PAGES.import.en}(#.*)?$`));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(en.pages.import.h1);
});

test("/admin serves the content panel under its own CSP", async ({ request }) => {
  const admin = await request.get("/admin");
  expect(admin.status()).toBe(200);
  expect(await admin.text()).toContain("@sveltia/cms@");
  expect(admin.headers()["content-security-policy"]).toContain("https://api.github.com");
  // The site itself keeps its strict policy.
  const site = await request.get("/es");
  expect(site.headers()["content-security-policy"]).not.toContain("api.github.com");
});

test("the CMS sign-in callback refuses a request whose state doesn't match", async ({ request }) => {
  const res = await request.get("/api/callback?code=x&state=forged", { headers: { cookie: "cms_oauth_state=real" } });
  expect(res.status()).toBe(400);
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("the menu opens and its links go to their section", async ({ page }) => {
    await page.goto("/es");
    await page.getByRole("button", { name: es.nav.menuOpen }).click();
    const menu = page.getByRole("dialog", { name: es.nav.menu });
    await menu.getByRole("link", { name: es.nav.links.contact }).click();
    await expect(menu).toBeHidden();
    await expect(page).toHaveURL("/es#contact");
  });
});
