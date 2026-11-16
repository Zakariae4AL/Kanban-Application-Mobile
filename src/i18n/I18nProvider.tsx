import { getLocales } from 'expo-localization';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Locale } from '../api/types';
import { LOCALE_KEY, storage } from '../storage';
import { messages, type MessageKey } from './messages';

export const LOCALES: Locale[] = ['en', 'fr'];

type I18n = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18n | null>(null);

const deviceLocale = (): Locale => (getLocales()[0]?.languageCode === 'fr' ? 'fr' : 'en');

export function I18nProvider({ children, initial }: { children: ReactNode; initial?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initial ?? deviceLocale());

  // Restore the language chosen in the settings.
  useEffect(() => {
    if (initial) return;
    void storage.get(LOCALE_KEY).then((saved) => {
      if (saved === 'en' || saved === 'fr') setLocaleState(saved);
    });
  }, [initial]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    void storage.set(LOCALE_KEY, next);
  }, []);

  const t = useCallback<I18n['t']>(
    (key, params = {}) =>
      messages[locale][key].replace(/\{(\w+)\}/g, (_, name: string) => String(params[name] ?? `{${name}}`)),
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside <I18nProvider>');
  return context;
}
