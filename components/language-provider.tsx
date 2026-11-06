"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getTranslation, resolveLanguage, rtlLanguages, type LanguageCode, type TranslationKey } from "@/lib/i18n";
import { getPageTranslation, type PageTranslationKey } from "@/lib/i18n-pages";

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (language: string) => void;
  t: (key: TranslationKey) => string;
  pageT: (key: PageTranslationKey, variables?: Record<string, string>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const storageKey = "wedating-language";

export function LanguageProvider({ children, initialLanguage }: Readonly<{ children: React.ReactNode; initialLanguage: LanguageCode }>) {
  const [language, setCurrentLanguage] = useState<LanguageCode>(initialLanguage);
  const pathname = usePathname();

  useEffect(() => {
    const cookieValue = document.cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${storageKey}=`))?.split("=").slice(1).join("=");
    const cookieLanguage = resolveLanguage(cookieValue ? decodeURIComponent(cookieValue) : null);
    const savedLanguage = resolveLanguage(window.localStorage.getItem(storageKey));
    const next = cookieLanguage ?? savedLanguage ?? resolveLanguage(navigator.language) ?? initialLanguage;
    setCurrentLanguage(next);
    window.localStorage.setItem(storageKey, next);
    if (!cookieLanguage) document.cookie = `${storageKey}=${encodeURIComponent(next)}; Path=/; Max-Age=31536000; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
  }, [initialLanguage]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = rtlLanguages.has(language) ? "rtl" : "ltr";
  }, [language]);

  useEffect(() => {
    const { t, pageT } = { t: (key: TranslationKey) => getTranslation(language, key), pageT: (key: PageTranslationKey) => getPageTranslation(language, key) };
    const title = pathname === "/" ? t("heroTitle")
      : pathname === "/login" ? t("signIn")
      : pathname === "/sign-up" ? t("createAccount")
      : pathname === "/forgot-password" ? t("forgotPassword")
      : pathname === "/reset-password" ? pageT("saveNewPassword")
      : pathname.startsWith("/discover") ? pageT("discoverTitle")
      : pathname.startsWith("/likes") ? pageT("likesTitle")
      : pathname.startsWith("/messages") ? pageT("messagesTitle")
      : pathname.startsWith("/visitors") ? pageT("visitorsTitle")
      : pathname.startsWith("/notifications") ? pageT("notificationsTitle")
      : pathname.startsWith("/profile/edit") ? pageT("editProfileTitle")
      : pathname.startsWith("/profile") ? pageT("myProfile")
      : pathname.startsWith("/settings") ? pageT("settingsTitle")
      : pathname.startsWith("/admin") ? pageT("adminTitle")
      : pathname.startsWith("/terms") ? pageT("legalTerms")
      : pathname.startsWith("/privacy") ? pageT("legalPrivacy")
      : pathname.startsWith("/community-guidelines") ? pageT("legalCommunity")
      : pathname === "/not-found" ? pageT("notFoundTitle")
      : "WeDating";
    document.title = `${title} | WeDating`;
  }, [language, pathname]);

  function setLanguage(value: string) {
    const next = resolveLanguage(value);
    if (!next) return;
    window.localStorage.setItem(storageKey, next);
    document.cookie = `${storageKey}=${encodeURIComponent(next)}; Path=/; Max-Age=31536000; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
    setCurrentLanguage(next);
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: (key) => getTranslation(language, key), pageT: (key, variables) => getPageTranslation(language, key, variables) }}>
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

export function LocalizedPageText({ translationKey, variables }: Readonly<{ translationKey: PageTranslationKey; variables?: Record<string, string> }>) {
  return useLanguage().pageT(translationKey, variables);
}

export function LocalizedDate({ value, withTime = false }: Readonly<{ value: string; withTime?: boolean }>) {
  const { language } = useLanguage();
  const date = new Date(value);
  return withTime
    ? new Intl.DateTimeFormat(language, { dateStyle: "medium", timeStyle: "short" }).format(date)
    : new Intl.DateTimeFormat(language, { dateStyle: "medium" }).format(date);
}

export function LocalizedVisitDate({ value }: Readonly<{ value: string }>) {
  const { language, pageT } = useLanguage();
  const date = new Intl.DateTimeFormat(language, { dateStyle: "medium" }).format(new Date(value));
  return pageT("visited", { date });
}

export function LocalizedDatePhrase({ translationKey, value }: Readonly<{ translationKey: "visited" | "blockedOn"; value: string }>) {
  const { language, pageT } = useLanguage();
  const date = new Intl.DateTimeFormat(language, { dateStyle: "medium" }).format(new Date(value));
  return pageT(translationKey, { date });
}

export function LocalizedInput({ translationKey, ariaTranslationKey, ...props }: InputHTMLAttributes<HTMLInputElement> & Readonly<{ translationKey?: PageTranslationKey; ariaTranslationKey?: PageTranslationKey }>) {
  const { pageT } = useLanguage();
  return <input {...props} placeholder={translationKey ? pageT(translationKey) : props.placeholder} aria-label={ariaTranslationKey ? pageT(ariaTranslationKey) : props["aria-label"]} />;
}

export function LocalizedTextarea({ translationKey, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & Readonly<{ translationKey: PageTranslationKey }>) {
  const { pageT } = useLanguage();
  return <textarea {...props} placeholder={pageT(translationKey)} />;
}

const profileEnumKeys = {
  gender: { Woman: "woman", Man: "man", "Non-binary": "nonBinary", Other: "other" },
  relationship: { Single: "single", Divorced: "divorced", Widowed: "widowed", Separated: "separated" },
} as const;

export function LocalizedProfileEnum({ value, kind }: Readonly<{ value: string | null | undefined; kind: keyof typeof profileEnumKeys }>) {
  const { pageT } = useLanguage();
  if (!value) return pageT("notShared");
  const key = profileEnumKeys[kind][value as keyof (typeof profileEnumKeys)[typeof kind]];
  return key ? pageT(key) : value;
}

export function LocalizedVisibility({ value }: Readonly<{ value: "public" | "members" | "private" }>) {
  const { pageT } = useLanguage();
  const key = value === "public" ? "public" : value === "private" ? "onlyMe" : "membersOnly";
  return pageT(key);
}

export function LocalizedIconButton({ translationKey, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & Readonly<{ translationKey: PageTranslationKey }>) {
  const { pageT } = useLanguage();
  const label = pageT(translationKey);
  return <button {...props} aria-label={label} title={label}>{children}</button>;
}

export function LocalizedIconLink({ href, translationKey, children, ...props }: React.ComponentProps<typeof Link> & Readonly<{ translationKey: PageTranslationKey }>) {
  const { pageT } = useLanguage();
  const label = pageT(translationKey);
  return <Link {...props} href={href} aria-label={label} title={label}>{children}</Link>;
}

export function LocalizedNav({ translationKey, children, ...props }: React.ComponentProps<"nav"> & Readonly<{ translationKey: PageTranslationKey }>) {
  const { pageT } = useLanguage();
  return <nav {...props} aria-label={pageT(translationKey)}>{children}</nav>;
}

export function LocalizedUnreadIndicator() {
  const { pageT } = useLanguage();
  return <i aria-label={pageT("unreadMessages")} />;
}