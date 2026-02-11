export { default as fr } from "./fr";
export { default as en } from "./en";
export type { Translations } from "./fr";

export type Locale = "fr" | "en";
export const defaultLocale: Locale = "fr";

import frDict from "./fr";
import enDict from "./en";

export const dictionaries: Record<Locale, typeof frDict> = {
  fr: frDict,
  en: enDict,
};
