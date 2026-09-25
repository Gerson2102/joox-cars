"use client";

import Image from "next/image";
import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from "react";
import { CloseIcon } from "@/components/icons";
import type { Img } from "@/lib/fleet";
import styles from "./viewer.module.css";

export type Photo = Img & { caption: string };

export type ViewerLabels = { close: string; prev: string; next: string; of: string; choose: string };

type Props = {
  title: string;
  photos: Photo[];
  /** The photo on show, or null when the viewer is closed. */
  index: number | null;
  onIndex: (index: number | null) => void;
  labels: ViewerLabels;
};

/**
 * The client's real photos, full screen on ink: one at a time, arrows and
 * swipe to move, the whole set as thumbnails below. A native modal dialog, so
 * focus stays inside, Escape closes it and the page behind goes inert.
 */
export function PhotoViewer({ title, photos, index, onIndex, labels }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const start = useRef<number | null>(null);
  const open = index !== null;
  const n = photos.length;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      document.documentElement.style.overflow = "hidden";
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  // Closed by Escape, the close button or anything else: hand the state back.
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onClose = () => {
      document.documentElement.style.overflow = "";
      onIndex(null);
    };
    d.addEventListener("close", onClose);
    return () => d.removeEventListener("close", onClose);
  }, [onIndex]);

  const go = (d: number) => index !== null && onIndex((index + d + n) % n);

  const onKey = (e: KeyboardEvent) => {
    e.stopPropagation(); // the viewer can sit inside a carousel that also listens for arrows
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      go(e.key === "ArrowLeft" ? -1 : 1);
    }
  };
  const onDown = (e: PointerEvent) => {
    start.current = e.clientX;
  };
  const onUp = (e: PointerEvent) => {
    const s = start.current;
    start.current = null;
    if (s === null) return;
    const dx = e.clientX - s;
    if (Math.abs(dx) > 40) go(dx > 0 ? -1 : 1);
  };

  const photo = index !== null ? photos[index] : null;

  return (
    <dialog ref={ref} className={styles.viewer} aria-label={title} onKeyDown={onKey}>
      {photo && index !== null ? (
        <div className={styles.frame}>
          <header className={styles.bar}>
            <p className={styles.title}>{title}</p>
            <p className={styles.count} aria-live="polite">
              {index + 1} {labels.of} {n}
            </p>
            <button type="button" className={styles.close} onClick={() => ref.current?.close()} aria-label={labels.close} autoFocus>
              <CloseIcon className={styles.closeIcon} />
            </button>
          </header>

          <figure className={styles.stage}>
            <div className={styles.shot} onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => (start.current = null)}>
              <Image
                key={photo.src}
                src={photo.src}
                alt={photo.caption}
                fill
                sizes="100vw"
                quality={85}
                loading="eager"
                className={styles.img}
                draggable={false}
              />
            </div>
            <figcaption className={styles.caption}>{photo.caption}</figcaption>
            {n > 1 ? (
              <>
                <button type="button" className={styles.arrow} data-side="left" onClick={() => go(-1)} aria-label={labels.prev}>
                  <span className={styles.triLeft} aria-hidden="true" />
                </button>
                <button type="button" className={styles.arrow} data-side="right" onClick={() => go(1)} aria-label={labels.next}>
                  <span className={styles.triRight} aria-hidden="true" />
                </button>
              </>
            ) : null}
          </figure>

          {n > 1 ? (
            <ul className={styles.thumbs} aria-label={labels.choose}>
              {photos.map((p, i) => (
                <li key={p.src}>
                  <button type="button" className={styles.thumb} onClick={() => onIndex(i)} aria-label={p.caption} aria-current={i === index || undefined}>
                    <Image src={p.src} alt="" width={p.width} height={p.height} sizes="96px" quality={70} className={styles.thumbImg} draggable={false} />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </dialog>
  );
}
