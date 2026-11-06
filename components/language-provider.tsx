"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getTranslation, resolveLanguage, rtlLanguages, type LanguageCode, type TranslationKey } from "@/lib/i18n";

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (language: string) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const storageKey = "wedating-language";

export function LanguageProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [language, setCurrentLanguage] = useState<LanguageCode>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    const initial = resolveLanguage(saved) ?? resolveLanguage(navigator.language) ?? "en";
    setCurrentLanguage(initial);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = rtlLanguages.has(language) ? "rtl" : "ltr";
  }, [language]);

  function setLanguage(value: string) {
    const next = resolveLanguage(value);
    if (!next) return;
    window.localStorage.setItem(storageKey, next);
    setCurrentLanguage(next);
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: (key) => getTranslation(language, key) }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}

export function LocalizedText({ translationKey }: Readonly<{ translationKey: TranslationKey }>) {
  return useLanguage().t(translationKey);
}