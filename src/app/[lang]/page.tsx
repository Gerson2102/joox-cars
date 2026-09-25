import Image from "next/image";
import { notFound } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { getDictionary, hasLocale, type Dictionary } from "./dictionaries";
import { wa } from "@/lib/whatsapp";
import { EMAIL, MAP_URL, PHONE, SOCIAL } from "@/lib/contact";
import { FLEET, FLEET_TOGETHER, IMPORTS, PHOTOS, type PhotoId } from "@/lib/fleet";
import { ExternalIcon } from "@/components/icons";
import { SiteHeader } from "@/components/site/SiteHeader";
import { HeroStage } from "@/components/site/HeroStage";
import { CarCarousel, type CarSlide } from "@/components/site/CarCarousel";
import { ProofStrip } from "@/components/site/ProofStrip";
import { Journey } from "@/components/site/Journey";
import { PartsForm } from "@/components/site/PartsForm";
import { Fold } from "@/components/site/Fold";
import { Loop } from "@/components/site/Loop";
import { Faq } from "@/components/site/Faq";
import { Btn } from "@/components/site/Btn";
import { ScrollFX } from "@/components/site/ScrollFX";
import b from "@/components/site/bands.module.css";

const SERVICES = ["rental", "import", "parts", "sales"] as const;
const NAV = ["rental", "import", "parts", "sales", "about", "contact"] as const;

type Tone = "white" | "yellow" | "black";
const i = (n: number) => ({ ["--i" as string]: n }) as CSSProperties;

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

