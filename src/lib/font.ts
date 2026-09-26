import { Archivo } from "next/font/google";

/** Archivo with its width axis: expanded for display, normal for reading, condensed for labels. */
export const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});
