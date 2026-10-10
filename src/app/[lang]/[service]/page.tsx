import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import { pageMetadata } from "../metadata";
import { ld, serviceJsonLd } from "../structured-data";
import { getCars, getFaq, getImport } from "@/lib/content";
import { serviceOf, slugs } from "@/lib/sections";
import { ContactBand, FaqBand, ImportBand, PartsBand, RentalBand, SalesBand } from "@/components/site/Bands";

export const dynamicParams = false;

/** The four services, each at its own address in each language (/es/renta, /en/rental, …). */
export function generateStaticParams({ params: { lang } }: { params: { lang: string } }) {
  return hasLocale(lang) ? slugs(lang).map((service) => ({ service })) : [];
}

const BANDS = { rental: RentalBand, sales: SalesBand, import: ImportBand, parts: PartsBand };

async function resolve(params: PageProps<"/[lang]/[service]">["params"]) {
  const { lang, service: slug } = await params;
  const service = hasLocale(lang) ? serviceOf(lang, slug) : undefined;
  if (!hasLocale(lang) || !service) notFound();
  return { lang, service, t: await getDictionary(lang) };
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[service]">): Promise<Metadata> {
  const { lang, service, t } = await resolve(params);
  return pageMetadata(t, lang, service);
}

/** A service's page: its band, opening on the page's title, then its own questions, then contact. */
export default async function ServicePage({ params }: PageProps<"/[lang]/[service]">) {
  const { lang, service, t } = await resolve(params);
  const Main = BANDS[service];
  const faq = getFaq(lang).filter((f) => f.service === service);
  const cars = service === "rental" || service === "sales" ? await getCars(service, lang) : [];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(serviceJsonLd(t, lang, service, { cars, faq, fee: getImport(lang).fee }))} />
      <main>
        <Main t={t} lang={lang} page />
        {/* Sales is a white band: the questions continue it below a hairline. */}
        {faq.length ? <FaqBand t={t} lang={lang} items={faq} continues={service === "sales"} /> : null}
        <ContactBand t={t} lang={lang} />
      </main>
    </>
  );
}
