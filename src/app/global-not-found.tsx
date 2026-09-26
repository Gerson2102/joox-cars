import type { Metadata } from "next";
import Image from "next/image";
import { Btn } from "@/components/site/Btn";
import b from "@/components/site/bands.module.css";
import { archivo } from "@/lib/font";
import { getDictionary } from "./[lang]/dictionaries";
import "./[lang]/site.css";
import styles from "./global-not-found.module.css";

export const metadata: Metadata = { title: "404 · JOOX CARS" };

/** Any URL the site doesn't have: one black band, Spanish first and English below, with the way home in each. */
export default async function GlobalNotFound() {
  const [es, en] = await Promise.all([getDictionary("es"), getDictionary("en")]);
  return (
    <html lang="es" className={archivo.variable}>
      <body>
        <main className={`${b.band} ${b.black} ${styles.page}`}>
          <div className={b.inner}>
            <Image src="/brand/joox-cars-mark-reversed.webp" alt="JOOX CARS" width={589} height={240} sizes="120px" className={styles.mark} />
            <div className={b.head}>
              <h1 className={`display ${b.title}`}>{es.notFound.title}</h1>
              <p className={b.lead}>{es.notFound.lead}</p>
              <p className={b.lead} lang="en">
                {en.notFound.title}. {en.notFound.lead}
              </p>
            </div>
            <div className={styles.actions}>
              <Btn variant="yellow" href="/es">
                {es.notFound.home}
              </Btn>
              <span lang="en">
                <Btn variant="ghostLight" href="/en">
                  {en.notFound.home}
                </Btn>
              </span>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
