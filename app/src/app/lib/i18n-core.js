import en from "../../messages/en.json";
import es from "../../messages/es.json";

export const DEFAULT_LOCALE = "en";

const CATALOGS = { en, es };
const translatorCache = new Map();

export const SUPPORTED_LOCALES = Object.freeze(Object.keys(CATALOGS));

function getPath(obj, path) {
  return path.split(".").reduce((o, k) => (o != null ? o[k] : undefined), obj);
}

function interpolate(template, vars) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in vars ? String(vars[key]) : `{${key}}`
  );
}

export function normalizeLocale(locale) {
  if (!locale) return DEFAULT_LOCALE;

  const normalized = String(locale).toLowerCase();
  if (CATALOGS[normalized]) return normalized;

  const language = normalized.split("-")[0];
  return CATALOGS[language] ? language : DEFAULT_LOCALE;
}

export function getDefaultLocale() {
  return normalizeLocale(process.env.NEXT_PUBLIC_LOCALE);
}

function getMessages(locale) {
  return CATALOGS[normalizeLocale(locale)];
}

export function getTranslator(namespace = "", locale = getDefaultLocale()) {
  const cacheKey = `${locale}:${namespace}`;
  let t = translatorCache.get(cacheKey);
  if (!t) {
    t = function t(key, vars) {
      const fullKey = namespace ? `${namespace}.${key}` : key;
      const value = getPath(getMessages(locale), fullKey);
      const fallbackValue = getPath(getMessages(DEFAULT_LOCALE), fullKey);
      if (typeof value !== "string") {
        if (process.env.NODE_ENV !== "production") {
          console.warn(`[i18n] missing key: ${locale}.${fullKey}`);
        }
        return typeof fallbackValue === "string"
          ? interpolate(fallbackValue, vars)
          : fullKey;
      }
      return interpolate(value, vars);
    };
    translatorCache.set(cacheKey, t);
  }
  return t;
}
