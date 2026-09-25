"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { wa } from "@/lib/whatsapp";
import { CloseIcon, MenuIcon } from "@/components/icons";
import { Btn } from "./Btn";
import styles from "./header.module.css";

type NavCopy = {
  home: string;
  label: string;
  links: { rental: string; import: string; parts: string; sales: string; about: string; contact: string };
  language: string;
  languageLabel: string;
  whatsapp: string;
  whatsappLabel: string;
  menuOpen: string;
  menuClose: string;
  menu: string;
  place: string;
};

const KEYS = ["rental", "import", "parts", "sales", "about", "contact"] as const;
const noop = () => () => {};

/**
 * Over the hero film the header is transparent (reversed logo, white type).
 * Past the film it becomes a floating white capsule, and a yellow pill slides
 * under the link of the section being read. WhatsApp is one tap away everywhere.
 */
export function SiteHeader({ t, lang, whatsappText, tagline }: { t: NavCopy; lang: "es" | "en"; whatsappText: string; tagline: string[] }) {
  const [open, setOpen] = useState(false);
  const [overFilm, setOverFilm] = useState(true);
  const [active, setActive] = useState<string | null>(null);
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const other = lang === "es" ? "en" : "es";

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  // Over the film while the hero still shows under the header.
  useEffect(() => {
    const hero = document.querySelector("[data-hero]");
    if (!hero) return;
    const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 68;
    // The capsule arrives while the film still shows a strip below the bar.
    const io = new IntersectionObserver(([e]) => setOverFilm(e.isIntersecting), { rootMargin: `-${nav + 140}px 0px 0px 0px` });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  // Scroll spy: the section crossing the upper middle of the screen is the one being read.
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("main section[id]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // The pill follows the active link.
  useLayoutEffect(() => {
    const measure = () => {
      const a = listRef.current?.querySelector<HTMLElement>(`a[data-key="${active}"]`);
      setPill(a ? { x: a.offsetLeft, w: a.offsetWidth } : null);
    };
    measure();
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);

  useEffect(() => {
    if (!open) return;
    sheetRef.current?.querySelector<HTMLElement>("nav a")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    const main = document.querySelector("main");
    main?.setAttribute("inert", "");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      main?.removeAttribute("inert");
    };
  }, [open, close]);

  // The bar swaps between the full-colour and the reversed mark; the black sheet uses the reversed one.
  const logo = (where: "bar" | "sheet") => (
    <a href={`/${lang}`} className={styles.logo} aria-label={t.home}>
      {where === "bar" ? (
        <Image src="/brand/joox-cars-mark.webp" alt="" width={589} height={240} loading="eager" sizes="96px" className={styles.onPaper} />
      ) : null}
      <Image
        src="/brand/joox-cars-mark-reversed.webp"
        alt=""
        width={589}
        height={240}
        loading="eager"
        sizes="96px"
        className={where === "bar" ? styles.onFilm : undefined}
      />
    </a>
  );
  const whatsapp = (variant: "ink" | "white") => (
    <Btn variant={variant} size="sm" icon="whatsapp" href={wa(whatsappText)} external ariaLabel={t.whatsappLabel} className={styles.wa}>
      {t.whatsapp}
    </Btn>
  );
  const onPaper = !overFilm;
  const pillOn = onPaper && pill && KEYS.includes(active as (typeof KEYS)[number]);

  return (
    <header className={styles.bar} data-over-film={overFilm || undefined}>
      <div className={styles.inner}>
        {logo("bar")}
        <nav className={styles.links} aria-label={t.label}>
          <ul ref={listRef}>
            <li
              aria-hidden="true"
              className={styles.pill}
              data-on={pillOn || undefined}
              style={pill ? { transform: `translateX(${pill.x}px)`, width: pill.w } : undefined}
            />
            {KEYS.map((k) => (
              <li key={k}>
                <a href={`#${k}`} data-key={k} aria-current={onPaper && active === k ? "location" : undefined}>
                  <span className={styles.roll}>
                    <span>{t.links[k]}</span>
                    <span aria-hidden="true">{t.links[k]}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.actions}>
          <a className={styles.lang} href={`/${other}`} hrefLang={other} lang={other} aria-label={t.languageLabel}>
            {t.language}
          </a>
          {whatsapp(overFilm ? "white" : "ink")}
          <button
            ref={toggleRef}
            type="button"
            className={styles.menuButton}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? t.menuClose : t.menuOpen}
            onClick={() => setOpen((v) => !v)}
          >
            <MenuIcon className={styles.menuIcon} />
          </button>
        </div>
      </div>

      {mounted
        ? createPortal(
            <div id="site-menu" ref={sheetRef} className={styles.sheet} hidden={!open} role="dialog" aria-modal="true" aria-label={t.menu}>
              <div className={styles.sheetBar}>
                {logo("sheet")}
                <div className={styles.actions}>
                  {whatsapp("white")}
                  <button type="button" className={styles.sheetClose} aria-label={t.menuClose} onClick={close}>
                    <CloseIcon className={styles.menuIcon} />
                  </button>
                </div>
              </div>
              <div className={styles.sheetIntro}>
                <p className={styles.sheetTagline} lang="en">
                  {tagline[0]} <span className={styles.sheetEternal}>{tagline[1]}</span> {tagline[2]}
                </p>
                <p className={styles.sheetPlace}>{t.place}</p>
              </div>
              <nav aria-label={t.label}>
                <ul>
                  {KEYS.map((k, i) => (
                    <li key={k} style={{ ["--i" as string]: i }}>
                      <a href={`#${k}`} onClick={() => setOpen(false)}>
                        {t.links[k]}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              <a className={styles.sheetLang} href={`/${other}`} hrefLang={other} lang={other}>
                {t.languageLabel}
              </a>
            </div>,
            document.body,
          )
        : null}
    </header>
  );
}
