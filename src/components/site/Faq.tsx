"use client";

import { useId, useState } from "react";
import styles from "./faq.module.css";

type Item = { q: string; a: string };

/** One question open at a time; the answer slides open (grid rows 0fr → 1fr). */
export function Faq({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const id = useId();

  return (
    <div className={styles.list}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className={styles.item} data-open={isOpen || undefined}>
            <h3 className={styles.q}>
              <button
                type="button"
                className={styles.trigger}
                aria-expanded={isOpen}
                aria-controls={`${id}-${i}`}
                id={`${id}-${i}-q`}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span>{item.q}</span>
                <span className={styles.icon} aria-hidden="true" />
              </button>
            </h3>
            <div id={`${id}-${i}`} role="region" aria-labelledby={`${id}-${i}-q`} className={styles.panel} inert={!isOpen || undefined}>
              <div className={styles.panelInner}>
                <p>{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
