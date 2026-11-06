"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { LanguagePicker } from "@/components/language-picker";

export function AuthLayout({ title, description, children }: Readonly<{ title: string; description: string; children: React.ReactNode }>) {
  return (
    <main className="auth-shell">
      <aside className="auth-aside">
        <Link href="/" className="wordmark"><span className="brand-mark"><Heart size={17} fill="currentColor" /></span><span>WeDating</span></Link>
        <div className="auth-aside-copy"><h1>{title}</h1><p>{description}</p></div>
        <div className="auth-aside-footer">WeDating <span aria-hidden="true">·</span> <LanguagePicker /></div>
      </aside>
      <section className="auth-form-wrap">{children}</section>
    </main>
  );
}

const errorKeys: Record<string, "setupError" | "invalidError" | "credentialsError" | "googleError" | "genericError" | "accountDisabled"> = {
  setup: "setupError",
  invalid: "invalidError",
  "password-mismatch": "invalidError",
  credentials: "credentialsError",
  google: "googleError",
  confirmation: "genericError",
  session: "genericError",
  send: "genericError",
  save: "genericError",
  password: "invalidError",
  signup: "genericError",
  account: "accountDisabled",
};

export function AuthFeedback({ error, sent, updated }: Readonly<{ error?: string; sent?: boolean; updated?: boolean }>) {
  const { t } = useLanguage();
  return <>
    {error && <p className="form-error" role="alert">{t(errorKeys[error] ?? "genericError")}</p>}
    {sent && <p className="form-success" role="status">{t("checkEmail")} · {t("verificationNotice")}</p>}
    {updated && <p className="form-success" role="status">{t("accountUpdated")}</p>}
  </>;
}