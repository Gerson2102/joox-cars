"use client";

import { useId, useState, type FormEvent } from "react";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { wa } from "@/lib/whatsapp";
import { Btn } from "./Btn";
import styles from "./bands.module.css";

const CAR = ["make", "model", "year"] as const;

/** No backend: the request is written into a WhatsApp message to `whatsapp` (the business number, digits only). */
export function PartsForm({ t, whatsapp }: { t: Dictionary["parts"]["form"]; whatsapp: string }) {
  const id = useId();
  const [error, setError] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const part = String(data.get("part") ?? "").trim();
    if (!part) {
      setError(true);
      e.currentTarget.querySelector<HTMLInputElement>("[name=part]")?.focus();
      return;
    }
    setError(false);
    const lines = [
      t.message,
      ...CAR.map((k) => [t[k], String(data.get(k) ?? "").trim()] as const)
        .filter(([, v]) => v)
        .map(([label, v]) => `${label}: ${v}`),
      `${t.part}: ${part}`,
    ];
    // Anchor click instead of window.open: phones and in-app browsers block scripted pop-ups.
    const link = document.createElement("a");
    link.href = wa(whatsapp, lines.join("\n"));
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.fields}>
        {CAR.map((k) => (
          <label key={k} className={styles.field}>
            <span>{t[k]}</span>
            <input name={k} type="text" inputMode={k === "year" ? "numeric" : "text"} autoComplete="off" />
          </label>
        ))}
        <label className={`${styles.field} ${styles.fieldWide}`}>
          <span>{t.part}</span>
          <input
            name="part"
            type="text"
            placeholder={t.partHint}
            aria-invalid={error || undefined}
            aria-describedby={error ? `${id}-err` : undefined}
            required
          />
          {error ? (
            <small id={`${id}-err`} className={styles.fieldError}>
              {t.partHint}
            </small>
          ) : null}
        </label>
      </div>
      <Btn type="submit" variant="ink" icon="whatsapp">
        {t.send}
      </Btn>
    </form>
  );
}
