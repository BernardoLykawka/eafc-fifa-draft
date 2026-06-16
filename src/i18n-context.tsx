import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LOCALE, t, type Locale, type TranslationKey } from './i18n';

const LOCALE_STORAGE_KEY = 'eafc-draft-locale';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const getInitialLocale = (): Locale => {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  const savedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return savedLocale === 'en' || savedLocale === 'pt-BR'
    ? savedLocale
    : DEFAULT_LOCALE;
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [locale, setLocale] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key) => t(locale, key),
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used inside I18nProvider');
  }

  return context;
};
