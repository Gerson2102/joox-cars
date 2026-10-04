import Image from "next/image";
import { notFound } from "next/navigation";
import { Fragment, type CSSProperties, type ReactNode } from "react";
import { getDictionary, hasLocale, otherLocale, type Dictionary } from "./dictionaries";
import { businessJsonLd, faqJsonLd } from "./structured-data";
import { wa } from "@/lib/whatsapp";
import { MAP_URL, RENTAL_OPERATOR, mapEmbed } from "@/lib/contact";
import { getCars, getContact, getFaq, getImport, getReviews, type Car, type Kind } from "@/lib/content";
import { CUTOUTS, FLEET_TOGETHER, IMPORTS, PHOTOS, SERVICE_PHOTOS, type PhotoId } from "@/lib/fleet";
import { NAV } from "@/lib/sections";
import { ArrowIcon, ExternalIcon, HeartIcon } from "@/components/icons";
import { SiteHeader } from "@/components/site/SiteHeader";
import { HeroStage } from "@/components/site/HeroStage";
import { CarCarousel, type CarSlide } from "@/components/site/CarCarousel";
import { ProofStrip } from "@/components/site/ProofStrip";
import { Journey } from "@/components/site/Journey";
import { ImportProcess } from "@/components/site/ImportProcess";
import { PartsForm } from "@/components/site/PartsForm";
import { Fold } from "@/components/site/Fold";
import { Loop } from "@/components/site/Loop";
import { Faq } from "@/components/site/Faq";
import { Btn } from "@/components/site/Btn";
import { LangLink } from "@/components/site/LangLink";
import { ScrollFX } from "@/components/site/ScrollFX";
import b from "@/components/site/bands.module.css";

const SERVICES = ["rental", "sales", "import", "parts"] as const;

/** The developer's signature, as on every Websites by Ger site. */
const MAKER = { handle: "@websites_by_ger", href: "https://www.instagram.com/websites_by_ger" };

type Tone = "white" | "yellow" | "black";
const i = (n: number) => ({ ["--i" as string]: n }) as CSSProperties;

/** A photo with its caption (also its alt text) in the page's language. */
const photo = (t: Dictionary, id: PhotoId & keyof Dictionary["photos"]) => ({ ...PHOTOS[id], caption: t.photos[id] });

/** JSON-LD for a script tag, with "<" escaped so the data can never close the tag. */
const ld = (data: object) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });

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

