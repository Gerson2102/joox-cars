"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { PhotoViewer, type Photo, type ViewerLabels } from "./PhotoViewer";
import styles from "./proof.module.css";

type Props = {
  t: { title: string; body: string; list: string; prev: string; next: string; of: string };
  photos: Photo[];
  viewer: ViewerLabels;
};

const EASE = 0.1; // how much of the remaining distance the strip covers each frame

/**
 * The client's own imports. Scrolling down the page holds the strip in view
 * and carries it sideways, eased toward the scroll position, each photo
 * drifting slightly inside its frame; a count and a line show the way through.
 * Without the script, and under reduced motion, it is a strip you swipe or
 * page with the arrows. Any photo opens full screen.
 */
export function ProofStrip({ t, photos, viewer }: Props) {
  const [photo, setPhoto] = useState<number | null>(null);
  const runwayRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const focusRef = useRef<(i: number) => void>(() => {});

  useEffect(() => {
    const runway = runwayRef.current;
    const track = trackRef.current;
    if (!runway || !track || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    runway.dataset.scrub = "";

    const items = Array.from(track.children) as HTMLElement[];
    let travel = 0;
    let top = 0;
    let span = 1;
    let centres: number[] = [];
    let target = 0;
    let current = 0;
    let raf = 0;

    const frame = () => {
      raf = 0;
      current += (target - current) * EASE;
      if (Math.abs(target - current) < 0.25) current = target;
      track.style.transform = `translate3d(${-current}px, 0, 0)`;
      const vw = window.innerWidth;
      centres.forEach((c, i) => items[i].style.setProperty("--shift", ((c - current - vw / 2) / vw).toFixed(4)));
      const done = travel ? current / travel : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${done})`;
      if (countRef.current) countRef.current.textContent = String(Math.round(done * (items.length - 1)) + 1).padStart(2, "0");
      if (current !== target) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const read = () => {
      const p = Math.min(1, Math.max(0, (window.scrollY - top) / span));
      target = p * travel;
      kick();
    };
    const measure = () => {
      travel = Math.max(0, track.scrollWidth - window.innerWidth);
      runway.style.height = `${window.innerHeight + travel}px`;
      top = runway.getBoundingClientRect().top + window.scrollY;
      span = Math.max(1, runway.offsetHeight - window.innerHeight);
      centres = items.map((it) => it.offsetLeft + it.offsetWidth / 2);
      read();
    };
    // Keyboard: a photo that takes focus brings the page to where it sits in the strip.
    focusRef.current = (i) => {
      const p = travel ? Math.min(1, Math.max(0, (centres[i] - window.innerWidth / 2) / travel)) : 0;
      window.scrollTo({ top: top + p * span });
    };

    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", measure);
    measure();
    current = target;
    frame();

    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", measure);
      cancelAnimationFrame(raf);
      delete runway.dataset.scrub;
      runway.style.height = "";
      track.style.transform = "";
      focusRef.current = () => {};
    };
  }, []);

  const page = (d: number) => {
    const el = trackRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: d * el.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div ref={runwayRef} className={styles.proof}>
      <div className={styles.frame}>
        <div className={styles.head}>
          <div className={styles.text}>
            <h3 className={styles.title}>{t.title}</h3>
            <p className={styles.body}>{t.body}</p>
          </div>
          <p className={styles.count} aria-hidden="true">
            <span ref={countRef} className={styles.countNow}>
              01
            </span>
            <span className={styles.countOf}>
              {t.of} {String(photos.length).padStart(2, "0")}
            </span>
          </p>
          <div className={styles.nav}>
            <button type="button" className={styles.arrow} onClick={() => page(-1)} aria-label={t.prev}>
              <span className={styles.triLeft} aria-hidden="true" />
            </button>
            <button type="button" className={styles.arrow} onClick={() => page(1)} aria-label={t.next}>
              <span className={styles.triRight} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className={styles.window}>
          <ul ref={trackRef} className={styles.strip} aria-label={t.list}>
            {photos.map((p, i) => (
              <li key={p.src} style={{ ["--ratio" as string]: p.width / p.height } as CSSProperties}>
                <button type="button" className={styles.shot} onClick={() => setPhoto(i)} onFocus={() => focusRef.current(i)} aria-haspopup="dialog">
                  <Image src={p.src} alt={p.caption} width={p.width} height={p.height} sizes="(max-width: 700px) 80vw, 460px" quality={78} className={styles.img} draggable={false} />
                </button>
                <p className={`map-label ${styles.caption}`} aria-hidden="true">
                  {p.caption}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.progress} aria-hidden="true">
          <span ref={barRef} className={styles.progressFill} />
        </div>
      </div>

      <PhotoViewer title={t.title} photos={photos} index={photo} onIndex={setPhoto} labels={viewer} />
    </div>
  );
}
