"use client";

import { useLanguage } from "@/components/language-provider";
import { languages } from "@/lib/i18n";

export function LanguagePicker() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <label className="language-control">
      <span className="sr-only">{t("chooseLanguage")}</span>
      <select value={language} onChange={(event) => setLanguage(event.target.value)} aria-label={t("chooseLanguage")}>
        {languages.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
      </select>
    </label>
  );
}