"use client";

import { getImageProps } from "next/image";
import { useFilm } from "./useFilm";
import { Btn } from "./Btn";
import styles from "./hero.module.css";

// Phones and portrait screens get the film composed for a tall frame.
const PHONE = "(max-width: 719px), (max-aspect-ratio: 4/5)";
// Film time of both posters (scripts/media/v2_bake.py prints it).
const POSTER_TIME = 2.711;

type Copy = {
  title: string;
  sub: string;
  primary: string;
  secondary: string;
};

/**
 * The JOOX film as the whole hero stage: the car drives through the word
 * (baked in scripts/media/v2_bake.py), the header floats over it, the copy
 * takes the dark canopy top-left. On phones the film is a band over the top
 * and the copy sits on ink below it. The film plays on its own and pauses
 * itself offscreen; it has no controls on the page.
 */
export function HeroStage({ t }: { t: Copy }) {
  const { videoRef, status } = useFilm("/media/v2/film", {
    startAt: POSTER_TIME,
    phone: { query: PHONE, base: "/media/v2/film-phone" },
  });

  const common = { alt: "", sizes: "100vw", quality: 78 };
  const {
    props: { srcSet: desktop },
  } = getImageProps({ ...common, src: "/media/v2/poster.webp", width: 1920, height: 1080 });
  const {
    props: { srcSet: phone, ...img },
  } = getImageProps({ ...common, src: "/media/v2/poster-phone.webp", width: 890, height: 1080 });

  return (
    <section className={styles.stage} aria-labelledby="hero-title" data-hero="">
      <div className={styles.back}>
        <picture>
          <source media={PHONE} srcSet={phone} />
          <source srcSet={desktop} />
          {/* The poster is the LCP; the text rides on top as live HTML. */}
          {/* eslint-disable-next-line jsx-a11y/alt-text -- alt comes from getImageProps */}
          <img {...img} className={styles.media} fetchPriority="high" />
        </picture>
        <video
          ref={videoRef}
          className={styles.media}
          data-status={status}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>
      <div className={styles.scrim} aria-hidden="true" />

      <div className={styles.copy}>
        <h1 id="hero-title" className={`display ${styles.title}`}>
          {t.title}
        </h1>
        <p className={styles.sub}>{t.sub}</p>
        <div className={styles.ctas}>
          <Btn variant="yellow" href="#rental" className={styles.cta}>
            {t.primary}
          </Btn>
          <Btn variant="ghostLight" href="#import" className={styles.cta}>
            {t.secondary}
          </Btn>
        </div>
      </div>
    </section>
  );
}
