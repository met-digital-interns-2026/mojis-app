"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  getDefaultLocale,
  getTranslator,
  normalizeLocale,
  SUPPORTED_LOCALES,
} from "./i18n-core";

const LOCALE_STORAGE_KEY = "moji.locale";
const LOCALE_CHANGE_EVENT = "moji:localechange";

export { SUPPORTED_LOCALES };

function readStoredLocale() {
  if (typeof window === "undefined") return getDefaultLocale();

  try {
    return normalizeLocale(window.localStorage.getItem(LOCALE_STORAGE_KEY));
  } catch {
    return getDefaultLocale();
  }
}

function subscribeLocale(callback) {
  if (typeof window === "undefined") return () => {};

  function handleStorage(event) {
    if (event.key === LOCALE_STORAGE_KEY) callback();
  }

  window.addEventListener(LOCALE_CHANGE_EVENT, callback);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(LOCALE_CHANGE_EVENT, callback);
    window.removeEventListener("storage", handleStorage);
  };
}

// Mirrors next-intl's `useTranslations` API so swapping libraries later is
// just a change of import path. Returns a cached function per locale and
// namespace so it has a stable identity until the selected language changes.
export function getTranslations(namespace = "") {
  return getTranslator(namespace, getLocale());
}

export function useTranslations(namespace = "") {
  const locale = useLocale();
  return getTranslator(namespace, locale);
}

export function getLocale() {
  return readStoredLocale();
}

export function useLocale() {
  const locale = useSyncExternalStore(subscribeLocale, readStoredLocale, getDefaultLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return locale;
}

export function setLocale(locale) {
  const nextLocale = normalizeLocale(locale);

  if (typeof window === "undefined") return nextLocale;

  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
  } catch {
    // Ignore storage failures; the in-memory notification still updates this tab.
  }

  document.documentElement.lang = nextLocale;
  window.dispatchEvent(new Event(LOCALE_CHANGE_EVENT));

  return nextLocale;
}
