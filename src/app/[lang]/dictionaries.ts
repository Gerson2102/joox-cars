import type es from "@messages/es.json";

const dictionaries = {
  es: () => import("@messages/es.json").then((m) => m.default),
  en: () => import("@messages/en.json").then((m) => m.default),
};

export type Locale = keyof typeof dictionaries;
export type Dictionary = typeof es;
export const locales = Object.keys(dictionaries) as Locale[];

export const hasLocale = (locale: string): locale is Locale => locale in dictionaries;

export const getDictionary = async (locale: Locale): Promise<Dictionary> => dictionaries[locale]();
