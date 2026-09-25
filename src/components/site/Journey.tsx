"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import b from "./bands.module.css";

type Step = { title: string; body: string };

const FIRST = 500; // ms before the first step lights
const STEP = 1100; // ms from one step to the next
const HOLD = 2400; // ms the finished road holds before it empties
const REST = 900; // ms the empty road waits before the next run

/**
 * The import journey. On its own, in a loop while it is on screen: the road
 * fills from step to step, each number lights as the fill reaches it, the
 * finished road holds, empties, and runs again. Before the script runs, and
 * under reduced motion, the road is full and every number lit.
 */
export function Journey({ steps }: { steps: Step[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const [at, setAt] = useState<number | null>(null); // null: finished state, no loop
  const n = steps.length;

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    let i = -1;
    const next = () => {
      if (i < n - 1) {
        i += 1;
        setAt(i);
        timer = window.setTimeout(next, i === n - 1 ? HOLD : STEP);
      } else {
        i = -1;
        setAt(-1);
        timer = window.setTimeout(next, REST);
      }
    };
    const io = new IntersectionObserver(
      ([e]) => {
        window.clearTimeout(timer);
        if (e.isIntersecting) {
          i = -1;
          setAt(-1);
          timer = window.setTimeout(next, FIRST);
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, [n]);

  const progress = at === null ? 1 : Math.max(0, at) / (n - 1);

  return (
    <ol ref={ref} className={b.journey} data-running={at !== null || undefined} style={{ ["--progress" as string]: progress } as CSSProperties}>
      <li className={b.road} aria-hidden="true">
        <span className={b.roadFill} />
      </li>
      {steps.map((step, k) => (
        <li key={step.title} className={b.step} data-lit={at === null || k <= at || undefined} data-current={k === at || undefined}>
          <span className={b.stepNum} aria-hidden="true">
            {k + 1}
          </span>
          <h3 className={b.stepTitle}>{step.title}</h3>
          <p className={b.stepBody}>{step.body}</p>
        </li>
      ))}
    </ol>
  );
}
