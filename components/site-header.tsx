"use client";

import Link from "next/link";
import { Compass, Heart, Menu, ShieldCheck } from "lucide-react";
import { LanguagePicker } from "@/components/language-picker";
import { useLanguage } from "@/components/language-provider";

export function SiteHeader() {
  const { t } = useLanguage();
  return (
    <header className="site-header">
      <Link href="/" className="wordmark" aria-label={t("brandHome")}>
        <span className="brand-mark"><Heart size={17} fill="currentColor" strokeWidth={2.2} /></span>
        <span>WeDating</span>
      </Link>
      <nav className="main-nav" aria-label={t("mainNavigation")}>
        <Link href="/discover"><Compass size={16} />{t("navDiscover")}</Link>
        <Link href="/#how-it-works">{t("navHow")}</Link>
        <Link href="/#safety"><ShieldCheck size={16} />{t("navSafety")}</Link>
      </nav>
      <div className="header-actions">
        <LanguagePicker />
        <Link className="text-link" href="/login">{t("signIn")}</Link>
        <Link className="button button-small" href="/sign-up">{t("signUp")} <span aria-hidden="true">↗</span></Link>
      </div>
      <details className="mobile-menu">
        <summary aria-label={t("openMenu")}><Menu size={21} /></summary>
        <nav>
          <Link href="/discover">{t("navDiscover")}</Link>
          <Link href="/#how-it-works">{t("navHow")}</Link>
          <Link href="/#safety">{t("navSafety")}</Link>
          <Link href="/login">{t("signIn")}</Link>
          <Link href="/sign-up">{t("signUp")}</Link>
          <LanguagePicker />
        </nav>
      </details>
    </header>
  );
}