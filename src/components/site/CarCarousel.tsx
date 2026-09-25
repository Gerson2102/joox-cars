"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { Credit, Img } from "@/lib/fleet";
import { wa } from "@/lib/whatsapp";
import { Btn } from "./Btn";
import { PhotoViewer, type Photo, type ViewerLabels } from "./PhotoViewer";
import styles from "./carousel.module.css";

export type CarSlide = {
  slug: string;
  brand: string;
  model: string;
  year: string;
  body: string;
  specs: { label: string; value: string }[];
  /** The WhatsApp message that names this car. */
  message: string;
  cutout: Img & { credit?: Credit };
  /** The client's own photos of the car, for the viewer. */
  photos: Photo[];
};

type Props = {
  cars: CarSlide[];
  /** Which way the cars face and travel. */
  travel: "right" | "left";
  labels: {
    list: string;
    prev: string;
    next: string;
    of: string;
    photo: string;
    model: string;
    modelNote: string;
    adjusted: string;
    pd: string;
    show: string;
    photos: string;
  };
  viewer: ViewerLabels;
  price: { value: string; unit?: string };
  action: string;
};

/**
 * The showroom: one car in side profile at full size on the studio floor, the
 * model's name huge and outlined behind it; its neighbours wait at the page
 * edges, smaller and softly out of focus, so the eye stays on one car while
 * the others say there is more. The cars drive the way they face: the next
 * one comes into focus from behind as the current one moves on. They drive in
 * once when the band comes into view. A car on its own simply stands there.
 */
export function CarCarousel({ cars, travel, labels, viewer, price, action }: Props) {
  const n = cars.length;
  const single = n === 1;
  const t = travel === "right" ? 1 : -1;
  const [index, setIndex] = useState(0);
  const [arrived, setArrived] = useState(false);
  const [photo, setPhoto] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);

  // Drive in once, the first time the stage is well in view (under reduced
  // motion the CSS never holds the cars back, so this only marks the moment).
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setArrived(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const step = useCallback((d: number) => setIndex((i) => (i + d + n) % n), [n]);
  // Moving the cars the way they travel is "next"; the other way is "previous".
  const move = useCallback((visual: "left" | "right") => step(visual === travel ? 1 : -1), [step, travel]);

  const onKey = (e: KeyboardEvent) => {
    if (single) return;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      move(e.key === "ArrowLeft" ? "left" : "right");
    }
  };

  // Swipe: a flick across the stage moves the cars that way.
  const onDown = (e: PointerEvent) => {
    start.current = { x: e.clientX, y: e.clientY };
  };
  const onUp = (e: PointerEvent) => {
    const s = start.current;
    start.current = null;
    if (!s || single) return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - s.y)) move(dx > 0 ? "right" : "left");
  };

  const rel = (i: number) => {
    let r = (((i - index) % n) + n) % n;
    if (r > n / 2) r -= n;
    return r;
  };

  const car = cars[index];
  const credit = car.cutout.credit;
  const nextLabel = (side: "left" | "right") => (side === travel ? labels.next : labels.prev);

  return (
    <div
      ref={rootRef}
      className={styles.carousel}
      data-travel={travel}
      data-single={single || undefined}
      data-arrived={arrived || undefined}
      role="region"
      aria-roledescription={single ? undefined : "carousel"}
      aria-label={labels.list}
      onKeyDown={onKey}
    >
      <div className={styles.stage} onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => (start.current = null)}>
        <div className={styles.ghost} aria-hidden="true">
          {cars.map((c, i) => (
            <span key={c.slug} className={styles.ghostWord} style={{ ["--rel" as string]: rel(i) * t }} data-active={i === index || undefined}>
              {c.model.split(" ")[0]}
            </span>
          ))}
        </div>

        <ul className={styles.track}>
          {cars.map((c, i) => {
            const r = rel(i);
            return (
              <li
                key={c.slug}
                className={styles.slide}
                style={{ ["--off" as string]: -r * t }}
                data-pos={r === 0 ? "center" : Math.abs(r) === 1 ? "side" : "away"}
                aria-hidden={r !== 0}
                onClick={Math.abs(r) === 1 ? () => step(r) : undefined}
              >
                <Image
                  src={c.cutout.src}
                  alt={`${c.brand} ${c.model} ${c.year}`}
                  width={c.cutout.width}
                  height={c.cutout.height}
                  sizes="(max-width: 700px) 88vw, 880px"
                  quality={85}
                  className={styles.car}
                  draggable={false}
                />
              </li>
            );
          })}
        </ul>

        {single
          ? null
          : (["left", "right"] as const).map((side) => (
              <button key={side} type="button" className={styles.arrow} data-side={side} onClick={() => move(side)} aria-label={nextLabel(side)}>
                <span className={side === "left" ? styles.triLeft : styles.triRight} aria-hidden="true" />
              </button>
            ))}

        {credit ? <p className={`map-label ${styles.tag}`}>{labels.model}</p> : null}
      </div>

      <div className={styles.info} key={car.slug}>
        <div className={styles.titleRow}>
          <div className={styles.name}>
            <h3 className={styles.model}>
              <span className={styles.brand}>{car.brand}</span> {car.model}
            </h3>
            <p className={styles.body}>
              {car.body} · {car.year}
            </p>
            {car.photos.length ? (
              <Btn variant="ink" size="sm" icon="photos" type="button" opensDialog onClick={() => setPhoto(0)} className={styles.photos}>
                {`${labels.photos} (${car.photos.length})`}
              </Btn>
            ) : null}
          </div>
          <div className={styles.buy}>
            <p className={styles.price}>
              <strong>{price.value}</strong> {price.unit}
            </p>
            <Btn variant="ink" icon="whatsapp" href={wa(car.message)} external>
              {action}
            </Btn>
          </div>
        </div>

        <dl className={styles.specs}>
          {car.specs.map((s) => (
            <div key={s.label}>
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>

        {credit ? (
          <p className={styles.credit}>
            {labels.modelNote} {labels.photo}: <a href={credit.page} target="_blank" rel="noopener noreferrer">{credit.author}</a>,{" "}
            {credit.license === "Public domain" ? labels.pd : credit.license}
            {credit.adjusted ? `, ${labels.adjusted}` : ""}.
          </p>
        ) : null}
      </div>

      {single ? null : (
        <div className={styles.meta}>
          <div className={styles.dots}>
            {cars.map((c, i) => (
              <button
                key={c.slug}
                type="button"
                className={styles.dot}
                data-active={i === index || undefined}
                aria-label={`${labels.show} ${c.brand} ${c.model} ${c.year}`}
                aria-current={i === index || undefined}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
          <p className={styles.count} aria-live="polite">
            <span className={styles.countNow}>{String(index + 1).padStart(2, "0")}</span>
            <span className={styles.countOf}>
              {labels.of} {String(n).padStart(2, "0")}
            </span>
          </p>
        </div>
      )}

      <PhotoViewer title={`${car.brand} ${car.model} ${car.year}`} photos={car.photos} index={photo} onIndex={setPhoto} labels={viewer} />
    </div>
  );
}
