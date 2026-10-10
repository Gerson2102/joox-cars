import Image from "next/image";
import type { ReactNode } from "react";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";
import { MAP_URL, mapEmbed } from "@/lib/contact";
import { getCars, getContact, getImport, type Car, type Kind } from "@/lib/content";
import { CUTOUTS, FLEET_TOGETHER, IMPORTS, PHOTOS, type PhotoId } from "@/lib/fleet";
import { pagePath } from "@/lib/sections";
import { wa } from "@/lib/whatsapp";
import { ExternalIcon } from "@/components/icons";
import { Btn } from "./Btn";
import { CarCarousel, type CarSlide } from "./CarCarousel";
import { Faq } from "./Faq";
import { Fold } from "./Fold";
import { ImportProcess } from "./ImportProcess";
import { Journey } from "./Journey";
import { PartsForm } from "./PartsForm";
import { ProofStrip } from "./ProofStrip";
import b from "./bands.module.css";

type Tone = "white" | "yellow" | "black";

/** A service's band: on the homepage, or (`page`) opening the service's own page. */
type ServiceBandProps = { t: Dictionary; lang: Locale; page?: boolean };

/** A photo with its caption (also its alt text) in the page's language. */
const photo = (t: Dictionary, id: PhotoId & keyof Dictionary["photos"]) => ({ ...PHOTOS[id], caption: t.photos[id] });

/** A car from the CMS joined with its showroom cutout, if one has been made; a car with neither a cutout nor
 *  a photo is left out rather than breaking the page. Its WhatsApp message names it ("…the orange 2020
 *  Mitsubishi Outlander Sport"), and a spec without a value is left out. */
function slides(t: Dictionary, kind: Kind, cars: Car[], whatsapp: string, specs: (c: Car) => { label: string; value?: string }[]): CarSlide[] {
  const message = kind === "rental" ? t.rental.whatsapp : t.sales.whatsapp;
  return cars.flatMap((c) => {
    const cutout = CUTOUTS[kind][c.slug];
    if (!cutout && !c.photos.length) return [];
    const ref = t.carousel.ref
      .replace("{brand}", c.brand)
      .replace("{model}", c.model)
      .replace("{year}", c.year)
      .replace("{color}", c.color.toLowerCase());
    return [
      {
        slug: c.slug,
        brand: c.brand,
        model: c.model,
        year: c.year,
        body: c.body,
        status: c.status,
        specs: specs(c).flatMap((s) => (s.value ? [{ label: s.label, value: s.value }] : [])),
        whatsapp: wa(whatsapp, message.replace("{car}", ref)),
        cutout,
        photos: c.photos,
      },
    ];
  });
}

/**
 * A full-width band on one of the brand's grounds; coloured bands open like the hero's curtain.
 * A service page opens on its band instead: its title is the page's h1, under the header.
 */
export function Band({
  id,
  tone,
  title,
  lead,
  mark,
  page,
  className,
  children,
}: {
  id: string;
  tone: Tone;
  title: string;
  lead?: string;
  /** The logo's triangle before the title: kept for three bands so it stays a signature. */
  mark?: boolean;
  page?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const Title = page ? "h1" : "h2";
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`${b.band} ${b[tone]} ${page ? b.pageHead : tone !== "white" ? b.curtain : ""} ${className ?? ""}`}
    >
      <div className={b.inner}>
        <header className={b.head}>
          <Title id={`${id}-title`} className={`display ${b.title} ${mark ? b.mark : ""}`} data-reveal="title">
            {title}
          </Title>
          {lead ? (
            <p className={b.lead} data-reveal="rise">
              {lead}
            </p>
          ) : null}
        </header>
        {children}
      </div>
    </section>
  );
}

