"use client";

import { useEffect } from "react";

/**
 * Marks [data-reveal] elements with data-in as they enter the view, once.
 * The CSS hides unrevealed elements only while <html data-fx="on">, which is
 * set here: if this never runs, nothing is ever hidden. Reduced motion: all in at once.
 */
export function ScrollFX() {
  useEffect(() => {
    const root = document.documentElement;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.setAttribute("data-in", ""));
      return;
    }
    // Anything already on screen (a reload mid-page) shows without replaying.
    const vh = window.innerHeight;
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.9 && r.bottom > 0) el.setAttribute("data-in", "");
    });
    root.dataset.fx = "on";
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute("data-in", "");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    els.forEach((el) => !el.hasAttribute("data-in") && io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
