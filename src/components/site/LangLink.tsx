"use client";

import type { ComponentProps } from "react";
import type { Locale } from "@/app/[lang]/dictionaries";

/** The section being read: the last one whose top has passed 40% down the screen (as the header's scroll spy). */
function sectionInView() {
  const line = window.innerHeight * 0.4;
  let id = "";
  for (const s of document.querySelectorAll<HTMLElement>("main section[id]")) if (s.getBoundingClientRect().top <= line) id = s.id;
  return id;
}

/** The page in the other language, opened at the section being read, so switching keeps your place. */
export function LangLink({ to, onClick, ...props }: { to: Locale } & Omit<ComponentProps<"a">, "href" | "hrefLang">) {
  return (
    <a
      {...props}
      href={`/${to}`}
      hrefLang={to}
      onClick={(e) => {
        e.currentTarget.hash = sectionInView();
        onClick?.(e);
      }}
    />
  );
}
