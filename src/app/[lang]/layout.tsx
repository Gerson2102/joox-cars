import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/lib/contact";
import { archivo } from "@/lib/font";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ScrollFX } from "@/components/site/ScrollFX";
import { getDictionary, hasLocale, locales } from "./dictionaries";
import "./site.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

// Each page sets its own title, description, alternates and preview (./metadata.ts).
export const metadata: Metadata = { metadataBase: new URL(SITE_URL) };

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

const boot = `document.documentElement.classList.add('js')`;

/** Every page: the header, the page's own bands, and the footer. */
export default async function SiteLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = await getDictionary(lang);
  return (
    <html lang={lang} className={archivo.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>
        <SiteHeader t={t.nav} lang={lang} whatsappText={t.whatsapp.general} tagline={t.about.tagline} />
        <ScrollFX />
        {children}
        <SiteFooter t={t} lang={lang} />
      </body>
    </html>
  );
}
