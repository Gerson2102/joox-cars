"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import styles from "./bands.module.css";

/**
 * A band that folds flat until opened, on phones only: it shows its title and
 * lead, and this control unfolds the rest. Arriving by its link
 * (#id) opens it. Wider screens and no-JS visitors always see everything.
 */
export function Fold({ id, openLabel, closeLabel, children }: { id: string; openLabel: string; closeLabel: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const contentId = useId();

  useEffect(() => {
    const sync = () => {
      if (window.location.hash === `#${id}`) setOpen(true);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [id]);

  return (
    <>
      <button type="button" className={styles.foldToggle} aria-expanded={open} aria-controls={contentId} onClick={() => setOpen((v) => !v)}>
        {open ? closeLabel : openLabel}
        <span className={styles.foldChevron} aria-hidden="true" />
      </button>
      <div id={contentId} className={styles.fold} data-open={open}>
        {children}
      </div>
    </>
  );
}