/** Yellow: the rental showroom, then the whole fleet together at home. */
export async function RentalBand({ t, lang, page }: ServiceBandProps) {
  const r = t.rental.specs;
  const cars = slides(t, "rental", await getCars("rental", lang), getContact(lang).whatsapp, (c) => [
    { label: r.year, value: c.year },
    { label: r.engine, value: c.engine },
    { label: r.gearbox, value: t.carousel.gearbox[c.gearbox] },
    { label: r.seats, value: c.seats },
    { label: r.color, value: c.color },
  ]);
  return (
    <Band id="rental" tone="yellow" title={page ? t.pages.rental.h1 : t.rental.title} lead={t.rental.lead} page={page} className={b.showroomBand}>
      <div className={b.showroom}>
        {/* The client can hide or remove every car in the panel; an empty showroom simply isn't drawn. */}
        {cars.length ? (
          <CarCarousel
            travel="left"
            labels={{ ...t.carousel, list: t.rental.list }}
            viewer={t.viewer}
            rate={t.rental.rate}
            action={{ label: t.rental.reserve, variant: "ink" }}
            cars={cars}
          />
        ) : null}
        <figure className={b.together} data-reveal="rise">
          <div className={b.togetherFrame}>
            <Image
              src={PHOTOS[FLEET_TOGETHER].src}
              alt={t.photos[FLEET_TOGETHER]}
              fill
              sizes="(max-width: 1240px) 100vw, 1240px"
              quality={85}
              className={b.togetherImg}
            />
          </div>
          <figcaption className="map-label" lang="en">
            {t.footer.tagline}
          </figcaption>
        </figure>
      </div>
    </Band>
  );
}

/** White: the cars for sale, facing right; a car on its own simply stands. */
export async function SalesBand({ t, lang, page }: ServiceBandProps) {
  const s = t.sales.specs;
  const cars = slides(t, "sales", await getCars("sales", lang), getContact(lang).whatsapp, (c) => [
    { label: s.year, value: c.year },
    { label: s.mileage, value: c.mileage ? `${new Intl.NumberFormat(lang).format(c.mileage)} ${t.sales.units[c.unit ?? "km"]}` : undefined },
    { label: s.gearbox, value: t.carousel.gearbox[c.gearbox] },
    { label: s.drive, value: c.drive },
    { label: s.seats, value: c.seats },
    { label: s.color, value: c.color },
  ]);
  return (
    <Band id="sales" tone="white" title={page ? t.pages.sales.h1 : t.sales.title} lead={t.sales.lead} page={page} className={b.showroomBand}>
      <div className={b.showroom}>
        {cars.length ? (
          <CarCarousel
            travel="right"
            labels={{ ...t.carousel, list: t.sales.list }}
            viewer={t.viewer}
            action={{ label: t.sales.ask, variant: "yellow" }}
            cars={cars}
          />
        ) : null}
        <div className={b.salesMore} data-reveal="rise">
          <div className={b.salesMoreText}>
            <p className={b.salesMoreTitle}>{t.sales.more.title}</p>
            <p className={b.salesMoreBody}>{t.sales.more.body}</p>
          </div>
          <Btn variant="ink" href={pagePath(lang, "import")}>
            {t.sales.more.link}
          </Btn>
        </div>
      </div>
    </Band>
  );
}

/** Black: how an import works (the road runs through the steps in a loop), then the client's own imports. The
 *  full process is on the import page; the homepage's journey leads there. */
export function ImportBand({ t, lang, page }: ServiceBandProps) {
  const facts = getImport(lang);
  return (
    <Band id="import" tone="black" title={page ? t.pages.import.h1 : t.import.title} lead={t.import.lead} mark page={page}>
      {page ? (
        <>
          <Journey steps={t.import.steps} />
          <ImportProcess t={t.import.process} />
        </>
      ) : (
        <Fold id="import" openLabel={t.import.open} closeLabel={t.fold.close}>
          <Journey steps={t.import.steps} />
          <Btn variant="ghostLight" href={`${pagePath(lang, "import")}#process`} className={b.processLink}>
            {t.import.process.toggle}
          </Btn>
        </Fold>
      )}
      <ProofStrip t={t.import.proof} photos={IMPORTS.map((id) => photo(t, id))} viewer={t.viewer} />
      <div className={b.importFoot}>
        <dl className={b.importFacts}>
          <div className={b.time}>
            <dt className="map-label">{t.import.time}</dt>
            <dd className={b.timeValue}>{facts.time}</dd>
          </div>
          <div className={b.time}>
            <dt className="map-label">{t.import.fee}</dt>
            <dd className={b.timeValue}>{facts.fee}</dd>
          </div>
        </dl>
        <Btn variant="yellow" icon="whatsapp" href={wa(getContact(lang).whatsapp, t.import.whatsapp)} external>
          {t.import.quote}
        </Btn>
      </div>
    </Band>
  );
}

