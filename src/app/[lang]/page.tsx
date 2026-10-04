import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { getDictionary, hasLocale } from "./dictionaries";
import { pageMetadata } from "./metadata";
import { homeJsonLd, ld } from "./structured-data";
import { PHOTOS, SERVICE_PHOTOS } from "@/lib/fleet";
import { SERVICES, pagePath } from "@/lib/sections";
import { ArrowIcon } from "@/components/icons";
import { HeroStage } from "@/components/site/HeroStage";
import { Loop } from "@/components/site/Loop";
import { Band, ContactBand, FaqBand, ImportBand, PartsBand, RentalBand, SalesBand } from "@/components/site/Bands";
import b from "@/components/site/bands.module.css";

const i = (n: number) => ({ ["--i" as string]: n }) as CSSProperties;

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return pageMetadata(await getDictionary(lang), lang);
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(homeJsonLd(t, lang))} />
      <main>
        <HeroStage t={t.hero} />

        {/* White: the four services at a glance, each under the client's own photo (parts has none yet), each
            leading to its page. */}
        <Band id="services" tone="white" title={t.services.title} mark className={b.servicesBand}>
          <ul className={b.services} data-reveal="stagger">
            {SERVICES.map((k, n) => {
              const p = SERVICE_PHOTOS[k];
              return (
                <li key={k} style={i(n)}>
                  <a href={pagePath(lang, k)} className={b.service} data-photo={p ? "" : undefined}>
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

        <RentalBand t={t} lang={lang} />
        <SalesBand t={t} lang={lang} />
        <ImportBand t={t} lang={lang} />
        <PartsBand t={t} lang={lang} />

        {/* Black: who JOOX is: what JOOX CARS is in one sentence, mission and vision side by side, then DNA and
            what it does, then the name's meaning beside the loop it explains (the logo's OO, drawn once,
            travelled forever). */}
        <section id="about" aria-labelledby="about-title" className={`${b.band} ${b.black} ${b.curtain}`}>
          <div className={b.inner}>
            <header className={b.head}>
              <h2 id="about-title" className={`display ${b.aboutTitle}`} lang="en" data-reveal="title">
                {driven} <span className={b.eternal}>{eternal}</span> {purpose}
              </h2>
              <p className={b.lead} data-reveal="rise">
                {t.about.lead}
              </p>
            </header>
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
        </Band>

        <FaqBand t={t} items={t.faq.items} lead={t.faq.lead} continues />
        <ContactBand t={t} lang={lang} />
      </main>
    </>
  );
}
