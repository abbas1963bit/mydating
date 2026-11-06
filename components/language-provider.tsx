"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getTranslation, languages, rtlLanguages, type LanguageCode, type TranslationKey } from "@/lib/i18n";

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
    const browserLocale = new Intl.Locale(navigator.language);
    const browserLanguage = browserLocale.language.toLowerCase();
    const browserCode = browserLanguage === "zh"
      ? browserLocale.script === "Hant" || ["TW", "HK", "MO"].includes(browserLocale.region ?? "") ? "zh-TW" : "zh-CN"
      : browserLanguage === "pt" && browserLocale.region === "BR" ? "pt-BR"
      : browserLanguage === "nb" ? "no"
      : browserLanguage === "tl" ? "fil"
      : browserLanguage === "iw" ? "he"
      : browserLocale.toString();
    const detected = languages.find(([code]) => code.toLowerCase() === browserCode.toLowerCase())
      ?? languages.find(([code]) => code.toLowerCase() === browserLanguage);
    const initial = languages.some(([code]) => code === saved) ? saved as LanguageCode : detected?.[0] ?? "en";
    setCurrentLanguage(initial);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = rtlLanguages.has(language) ? "rtl" : "ltr";
  }, [language]);

  function setLanguage(value: string) {
    if (!languages.some(([code]) => code === value)) return;
    const next = value as LanguageCode;
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