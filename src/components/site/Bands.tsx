import Image from "next/image";
import type { ReactNode } from "react";
import type { Dictionary, Locale } from "@/app/[lang]/dictionaries";
import { EMAIL, MAP_URL, PHONE, SOCIAL, mapEmbed } from "@/lib/contact";
import { FLEET, FLEET_TOGETHER, IMPORTS, PHOTOS, type PhotoId } from "@/lib/fleet";
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
const photo = (t: Dictionary, id: PhotoId) => ({ ...PHOTOS[id], caption: t.photos[id] });

type CarCopy = { slug: string; brand: string; model: string; year: string; body: string; ref: string };

/** A dictionary car joined with its images; a car without images is left out rather than breaking the page. */
function slides<C extends CarCopy>(t: Dictionary, cars: C[], message: string, specs: (c: C) => CarSlide["specs"]): CarSlide[] {
  return cars.flatMap((c) => {
    const f = FLEET[c.slug];
    return f ? [{ ...c, specs: specs(c), message: message.replace("{car}", c.ref), cutout: f.cutout, photos: f.photos.map((id) => photo(t, id)) }] : [];
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
export function RentalBand({ t, page }: ServiceBandProps) {
  const r = t.rental.specs;
  return (
    <Band id="rental" tone="yellow" title={page ? t.pages.rental.h1 : t.rental.title} lead={t.rental.lead} page={page} className={b.showroomBand}>
      <div className={b.showroom}>
        <CarCarousel
          travel="left"
          labels={{ ...t.carousel, list: t.rental.list }}
          viewer={t.viewer}
          rate={t.rental.rate}
          action={{ label: t.rental.reserve, variant: "ink" }}
          cars={slides(t, t.rental.cars, t.rental.whatsapp, (c) => [
            { label: r.year, value: c.year },
            { label: r.engine, value: c.engine },
            { label: r.gearbox, value: c.gearbox },
            { label: r.seats, value: c.seats },
            { label: r.color, value: c.color },
          ])}
        />
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
export function SalesBand({ t, lang, page }: ServiceBandProps) {
  const s = t.sales.specs;
  return (
    <Band id="sales" tone="white" title={page ? t.pages.sales.h1 : t.sales.title} lead={t.sales.lead} page={page} className={b.showroomBand}>
      <div className={b.showroom}>
        <CarCarousel
          travel="right"
          labels={{ ...t.carousel, list: t.sales.list }}
          viewer={t.viewer}
          action={{ label: t.sales.ask, variant: "yellow" }}
          cars={slides(t, t.sales.cars, t.sales.whatsapp, (c) => [
            { label: s.year, value: c.year },
            { label: s.mileage, value: `${new Intl.NumberFormat(lang).format(c.mileage)} ${t.sales.units[c.unit as keyof typeof t.sales.units]}` },
            { label: s.gearbox, value: c.gearbox },
            { label: s.drive, value: c.drive },
            { label: s.seats, value: c.seats },
            { label: s.color, value: c.color },
          ])}
        />
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
            <dd className={b.timeValue}>{t.import.timeValue}</dd>
          </div>
          <div className={b.time}>
            <dt className="map-label">{t.import.fee}</dt>
            <dd className={b.timeValue}>{t.import.feeValue}</dd>
          </div>
        </dl>
        <Btn variant="yellow" icon="whatsapp" href={wa(t.import.whatsapp)} external>
          {t.import.quote}
        </Btn>
      </div>
    </Band>
  );
}

/** Yellow: ask for a spare part. Title left, the request right; on the homepage it folds on phones. */
export function PartsBand({ t, page }: ServiceBandProps) {
  const Title = page ? "h1" : "h2";
  const request = (
    <>
      <PartsForm t={t.parts.form} />
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
export function FaqBand({ t, items, lead, continues }: { t: Dictionary; items: Dictionary["faq"]["items"]; lead?: string; continues?: boolean }) {
  return (
    <Band id="faq" tone="white" title={t.faq.title} lead={lead} className={`${continues ? b.continues : ""} ${b.faqBand}`}>
      <div className={b.faqGrid}>
        <Faq items={items} />
        <aside className={b.faqPanel} data-reveal="rise">
          <p className={b.faqPanelTitle}>{t.faq.more}</p>
          <p className={b.faqPanelBody}>{t.faq.moreBody}</p>
          <Btn variant="yellow" icon="whatsapp" href={wa(t.whatsapp.general)} external>
            {t.faq.ask}
          </Btn>
        </aside>
      </div>
    </Band>
  );
}

/** Black: WhatsApp first, then phone, address, hours and the map. Every page ends on it. */
export function ContactBand({ t, lang }: { t: Dictionary; lang: Locale }) {
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
          <Btn variant="yellow" size="lg" icon="whatsapp" href={wa(t.whatsapp.general)} external>
            {t.contact.whatsapp}
          </Btn>
          <dl className={b.contactList}>
            <div>
              <dt className="map-label">{t.contact.phone}</dt>
              <dd>
                <a href={wa(t.whatsapp.general)} target="_blank" rel="noopener noreferrer">
                  {PHONE.label}
                </a>
              </dd>
            </div>
            <div>
              <dt className="map-label">{t.contact.email}</dt>
              <dd>
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              </dd>
            </div>
            <div>
              <dt className="map-label">{t.contact.address}</dt>
              <dd>{t.contact.addressValue}</dd>
            </div>
            <div>
              <dt className="map-label">{t.contact.hours}</dt>
              <dd>{t.contact.hoursValue}</dd>
            </div>
            <div className={b.contactWide}>
              <dt className="map-label">{t.contact.social}</dt>
              <dd className={b.social}>
                {SOCIAL.map((n) => (
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
