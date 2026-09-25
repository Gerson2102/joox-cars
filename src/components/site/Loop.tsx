"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./bands.module.css";

// The logo's OO as one figure-eight (a Gerono lemniscate, fitted to cubics).
const LOOP =
  "M380 100C380 113 378 127 374 138C370 148 364 159 356 165C348 171 338 175 327 175C316 175 303 171 290 165C277 159 262 148 247 138C232 127 216 113 200 100C184 88 168 73 153 63C138 52 123 41 110 35C97 29 84 25 73 25C62 25 52 29 44 35C36 41 30 52 26 62C22 73 20 87 20 100C20 112 22 127 26 138C30 148 36 159 44 165C52 171 62 175 73 175C84 175 97 171 110 165C123 159 138 148 153 137C168 127 184 113 200 100C216 88 232 73 247 63C262 52 277 41 290 35C303 29 316 25 327 25C338 25 348 29 356 35C364 41 370 52 374 62C378 73 380 87 380 100Z";

/**
 * The signature: the infinity loop draws itself once when it comes into view,
 * then a small mark travels it without end (driven by eternal purpose).
 * Reduced motion (CSS): drawn at once, no mark.
 */
export function Loop() {
  const ref = useRef<SVGSVGElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setDrawn(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <svg ref={ref} className={styles.loop} viewBox="0 0 400 200" data-drawn={drawn || undefined} aria-hidden="true" focusable="false">
      <path id="joox-loop" d={LOOP} pathLength={1} className={styles.loopPath} />
      {drawn ? (
        <circle r="9" className={styles.loopMark}>
          <animateMotion dur="9s" begin="1.6s" repeatCount="indefinite" rotate="auto">
            <mpath href="#joox-loop" />
          </animateMotion>
        </circle>
      ) : null}
    </svg>
  );
}
