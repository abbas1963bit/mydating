import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowUpRight, LockKeyhole, Mail, Shield, UserRound } from "lucide-react";
import { changeEmail, updatePassword } from "@/app/actions/auth";
import { deactivateAccount, deleteAccount } from "@/app/actions/members";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Account settings" };

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ error?: string; email?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("display_name,visibility,show_age,show_city").eq("id", user.id).maybeSingle();
  const errors: Record<string, string> = { setup: "Account services are not configured.", confirm: "Confirm the action before continuing.", delete: "The account could not be deleted. Please contact support." };

  return (
    <>
      <div className="page-heading"><div><span className="eyebrow-small">Your account, your choices</span><h1>Settings</h1><p>Manage your sign-in, privacy, and account status.</p></div></div>
      {params.error && <p className="form-error" role="alert">{errors[params.error] ?? "Check the details and try again."}</p>}
      {params.email === "sent" && <p className="form-success" role="status">A verification link was sent to your new email address.</p>}
      <div className="settings-layout">
        <div className="settings-main">
          <section className="panel settings-section"><div className="settings-title"><span><Mail size={18} /></span><div><h2>Email address</h2><p>Update the address used to sign in. A verification email is required.</p></div></div><div className="settings-current">Current address <strong>{user.email}</strong></div><form className="inline-settings-form" action={changeEmail}><div className="form-field"><label htmlFor="new-email">New email address</label><input id="new-email" name="email" type="email" autoComplete="email" required /></div><button className="button button-outline" type="submit">Change email</button></form></section>
          <section className="panel settings-section"><div className="settings-title"><span><LockKeyhole size={18} /></span><div><h2>Password</h2><p>Choose a password with at least 10 characters.</p></div></div><form className="inline-settings-form" action={updatePassword}><div className="form-field"><label htmlFor="new-password">New password</label><input id="new-password" name="password" type="password" autoComplete="new-password" minLength={10} maxLength={72} required /></div><button className="button button-outline" type="submit">Update password</button></form></section>
          <section className="panel settings-section"><div className="settings-title"><span><Shield size={18} /></span><div><h2>Privacy</h2><p>Your current profile visibility is <strong>{profile?.visibility ?? "members"}</strong>.</p></div></div><div className="settings-link-row"><span>Control which details and photos appear to other members.</span><Link href="/profile/edit">Privacy settings <ArrowUpRight size={14} /></Link></div></section>
          <section className="panel settings-section"><div className="settings-title"><span><UserRound size={18} /></span><div><h2>Blocked accounts</h2><p>Review and unblock accounts you no longer want to hide.</p></div></div><div className="settings-link-row"><span>Blocked accounts cannot view your profile or message you.</span><Link href="/settings/blocked">Manage blocked accounts <ArrowUpRight size={14} /></Link></div></section>
          <section className="panel settings-section danger-zone"><div className="settings-title"><span><AlertTriangle size={18} /></span><div><h2>Deactivate account</h2><p>Hide your profile and sign out. You can contact support to restore access.</p></div></div><form action={deactivateAccount} className="danger-action"><label className="consent-row"><input type="checkbox" name="confirm" required />I understand that my profile will no longer be visible.</label><button className="button button-outline" type="submit">Temporarily deactivate</button></form><hr /><div className="settings-title"><span><AlertTriangle size={18} /></span><div><h2>Delete account</h2><p>Permanently erase your account, profile, photos, and related activity.</p></div></div><form action={deleteAccount} className="danger-action"><label className="consent-row"><input type="checkbox" name="confirm" required />I understand that this cannot be undone.</label><button className="button button-delete" type="submit">Delete my account</button></form></section>
        </div>
        <aside className="settings-aside"><strong>{profile?.display_name ?? "Your profile"}</strong><p>Good privacy settings should feel like your own. Review your profile details before making them visible.</p><Link href="/profile/edit" className="button button-outline">Edit profile</Link><Link href="/privacy" className="legal-side-link">Read our Privacy Policy</Link></aside>
      </div>
    </>
  );
}