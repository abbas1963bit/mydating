import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowUpRight, LockKeyhole, Mail, Shield, UserRound } from "lucide-react";
import { changeEmail, updatePassword } from "@/app/actions/auth";
import { deactivateAccount, deleteAccount } from "@/app/actions/members";
import { createClient } from "@/lib/supabase/server";
import { LocalizedPageText, LocalizedText, LocalizedVisibility } from "@/components/language-provider";

export const metadata: Metadata = { title: "Account settings" };

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ error?: string; email?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("display_name,visibility,show_age,show_city").eq("id", user.id).maybeSingle();
  const errorKeys: Record<string, "setupError" | "confirmError" | "deleteError" | "emailError"> = { setup: "setupError", confirm: "confirmError", delete: "deleteError", email: "emailError" };

  return (
    <>
      <div className="page-heading"><div><span className="eyebrow-small"><LocalizedPageText translationKey="settingsEyebrow" /></span><h1><LocalizedPageText translationKey="settingsTitle" /></h1><p><LocalizedPageText translationKey="settingsIntro" /></p></div></div>
      {params.error && <p className="form-error" role="alert"><LocalizedText translationKey={errorKeys[params.error] ?? "genericError"} /></p>}
      {params.email === "sent" && <p className="form-success" role="status"><LocalizedPageText translationKey="emailVerificationSent" /></p>}
      <div className="settings-layout">
        <div className="settings-main">
          <section className="panel settings-section"><div className="settings-title"><span><Mail size={18} /></span><div><h2><LocalizedPageText translationKey="emailAddress" /></h2><p><LocalizedPageText translationKey="emailUpdate" /> <LocalizedPageText translationKey="verificationRequired" /></p></div></div><div className="settings-current"><LocalizedPageText translationKey="currentAddress" /> <strong>{user.email}</strong></div><form className="inline-settings-form" action={changeEmail}><div className="form-field"><label htmlFor="new-email"><LocalizedPageText translationKey="newEmailAddress" /></label><input id="new-email" name="email" type="email" autoComplete="email" required /></div><button className="button button-outline" type="submit"><LocalizedPageText translationKey="changeEmail" /></button></form></section>
          <section className="panel settings-section"><div className="settings-title"><span><LockKeyhole size={18} /></span><div><h2><LocalizedPageText translationKey="passwordSettings" /></h2><p><LocalizedPageText translationKey="passwordHint" /></p></div></div><form className="inline-settings-form" action={updatePassword}><div className="form-field"><label htmlFor="new-password"><LocalizedPageText translationKey="newPassword" /></label><input id="new-password" name="password" type="password" autoComplete="new-password" minLength={10} maxLength={72} required /></div><button className="button button-outline" type="submit"><LocalizedPageText translationKey="updatePassword" /></button></form></section>
          <section className="panel settings-section"><div className="settings-title"><span><Shield size={18} /></span><div><h2><LocalizedPageText translationKey="privacy" /></h2><p><LocalizedPageText translationKey="visibilityCurrentPrefix" /> <LocalizedVisibility value={profile?.visibility ?? "members"} />.</p></div></div><div className="settings-link-row"><span><LocalizedPageText translationKey="privacyDescription" /></span><Link href="/profile/edit"><LocalizedPageText translationKey="privacySettings" /> <ArrowUpRight size={14} /></Link></div></section>
          <section className="panel settings-section"><div className="settings-title"><span><UserRound size={18} /></span><div><h2><LocalizedPageText translationKey="blockedAccounts" /></h2><p><LocalizedPageText translationKey="blockedDescription" /></p></div></div><div className="settings-link-row"><span><LocalizedPageText translationKey="blockedExplanation" /></span><Link href="/settings/blocked"><LocalizedPageText translationKey="manageBlocked" /> <ArrowUpRight size={14} /></Link></div></section>
          <section className="panel settings-section danger-zone"><div className="settings-title"><span><AlertTriangle size={18} /></span><div><h2><LocalizedPageText translationKey="deactivateTitle" /></h2><p><LocalizedPageText translationKey="deactivateDescription" /></p></div></div><form action={deactivateAccount} className="danger-action"><label className="consent-row"><input type="checkbox" name="confirm" required /><LocalizedPageText translationKey="deactivateConfirm" /></label><button className="button button-outline" type="submit"><LocalizedPageText translationKey="deactivateButton" /></button></form><hr /><div className="settings-title"><span><AlertTriangle size={18} /></span><div><h2><LocalizedPageText translationKey="deleteAccount" /></h2><p><LocalizedPageText translationKey="deleteDescription" /></p></div></div><form action={deleteAccount} className="danger-action"><label className="consent-row"><input type="checkbox" name="confirm" required /><LocalizedPageText translationKey="deleteConfirm" /></label><button className="button button-delete" type="submit"><LocalizedPageText translationKey="deleteButton" /></button></form></section>
        </div>
        <aside className="settings-aside"><strong>{profile?.display_name ?? ""}</strong><p><LocalizedPageText translationKey="settingsAside" /></p><Link href="/profile/edit" className="button button-outline"><LocalizedPageText translationKey="editProfile" /></Link><Link href="/privacy" className="legal-side-link"><LocalizedPageText translationKey="readPrivacy" /></Link></aside>
      </div>
    </>
  );
}