"use client";

import { useEffect, useRef, useState } from "react";

type FilmStatus = "poster" | "loading" | "playing" | "paused" | "off";

type FilmOptions = {
  /** Start the film here (seconds), so it continues from the poster frame. */
  startAt?: number;
  /** A separately composed film for small or portrait screens (no extension). */
  phone?: { query: string; base: string };
};

/** A composed phone film where one exists; otherwise the 1280-wide encode up to
 * 900px and 1080p above. AV1 first; browsers that cannot decode it take H.264. */
function sourcesFor(base: string, phone?: FilmOptions["phone"]) {
  let path = base;
  if (phone && window.matchMedia(phone.query).matches) path = phone.base;
  else if (window.matchMedia("(max-width: 900px)").matches) path = `${base}-720`;
  return [
    { src: `${path}.av1.mp4`, type: 'video/mp4; codecs="av01.0.08M.08"' },
    { src: `${path}.mp4`, type: "video/mp4" },
  ];
}

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

/** Poster first; the film only loads after the page has, and never for reduced
 * motion, Save-Data, 2G or 3G. Pauses itself offscreen.
 * `base` is the file path without extension ("/media/v2/film"). */
export function useFilm(base: string, { startAt = 0, phone }: FilmOptions = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<FilmStatus>("poster");

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    const slow = !!conn && (conn.saveData === true || /(^|-)2g$|^3g$/.test(conn.effectiveType ?? ""));
    if (reduce || slow) {
      // The poster stays.
      const id = requestAnimationFrame(() => setStatus("off"));
      return () => cancelAnimationFrame(id);
    }

    let cancelled = false;
    let idleId = 0;
    let fallbackId = 0;
    const onPlaying = () => setStatus("playing");
    const onPause = () => setStatus((s) => (s === "off" ? s : "paused"));
    v.addEventListener("playing", onPlaying);
    v.addEventListener("pause", onPause);

    const start = () => {
      if (cancelled || v.childElementCount) return;
      setStatus("loading");
      for (const s of sourcesFor(base, phone)) {
        const el = document.createElement("source");
        el.src = s.src;
        el.type = s.type;
        v.appendChild(el);
      }
      if (startAt) v.addEventListener("loadedmetadata", () => (v.currentTime = startAt), { once: true });
      v.load();
      v.play().catch(() => setStatus("paused"));
    };
    const kick = () => {
      if (typeof window.requestIdleCallback === "function") idleId = window.requestIdleCallback(start, { timeout: 1500 });
      else idleId = globalThis.setTimeout(start, 250) as unknown as number;
    };
    if (document.readyState === "complete") kick();
    else {
      window.addEventListener("load", kick, { once: true });
      // Some browsers hold the load event for lazy images; never let that hold the film.
      fallbackId = window.setTimeout(kick, 3000);
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!v.childElementCount) return;
        if (!entry.isIntersecting) v.pause();
        else v.play().catch(() => {});
      },
      { threshold: 0 },
    );
    io.observe(v);

    return () => {
      cancelled = true;
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleId);
      globalThis.clearTimeout(idleId);
      window.clearTimeout(fallbackId);
      window.removeEventListener("load", kick);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("pause", onPause);
      io.disconnect();
    };
    // The sources never change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { videoRef, status };
}