/** A full-width band on one of the brand's grounds; coloured bands open like the hero's curtain. */
function Band({
  id,
  tone,
  title,
  lead,
  mark,
  className,
  children,
}: {
  id: string;
  tone: Tone;
  title: string;
  lead?: string;
  /** The logo's triangle before the title: kept for three bands so it stays a signature. */
  mark?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`${b.band} ${b[tone]} ${tone !== "white" ? b.curtain : ""} ${className ?? ""}`}>
      <div className={b.inner}>
        <header className={b.head}>
          <h2 id={`${id}-title`} className={`display ${b.title} ${mark ? b.mark : ""}`} data-reveal="title">
            {title}
          </h2>
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

/** One part of the About band: its heading, then its text in the band's secondary ink. */
function AboutPart({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={b.aboutPart} data-reveal="rise">
      <h3 className={b.aboutHeading}>{title}</h3>
      {children}
    </div>
  );
}

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = await getDictionary(lang);
  const [driven, eternal, purpose] = t.about.tagline;
  const other = otherLocale(lang);
  const r = t.rental.specs;
  const s = t.sales.specs;
  // What the client edits in the CMS: the cars, contact details, import time and fee, FAQ and reviews.
  const [rentalCars, salesCars] = await Promise.all([getCars("rental", lang), getCars("sales", lang)]);
  const contact = getContact(lang);
  const importFacts = getImport(lang);
  const faq = getFaq(lang);
  const reviews = getReviews(lang);
  const chat = (text: string) => wa(contact.whatsapp, text);
  const gearbox = (c: Car) => t.carousel.gearbox[c.gearbox];
  const rental = slides(t, "rental", rentalCars, contact.whatsapp, (c) => [
    { label: r.year, value: c.year },
    { label: r.engine, value: c.engine },
    { label: r.gearbox, value: gearbox(c) },
    { label: r.seats, value: c.seats },
    { label: r.color, value: c.color },
  ]);
  const sales = slides(t, "sales", salesCars, contact.whatsapp, (c) => [
    { label: s.year, value: c.year },
    { label: s.mileage, value: c.mileage ? `${new Intl.NumberFormat(lang).format(c.mileage)} ${t.sales.units[c.unit ?? "km"]}` : undefined },
    { label: s.gearbox, value: gearbox(c) },
    { label: s.drive, value: c.drive },
    { label: s.seats, value: c.seats },
    { label: s.color, value: c.color },
  ]);
  // One credit per photo: a car for rent and for sale shows the same model photo in both showrooms.
  const credits = [...new Set([...rental, ...sales].flatMap((c) => c.cutout?.credit ?? []))];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(businessJsonLd(t, lang, { contact, rental: rentalCars, sales: salesCars }))} />
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(faqJsonLd(faq))} />
      <SiteHeader t={t.nav} lang={lang} whatsappHref={chat(t.whatsapp.general)} tagline={t.about.tagline} />
      <ScrollFX />
      <main>
        <HeroStage t={t.hero} />

        {/* White: the four services at a glance, each under the client's own photo (parts has none yet). */}
        <Band id="services" tone="white" title={t.services.title} mark className={b.servicesBand}>
          <ul className={b.services} data-reveal="stagger">
            {SERVICES.map((k, n) => {
              const p = SERVICE_PHOTOS[k];
              return (
                <li key={k} style={i(n)}>
                  <a href={`#${k}`} className={b.service} data-photo={p ? "" : undefined}>
                    {p ? (
                      <span className={b.serviceFrame}>
                        <Image
                          src={PHOTOS[p].src}
                          alt=""
                          fill
                          sizes={n === 0 ? "(max-width: 700px) 88px, (max-width: 1100px) 100vw, 560px" : "(max-width: 700px) 88px, (max-width: 1100px) 50vw, 320px"}
                          quality={78}
                          className={b.serviceImg}
                        />
                      </span>
                    ) : null}
                    <span className={b.serviceText}>
                      <span className={b.serviceName}>{t.services.items[k].name}</span>
                      <span className={b.serviceLine}>{t.services.items[k].line}</span>
                    </span>
                    <span className={b.serviceGo} aria-hidden="true">
                      <ArrowIcon className={b.serviceArrow} />
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </Band>

        {/* Yellow: the rental showroom, then the whole fleet together at home. */}
        <Band id="rental" tone="yellow" title={t.rental.title} lead={t.rental.lead} className={b.showroomBand}>
          <div className={b.showroom}>
            {/* The client can hide or remove every car in the panel; an empty showroom simply isn't drawn. */}
            {rental.length ? (
              <CarCarousel
                travel="left"
                labels={{ ...t.carousel, list: t.rental.list }}
                viewer={t.viewer}
                rate={t.rental.rate}
                action={{ label: t.rental.reserve, variant: "ink" }}
                cars={rental}
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

        {/* White: the cars for sale, facing right; a car on its own simply stands. */}
        <Band id="sales" tone="white" title={t.sales.title} lead={t.sales.lead} className={b.showroomBand}>
          <div className={b.showroom}>
            {sales.length ? (
              <CarCarousel
                travel="right"
                labels={{ ...t.carousel, list: t.sales.list }}
                viewer={t.viewer}
                action={{ label: t.sales.ask, variant: "yellow" }}
                cars={sales}
              />
            ) : null}
            <div className={b.salesMore} data-reveal="rise">
              <div className={b.salesMoreText}>
                <p className={b.salesMoreTitle}>{t.sales.more.title}</p>
                <p className={b.salesMoreBody}>{t.sales.more.body}</p>
              </div>
              <Btn variant="ink" href="#import">
                {t.sales.more.link}
              </Btn>
            </div>
          </div>
        </Band>

        {/* Black: how an import works (the road runs through the steps in a loop, the full process folds out
            below it), then the client's own imports. */}
        <Band id="import" tone="black" title={t.import.title} lead={t.import.lead} mark>
          <Fold id="import" openLabel={t.import.open} closeLabel={t.fold.close}>
            <Journey steps={t.import.steps} />
            <ImportProcess t={t.import.process} />
          </Fold>
          <ProofStrip t={t.import.proof} photos={IMPORTS.map((id) => photo(t, id))} viewer={t.viewer} />
          <div className={b.importFoot}>
            <dl className={b.importFacts}>
              <div className={b.time}>
                <dt className="map-label">{t.import.time}</dt>
                <dd className={b.timeValue}>{importFacts.time}</dd>
              </div>
              <div className={b.time}>
                <dt className="map-label">{t.import.fee}</dt>
                <dd className={b.timeValue}>{importFacts.fee}</dd>
              </div>
            </dl>
            <Btn variant="yellow" icon="whatsapp" href={chat(t.import.whatsapp)} external>
              {t.import.quote}
            </Btn>
          </div>
        </Band>

        {/* Yellow: ask for a spare part. Title left, the request right. */}
        <section id="parts" aria-labelledby="parts-title" className={`${b.band} ${b.yellow} ${b.curtain}`}>
          <div className={`${b.inner} ${b.split}`}>
            <div className={b.splitAside}>
              <h2 id="parts-title" className={`display ${b.title}`} data-reveal="title">
                {t.parts.title}
              </h2>
              <p className={b.lead} data-reveal="rise">
                {t.parts.lead}
              </p>
            </div>
            <div className={b.splitAside} data-reveal="rise">
              <Fold id="parts" openLabel={t.parts.open} closeLabel={t.fold.close}>
                <PartsForm t={t.parts.form} whatsapp={contact.whatsapp} />
                <p className={b.partsPricing}>{t.parts.pricing}</p>
              </Fold>
            </div>
          </div>
        </section>

        {/* Black: who JOOX is: mission and vision side by side, then DNA and what it does, then the
            name's meaning beside the loop it explains (the logo's OO, drawn once, travelled forever). */}
        <section id="about" aria-labelledby="about-title" className={`${b.band} ${b.black} ${b.curtain}`}>
          <div className={b.inner}>
            <h2 id="about-title" className={`display ${b.aboutTitle}`} lang="en" data-reveal="title">
              {driven} <span className={b.eternal}>{eternal}</span> {purpose}
            </h2>
            <div className={b.aboutGrid}>
              <AboutPart title={t.about.mission.title}>
                <p>{t.about.mission.body}</p>
              </AboutPart>
              <AboutPart title={t.about.vision.title}>
                <p>{t.about.vision.body}</p>
              </AboutPart>
              <AboutPart title={t.about.dna.title}>
                <p className={b.aboutLead}>
                  {t.about.dna.values.split(" · ").map((v) => (
                    <span key={v}>{v}</span>
                  ))}
                </p>
                <p>{t.about.dna.body}</p>
              </AboutPart>
              <AboutPart title={t.about.what.title}>
                <p>{t.about.what.lead}</p>
                <p>{t.about.what.close}</p>
              </AboutPart>
            </div>
            <div className={b.meaning}>
              <Loop />
              <AboutPart title={t.about.meaning.title}>
                <p>{t.about.meaning.body}</p>
              </AboutPart>
            </div>
          </div>
        </section>

        {/* White: what customers say. */}
        <Band id="reviews" tone="white" title={t.reviews.title} lead={t.reviews.lead}>
          <ul className={b.reviews} data-reveal="stagger">
            {reviews.map((rv, n) => (
              <li key={rv.name} style={i(n)}>
                <figure className={b.review}>
                  <span className={b.quoteMark} aria-hidden="true">
                    “
                  </span>
                  <blockquote>{rv.quote}</blockquote>
                  <figcaption className="map-label">{`${rv.name} · ${t.nav.links[rv.service]}`}</figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </Band>

        {/* White, continued: the common questions, and a way out beside them. */}
        <Band id="faq" tone="white" title={t.faq.title} lead={t.faq.lead} className={`${b.continues} ${b.faqBand}`}>
          <div className={b.faqGrid}>
            <Faq items={faq} />
            <aside className={b.faqPanel} data-reveal="rise">
              <p className={b.faqPanelTitle}>{t.faq.more}</p>
              <p className={b.faqPanelBody}>{t.faq.moreBody}</p>
              <Btn variant="yellow" icon="whatsapp" href={chat(t.whatsapp.general)} external>
                {t.faq.ask}
              </Btn>
            </aside>
          </div>
        </Band>

        {/* Black: WhatsApp first, then phone, address, hours and the map. */}
        <section id="contact" aria-labelledby="contact-title" className={`${b.band} ${b.black} ${b.curtain}`}>
          <div className={`${b.inner} ${b.contactGrid}`}>
            <div className={b.contactMain}>
              <h2 id="contact-title" className={`display ${b.title} ${b.mark}`} data-reveal="title">
                {t.contact.title}
              </h2>
              <p className={b.lead} data-reveal="rise">
                {t.contact.lead}
              </p>
              <Btn variant="yellow" size="lg" icon="whatsapp" href={chat(t.whatsapp.general)} external>
                {t.contact.whatsapp}
              </Btn>
              <dl className={b.contactList}>
                <div>
                  <dt className="map-label">{t.contact.phone}</dt>
                  <dd>
                    <a href={contact.phone.href}>{contact.phone.label}</a>
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
      </main>

      <footer className={b.footer}>
        <Image src="/brand/joox-cars-lockup.webp" alt={`JOOX CARS · ${t.footer.tagline}`} width={628} height={320} className={b.footerLogo} sizes="200px" />
        <nav aria-label={t.nav.label} className={b.footerNav}>
          <ul>
            {NAV.map((k) => (
              <li key={k}>
                <a href={`#${k}`}>{t.nav.links[k]}</a>
              </li>
            ))}
            <li>
              <LangLink to={other}>{t.nav.languageLabel}</LangLink>
            </li>
          </ul>
        </nav>
        <ul className={b.footerSocial}>
          {contact.social.map((n) => (
            <li key={n.name}>
              <a href={n.href} target="_blank" rel="noopener noreferrer">
                {n.name}
              </a>
            </li>
          ))}
          <li>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </li>
        </ul>
        <p className={b.footerNote}>{t.footer.operator.replace("{name}", RENTAL_OPERATOR.name).replace("{id}", RENTAL_OPERATOR.id)}</p>
        <p className={b.footerNote}>
          {t.footer.credits}{" "}
          {credits.map((c, n) => (
            <Fragment key={c.page}>
              {n ? ", " : ""}
              <a href={c.page} target="_blank" rel="noopener noreferrer">
                {c.author}
              </a>{" "}
              ({c.license === "Public domain" ? t.footer.pd : c.license}
              {c.adjusted ? `, ${t.footer.adjusted}` : ""})
            </Fragment>
          ))}
          .
        </p>
        <div className={b.signoff}>
          <p>{t.footer.rights}</p>
          <p className={b.signature}>
            {t.footer.madeWith}
            <span role="img" aria-label={t.footer.love} className={b.heart}>
              <HeartIcon className={b.heartIcon} />
            </span>
            {t.footer.madeBy}
            <a href={MAKER.href} target="_blank" rel="noopener noreferrer" className={b.maker}>
              {MAKER.handle}
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}
