"use client";

import {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
} from "react";
import { dictionaries, defaultLocale } from "./locales";
import type { Locale, Translations } from "./locales";

const STORAGE_KEY = "apres-ski-locale";

// --- external store (mirrors UserProvider pattern) ---
let listeners: (() => void)[] = [];
let cachedLocale: Locale | undefined;

function subscribe(onStoreChange: () => void) {
  listeners.push(onStoreChange);
  return () => {
    listeners = listeners.filter((l) => l !== onStoreChange);
  };
}

function getStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "fr" || stored === "en") return stored;
  } catch {}
  return defaultLocale;
}

function getSnapshot(): Locale {
  if (cachedLocale === undefined) {
    cachedLocale = getStoredLocale();
  }
  return cachedLocale;
}

function getServerSnapshot(): Locale {
  return defaultLocale;
}

function notifyListeners() {
  cachedLocale = getStoredLocale();
  for (const listener of listeners) {
    listener();
  }
}

// --- context ---
interface LocaleContextValue {
  locale: Locale;
  t: Translations;
  setLocale: (l: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: defaultLocale,
  t: dictionaries[defaultLocale],
  setLocale: () => {},
});

export function useLocale() {
  return useContext(LocaleContext);
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setLocale = useCallback((l: Locale) => {
    localStorage.setItem(STORAGE_KEY, l);
    notifyListeners();
  }, []);

  const t = dictionaries[locale];

  return (
    <LocaleContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}
