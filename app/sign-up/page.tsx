import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Chrome } from "lucide-react";
import { AuthFeedback, AuthLayout } from "@/components/auth-ui";
import { LocalizedPageText, LocalizedText } from "@/components/language-provider";
import { signInWithGoogle, signUp } from "@/app/actions/auth";

export const metadata: Metadata = { title: "Create your account" };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ error?: string; sent?: string }> }) {
  const params = await searchParams;
  return (
    <AuthLayout title={<LocalizedPageText translationKey="signupAsideTitle" />} description={<LocalizedPageText translationKey="signupAsideBody" />}>
      <div className="auth-form">
        <Link href="/" className="back-home"><ArrowLeft size={14} /><LocalizedText translationKey="backHome" /></Link>
        <h2><LocalizedText translationKey="createAccount" /></h2>
        <p className="auth-subtitle"><LocalizedPageText translationKey="signupSubtitle" /></p>
        <AuthFeedback error={params.error} sent={params.sent === "1"} />
        <form action={signUp}>
          <div className="form-field"><label htmlFor="name"><LocalizedText translationKey="name" /></label><input id="name" name="name" autoComplete="name" minLength={2} maxLength={60} required /></div>
          <div className="form-field"><label htmlFor="age"><LocalizedPageText translationKey="age" /></label><input id="age" name="age" type="number" min="18" max="120" inputMode="numeric" required /><span className="form-hint"><LocalizedPageText translationKey="adultNote" /></span></div>
          <div className="form-field"><label htmlFor="email"><LocalizedText translationKey="email" /></label><input id="email" name="email" type="email" autoComplete="email" maxLength={254} required /></div>
          <div className="form-field"><label htmlFor="password"><LocalizedText translationKey="password" /></label><input id="password" name="password" type="password" autoComplete="new-password" minLength={10} maxLength={72} required /><span className="form-hint"><LocalizedText translationKey="passwordRule" /></span></div>
          <div className="form-field"><label htmlFor="confirmPassword"><LocalizedText translationKey="confirmPassword" /></label><input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={10} maxLength={72} required /></div>
          <label className="consent-row"><input type="checkbox" name="terms" required /><span><LocalizedText translationKey="termsConsent" /> <Link href="/terms"><LocalizedText translationKey="terms" /></Link> · <Link href="/privacy"><LocalizedText translationKey="privacy" /></Link></span></label>
          <button className="button button-rose" type="submit"><LocalizedText translationKey="createAccount" /><span aria-hidden="true">↗</span></button>
        </form>
        <div className="auth-divider"><LocalizedText translationKey="orEmail" /></div>
        <form action={signInWithGoogle}><button className="button button-outline" type="submit"><Chrome size={16} /><LocalizedText translationKey="continueGoogle" /></button></form>
        <p className="auth-switch"><LocalizedText translationKey="alreadyAccount" /> <Link href="/login"><LocalizedText translationKey="signIn" /></Link></p>
        <p className="legal-copy"><LocalizedPageText translationKey="termsAgreement" /></p>
      </div>
    </AuthLayout>
  );
}