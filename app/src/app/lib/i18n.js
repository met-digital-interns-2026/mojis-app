import messages from "../../messages/en.json";

const DEFAULT_LOCALE = "en";

function getPath(obj, path) {
  return path.split(".").reduce((o, k) => (o != null ? o[k] : undefined), obj);
}

function interpolate(template, vars) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in vars ? String(vars[key]) : `{${key}}`
  );
}

// Mirrors next-intl's `useTranslations` API so swapping libraries later is
// just a change of import path. Works in both server and client components
// because there's only one locale today — no context needed. Returns a
// cached function per namespace so it has a stable identity across renders
// (safe to include in useEffect/useCallback deps).
const translatorCache = new Map();

export function useTranslations(namespace = "") {
  let t = translatorCache.get(namespace);
  if (!t) {
    t = function t(key, vars) {
      const fullKey = namespace ? `${namespace}.${key}` : key;
      const value = getPath(messages, fullKey);
      if (typeof value !== "string") {
        if (process.env.NODE_ENV !== "production") {
          console.warn(`[i18n] missing key: ${fullKey}`);
        }
        return fullKey;
      }
      return interpolate(value, vars);
    };
    translatorCache.set(namespace, t);
  }
  return t;
}

export function getLocale() {
  return DEFAULT_LOCALE;
}
