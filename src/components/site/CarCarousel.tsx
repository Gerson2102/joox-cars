"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import type { Cutout } from "@/lib/fleet";
import { Btn, type BtnVariant } from "./Btn";
import { PhotoViewer, type Photo, type ViewerLabels } from "./PhotoViewer";
import styles from "./carousel.module.css";

export type CarSlide = {
  slug: string;
  brand: string;
  model: string;
  year: string;
  body: string;
  /** A car not on the road yet: being prepared, and whether it is also for rent or sale. */
  status?: string;
  specs: { label: string; value: string }[];
  /** The WhatsApp chat, its message naming this car. */
  whatsapp: string;
  /** The side-profile model photo; a car added in the CMS has none until one is made, and stands its first photo instead. */
  cutout?: Cutout;
  /** The client's own photos of the car, for the viewer. */
  photos: Photo[];
};

const nameOf = (c: CarSlide) => `${c.brand} ${c.model} ${c.year}`;

type Props = {
  cars: CarSlide[];
  /** Which way the cars face and travel. */
  travel: "right" | "left";
  labels: Dictionary["carousel"] & { list: string };
  viewer: ViewerLabels;
  /** A line beside the action, in place of a price (rental rates change with the season). */
  rate?: string;
  /** The WhatsApp button: ink on a yellow band, yellow on white (the action follows the ground). */
  action: { label: string; variant: BtnVariant };
};

/**
 * The showroom: one car in side profile at full size on the studio floor, the
 * model's name huge and outlined behind it; its neighbours wait at the page
 * edges, smaller and softly out of focus, so the eye stays on one car while
 * the others say there is more. The cars drive the way they face: the next
 * one comes into focus from behind as the current one moves on. They drive in
 * once when the band comes into view. A car on its own simply stands there.
 */
export function CarCarousel({ cars, travel, labels, viewer, rate, action }: Props) {
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
                {c.cutout ? (
                  <Image
                    src={c.cutout.src}
                    alt={nameOf(c)}
                    width={c.cutout.width}
                    height={c.cutout.height}
                    sizes="(max-width: 700px) 88vw, 880px"
                    quality={85}
                    className={styles.car}
                    draggable={false}
                  />
                ) : (
                  <span className={styles.print}>
                    <Image
                      src={c.photos[0].src}
                      alt={nameOf(c)}
                      fill
                      sizes="(max-width: 700px) 60vw, 520px"
                      quality={85}
                      className={styles.printImg}
                      draggable={false}
                    />
                  </span>
                )}
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
      </div>

      {/* Every car's details are in the page (for search and AI crawlers); only the one on show is visible. */}
      {cars.map((c, i) => (
        <div key={c.slug} className={styles.info} hidden={i !== index}>
          <div className={styles.titleRow}>
            <div className={styles.name}>
              <h3 className={styles.model}>
                <span className={styles.plain}>{c.brand}</span> {c.model} <span className={styles.plain}>{c.year}</span>
              </h3>
              <p className={styles.body}>{c.body}</p>
              {c.status ? <p className={styles.status}>{c.status}</p> : null}
              {c.photos.length ? (
                <Btn variant="ink" size="sm" icon="photos" type="button" opensDialog onClick={() => setPhoto(0)} className={styles.photos}>
                  {`${labels.photos} (${c.photos.length})`}
                </Btn>
              ) : null}
            </div>
            <div className={styles.buy}>
              {rate ? <p className={styles.rate}>{rate}</p> : null}
              <Btn variant={action.variant} icon="whatsapp" href={c.whatsapp} external>
                {action.label}
              </Btn>
            </div>
          </div>

          <dl className={styles.specs}>
            {c.specs.map((s) => (
              <div key={s.label}>
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>

          {/* A model photo says so; its credit is in the footer. */}
          {c.cutout?.credit ? <p className={styles.note}>{labels.modelNote}</p> : null}
        </div>
      ))}

      {single ? null : (
        <div className={styles.meta}>
          <div className={styles.dots}>
            {cars.map((c, i) => (
              <button
                key={c.slug}
                type="button"
                className={styles.dot}
                data-active={i === index || undefined}
                aria-label={`${labels.show} ${nameOf(c)}`}
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

      <PhotoViewer title={nameOf(car)} photos={car.photos} index={photo} onIndex={setPhoto} labels={viewer} />
    </div>
  );
}
