"use client";

import { useId, useState, type FormEvent } from "react";
import { wa } from "@/lib/whatsapp";
import { Btn } from "./Btn";
import styles from "./bands.module.css";

type Copy = {
  make: string;
  model: string;
  year: string;
  part: string;
  partHint: string;
  send: string;
  message: string;
};

/** No backend: the request is written into a WhatsApp message. */
export function PartsForm({ t }: { t: Copy }) {
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
      ...(["make", "model", "year"] as const)
        .map((k) => [t[k], String(data.get(k) ?? "").trim()] as const)
        .filter(([, v]) => v)
        .map(([label, v]) => `${label}: ${v}`),
      `${t.part}: ${part}`,
    ];
    window.open(wa(lines.join("\n")), "_blank", "noopener,noreferrer");
  };

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.fields}>
        {(["make", "model", "year"] as const).map((k) => (
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
      <Btn type="submit" variant="yellow" icon="whatsapp">
        {t.send}
      </Btn>
    </form>
  );
}