/** Yellow: ask for a spare part. Title left, the request right; on the homepage it folds on phones. */
export function PartsBand({ t, lang, page }: ServiceBandProps) {
  const Title = page ? "h1" : "h2";
  const request = (
    <>
      <PartsForm t={t.parts.form} whatsapp={getContact(lang).whatsapp} />
      <p className={b.partsPricing}>{t.parts.pricing}</p>
    </>
  );
  return (
    <section id="parts" aria-labelledby="parts-title" className={`${b.band} ${b.yellow} ${page ? b.pageHead : b.curtain}`}>
      <div className={`${b.inner} ${b.split}`}>
        <div className={b.splitAside}>
          <Title id="parts-title" className={`display ${b.title}`} data-reveal="title">
            {page ? t.pages.parts.h1 : t.parts.title}
          </Title>
          <p className={b.lead} data-reveal="rise">
            {t.parts.lead}
          </p>
        </div>
        <div className={b.splitAside} data-reveal="rise">
          {page ? (
            request
          ) : (
            <Fold id="parts" openLabel={t.parts.open} closeLabel={t.fold.close}>
              {request}
            </Fold>
          )}
        </div>
      </div>
    </section>
  );
}

/** White: the common questions, and a way out beside them. After another white band, a hairline parts them. */
export function FaqBand({
  t,
  lang,
  items,
  lead,
  continues,
}: {
  t: Dictionary;
  lang: Locale;
  items: { q: string; a: string }[];
  lead?: string;
  continues?: boolean;
}) {
  return (
    <Band id="faq" tone="white" title={t.faq.title} lead={lead} className={`${continues ? b.continues : ""} ${b.faqBand}`}>
      <div className={b.faqGrid}>
        <Faq items={items} />
        <aside className={b.faqPanel} data-reveal="rise">
          <p className={b.faqPanelTitle}>{t.faq.more}</p>
          <p className={b.faqPanelBody}>{t.faq.moreBody}</p>
          <Btn variant="yellow" icon="whatsapp" href={wa(getContact(lang).whatsapp, t.whatsapp.general)} external>
            {t.faq.ask}
          </Btn>
        </aside>
      </div>
    </Band>
  );
}

/** Black: WhatsApp first, then phone, address, hours and the map. Every page ends on it. */
export function ContactBand({ t, lang }: { t: Dictionary; lang: Locale }) {
  const contact = getContact(lang);
  const chat = wa(contact.whatsapp, t.whatsapp.general);
  return (
    <section id="contact" aria-labelledby="contact-title" className={`${b.band} ${b.black} ${b.curtain}`}>
      <div className={`${b.inner} ${b.contactGrid}`}>
        <div className={b.contactMain}>
          <h2 id="contact-title" className={`display ${b.title} ${b.mark}`} data-reveal="title">
            {t.contact.title}
          </h2>
          <p className={b.lead} data-reveal="rise">
            {t.contact.lead}
          </p>
          <Btn variant="yellow" size="lg" icon="whatsapp" href={chat} external>
            {t.contact.whatsapp}
          </Btn>
          <dl className={b.contactList}>
            <div>
              <dt className="map-label">{t.contact.phone}</dt>
              <dd>
                <a href={chat} target="_blank" rel="noopener noreferrer">
                  {contact.phone.label}
                </a>
              </dd>
            </div>
            <div>
              <dt className="map-label">{t.contact.email}</dt>
              <dd>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </dd>
            </div>
            <div>
              <dt className="map-label">{t.contact.address}</dt>
              <dd>{t.contact.addressValue}</dd>
            </div>
            <div>
              <dt className="map-label">{t.contact.hours}</dt>
              <dd>{contact.hours}</dd>
            </div>
            <div className={b.contactWide}>
              <dt className="map-label">{t.contact.social}</dt>
              <dd className={b.social}>
                {contact.social.map((n) => (
                  <a key={n.name} href={n.href} target="_blank" rel="noopener noreferrer">
                    {n.name}
                    <ExternalIcon className={b.socialIcon} />
                  </a>
                ))}
              </dd>
            </div>
          </dl>
        </div>
        <div className={b.map}>
          <iframe className={b.mapFrame} src={mapEmbed(lang)} title={t.contact.mapTitle} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          <div className={b.mapInfo}>
            <span className="map-label">{t.contact.map}</span>
            <p className={b.mapPlace}>{t.contact.mapPlace}</p>
            <p className={b.mapArea}>{t.contact.mapArea}</p>
            <Btn variant="ghostLight" icon="external" href={MAP_URL} external>
              {t.contact.mapLink}
            </Btn>
          </div>
        </div>
      </div>
    </section>
  );
}
