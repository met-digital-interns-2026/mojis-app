import { getDefaultLocale, getTranslator } from "./i18n-core";

export { SUPPORTED_LOCALES } from "./i18n-core";

export function getTranslations(namespace = "") {
  return getTranslator(namespace, getLocale());
}

export function getLocale() {
  return getDefaultLocale();
}
