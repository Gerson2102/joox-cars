import Image from "next/image";
import { Fragment } from "react";
import { otherLocale, type Dictionary, type Locale } from "@/app/[lang]/dictionaries";
import { EMAIL, RENTAL_OPERATOR, SOCIAL } from "@/lib/contact";
import { FLEET } from "@/lib/fleet";
import { NAV, navHref } from "@/lib/sections";
import { HeartIcon } from "@/components/icons";
import { LangLink } from "./LangLink";
import b from "./bands.module.css";

/** The developer's signature, as on every Websites by Ger site. */
const MAKER = { handle: "@websites_by_ger", href: "https://www.instagram.com/websites_by_ger" };

/** Every page's footer: the lockup, the menu, the profiles, the rental operator and the model-photo credits. */
export function SiteFooter({ t, lang }: { t: Dictionary; lang: Locale }) {
  // One credit per photo: a car for rent and for sale shows the same model photo in both showrooms.
  const credits = [...new Set([...t.rental.cars, ...t.sales.cars].flatMap((c) => FLEET[c.slug]?.cutout.credit ?? []))];

  return (
    <footer className={b.footer}>
      <Image src="/brand/joox-cars-lockup.webp" alt={`JOOX CARS · ${t.footer.tagline}`} width={628} height={320} className={b.footerLogo} sizes="200px" />
      <nav aria-label={t.nav.label} className={b.footerNav}>
        <ul>
          {NAV.map((k) => (
            <li key={k}>
              <a href={navHref(lang, k)}>{t.nav.links[k]}</a>
            </li>
          ))}
          <li>
            <LangLink to={otherLocale(lang)} lang={otherLocale(lang)}>
              {t.nav.languageLabel}
            </LangLink>
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
  );
}
