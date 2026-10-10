"use client";

import type { ComponentProps } from "react";
import { useSelectedLayoutSegment } from "next/navigation";
import { otherLocale, type Locale } from "@/app/[lang]/dictionaries";
import { pagePath, serviceOf } from "@/lib/sections";

/** The service whose page is open, read from the address below the language (none on the homepage). */
export function useService(lang: Locale) {
  const slug = useSelectedLayoutSegment();
  return slug ? serviceOf(lang, slug) : undefined;
}

/** The section being read: the last one whose top has passed 40% down the screen (as the header's scroll spy). */
function sectionInView() {
  const line = window.innerHeight * 0.4;
  let id = "";
  for (const s of document.querySelectorAll<HTMLElement>("main section[id]")) if (s.getBoundingClientRect().top <= line) id = s.id;
  return id;
}

/** The same page in the other language, opened at the section being read, so switching keeps your place. */
export function LangLink({ to, onClick, ...props }: { to: Locale } & Omit<ComponentProps<"a">, "href" | "hrefLang">) {
  const service = useService(otherLocale(to));
  return (
    <a
      {...props}
      href={pagePath(to, service)}
      hrefLang={to}
      onClick={(e) => {
        e.currentTarget.hash = sectionInView();
        onClick?.(e);
      }}
    />
  );
}
