import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Chrome } from "lucide-react";
import { AuthFeedback, AuthLayout } from "@/components/auth-ui";
import { LocalizedText } from "@/components/language-provider";
import { signIn, signInWithGoogle } from "@/app/actions/auth";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; updated?: string }> }) {
  const params = await searchParams;
  return (
    <AuthLayout title="Good to see you again." description="Pick up where your next good conversation left off.">
      <div className="auth-form">
        <Link href="/" className="back-home"><ArrowLeft size={14} /><LocalizedText translationKey="backHome" /></Link>
        <h2><LocalizedText translationKey="signIn" /></h2>
        <p className="auth-subtitle">Welcome back. Your people are right here.</p>
        <AuthFeedback error={params.error} updated={params.updated === "1"} />
        <form action={signIn}>
          <div className="form-field"><label htmlFor="email"><LocalizedText translationKey="email" /></label><input id="email" name="email" type="email" autoComplete="email" maxLength={254} required /></div>
          <div className="form-field"><label htmlFor="password"><LocalizedText translationKey="password" /></label><input id="password" name="password" type="password" autoComplete="current-password" maxLength={72} required /></div>
          <div className="forgot-row"><Link className="forgot-link" href="/forgot-password"><LocalizedText translationKey="forgotPassword" /></Link></div>
          <button className="button button-rose" type="submit"><LocalizedText translationKey="signIn" /><span aria-hidden="true">↗</span></button>
        </form>
        <div className="auth-divider"><LocalizedText translationKey="orEmail" /></div>
        <form action={signInWithGoogle}><button className="button button-outline" type="submit"><Chrome size={16} /><LocalizedText translationKey="continueGoogle" /></button></form>
        <p className="auth-switch"><LocalizedText translationKey="noAccount" /> <Link href="/sign-up"><LocalizedText translationKey="signUp" /></Link></p>
      </div>
    </AuthLayout>
  );
}