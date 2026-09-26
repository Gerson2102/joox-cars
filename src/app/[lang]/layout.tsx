import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/lib/contact";
import { archivo } from "@/lib/font";
import { getDictionary, hasLocale, locales } from "./dictionaries";
import "./site.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = await getDictionary(lang);
  return {
    metadataBase: new URL(SITE_URL),
    title: t.meta.title,
    description: t.meta.description,
    alternates: { canonical: `/${lang}`, languages: { es: "/es", en: "/en", "x-default": "/" } },
    openGraph: { type: "website", title: t.meta.title, description: t.meta.description },
  };
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

const boot = `document.documentElement.classList.add('js')`;

export default async function SiteLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return (
    <html lang={lang} className={archivo.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