/** A full-width band on one of the brand's grounds; coloured bands open like the hero's curtain. */
function Band({
  id,
  tone,
  title,
  lead,
  wide,
  className,
  children,
}: {
  id: string;
  tone: Tone;
  title: string;
  lead?: string;
  /** Title and lead side by side (the showrooms), so the stage starts sooner. */
  wide?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`${b.band} ${b[tone]} ${tone !== "white" ? b.curtain : ""} ${className ?? ""}`}>
      <div className={b.inner}>
        <header className={wide ? `${b.head} ${b.headWide}` : b.head}>
          <h2 id={`${id}-title`} className={`display ${b.title}`} data-reveal="title">
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

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = await getDictionary(lang);
  const [driven, eternal, purpose] = t.about.tagline;
  const other = lang === "es" ? "en" : "es";
  const r = t.rental.specs;
  const s = t.sales.specs;

  return (
    <>
      <SiteHeader t={t.nav} lang={lang} whatsappText={t.whatsapp.general} tagline={t.about.tagline} />
      <ScrollFX />
      <main>
        <HeroStage t={t.hero} />

        {/* White: the four services at a glance. */}
        <Band id="services" tone="white" title={t.services.title}>
          <ul className={b.services} data-reveal="stagger">
            {SERVICES.map((k, n) => (
              <li key={k} style={i(n)}>
                <a href={`#${k}`} className={b.service}>
                  <span className={b.serviceName}>{t.services.items[k].name}</span>
                  <span className={b.serviceLine}>{t.services.items[k].line}</span>
                  <span className={b.serviceGo} aria-hidden="true">
                    <span className={b.triRight} />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Band>

        {/* Yellow: the rental showroom, then the whole fleet together at home. */}
        <Band id="rental" tone="yellow" title={t.rental.title} lead={t.rental.lead} wide className={b.showroomBand}>
          <div className={b.showroom}>
            <CarCarousel
              travel="left"
              labels={{ ...t.carousel, list: t.rental.list }}
              viewer={t.viewer}
              price={{ value: t.rental.price, unit: t.rental.perDay }}
              action={t.rental.reserve}
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
              <figcaption className="map-label">{t.rental.together}</figcaption>
            </figure>
          </div>
        </Band>

        {/* White: how an import works (the road runs through the steps in a loop), then the client's own imports. */}
        <Band id="import" tone="white" title={t.import.title} lead={t.import.lead}>
          <Fold id="import" openLabel={t.import.open} closeLabel={t.fold.close}>
            <Journey steps={t.import.steps} />
          </Fold>
          <ProofStrip t={t.import.proof} photos={IMPORTS.map((id) => photo(t, id))} viewer={t.viewer} />
          <div className={b.importFoot}>
            <p className={b.time}>
              <span className="map-label">{t.import.time}</span>
              <span className={b.timeValue}>{t.import.timeValue}</span>
            </p>
            <Btn variant="ink" icon="whatsapp" href={wa(t.import.whatsapp)} external>
              {t.import.quote}
            </Btn>
          </div>
        </Band>

        {/* Black: ask for a spare part. Title left, the request right. */}
        <section id="parts" aria-labelledby="parts-title" className={`${b.band} ${b.black} ${b.curtain}`}>
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
                <PartsForm t={t.parts.form} />
                <p className={b.note}>{t.parts.catalog}</p>
              </Fold>
            </div>
          </div>
        </section>

        {/* Yellow: the cars for sale, facing right; a car on its own simply stands. */}
        <Band id="sales" tone="yellow" title={t.sales.title} lead={t.sales.lead} wide className={b.showroomBand}>
          <div className={b.showroom}>
            <CarCarousel
              travel="right"
              labels={{ ...t.carousel, list: t.sales.list }}
              viewer={t.viewer}
              price={{ value: t.sales.price }}
              action={t.sales.ask}
              cars={slides(t, t.sales.cars, t.sales.whatsapp, (c) => [
                { label: s.year, value: c.year },
                { label: s.km, value: t.sales.km },
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
              <Btn variant="ink" href="#import">
                {t.sales.more.link}
              </Btn>
            </div>
          </div>
        </Band>

        {/* Black: who JOOX is, in the family's own words. The loop is the logo's OO, drawn once, travelled forever. */}
        <section id="about" aria-labelledby="about-title" className={`${b.band} ${b.black} ${b.curtain}`}>
          <div className={`${b.inner} ${b.aboutGrid}`}>
            <div className={b.aboutText}>
              <h2 id="about-title" className={`display ${b.aboutTitle}`} lang="en" data-reveal="title">
                {driven} <span className={b.eternal}>{eternal}</span> {purpose}
              </h2>
              <p className={b.aboutLead} data-reveal="rise">
                {t.about.lead}
              </p>
              <div className={b.story}>
                {t.about.story.map((p) => (
                  <p key={p}>{p}</p>
                ))}
                <ul className={b.paths}>
                  {t.about.paths.map((p) => (
                    <li key={p}>
                      <span className={b.triRight} aria-hidden="true" />
                      {p}
                    </li>
                  ))}
                </ul>
                {t.about.after.map((p) => (
                  <p key={p}>{p}</p>
                ))}
                <p className={b.storyClose}>{t.about.close}</p>
              </div>
            </div>
            <Loop />
          </div>
        </section>

        {/* White: what customers say. */}
        <Band id="reviews" tone="white" title={t.reviews.title}>
          <ul className={b.reviews} data-reveal="stagger">
            {t.reviews.items.map((rv, n) => (
              <li key={rv.who} style={i(n)}>
                <figure className={b.review}>
                  <span className={b.quoteMark} aria-hidden="true">
                    “
                  </span>
                  <blockquote>{rv.quote}</blockquote>
                  <figcaption className="map-label">{rv.who}</figcaption>
                </figure>
              </li>
            ))}
          </ul>
          <p className={b.note}>{t.reviews.placeholder}</p>
        </Band>

        {/* White, continued: the common questions, and a way out beside them. */}
        <Band id="faq" tone="white" title={t.faq.title} lead={t.faq.lead} className={b.continues}>
          <div className={b.faqGrid}>
            <Faq items={t.faq.items} />
            <aside className={b.faqPanel} data-reveal="rise">
              <p className={b.faqPanelTitle}>{t.faq.more}</p>
              <p className={b.faqPanelBody}>{t.faq.moreBody}</p>
              <Btn variant="yellow" icon="whatsapp" href={wa(t.whatsapp.general)} external>
                {t.faq.ask}
              </Btn>
            </aside>
          </div>
        </Band>

        {/* Black: WhatsApp first, then phone, address, hours and the map. */}
        <section id="contact" aria-labelledby="contact-title" className={`${b.band} ${b.black} ${b.curtain}`}>
          <div className={`${b.inner} ${b.contactGrid}`}>
            <div className={b.contactMain}>
              <h2 id="contact-title" className={`display ${b.title}`} data-reveal="title">
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
                    <a href={PHONE.href}>{PHONE.label}</a>
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
              <span className={b.pin} aria-hidden="true" />
              <span className="map-label">{t.contact.map}</span>
              <p className={b.mapPlace}>{t.contact.mapPlace}</p>
              <p className={b.mapArea}>{t.contact.mapArea}</p>
              <Btn variant="ghostLight" icon="external" href={MAP_URL} external>
                {t.contact.mapLink}
              </Btn>
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
              <a href={`/${other}`} hrefLang={other}>
                {t.nav.languageLabel}
              </a>
            </li>
          </ul>
        </nav>
        <ul className={b.footerSocial}>
          {SOCIAL.map((n) => (
            <li key={n.name}>
              <a href={n.href} target="_blank" rel="noopener noreferrer">
                {n.name}
              </a>
            </li>
          ))}
          <li>
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </li>
        </ul>
        <p className={b.footerNote}>{t.footer.media}</p>
        <p className={b.footerNote}>{t.footer.rights}</p>
      </footer>
    </>
  );
}
