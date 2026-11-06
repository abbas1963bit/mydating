import type { Metadata } from "next";
import Link from "next/link";
import { AuthFeedback, AuthLayout } from "@/components/auth-ui";
import { LocalizedPageText, LocalizedText } from "@/components/language-provider";
import { updatePassword } from "@/app/actions/auth";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return (
    <AuthLayout title={<LocalizedPageText translationKey="resetAsideTitle" />} description={<LocalizedPageText translationKey="resetAsideBody" />}>
      <div className="auth-form">
        <h2><LocalizedPageText translationKey="resetAsideTitle" /></h2>
        <p className="auth-subtitle"><LocalizedPageText translationKey="resetSubtitle" /></p>
        <AuthFeedback error={params.error} />
        <form action={updatePassword}>
          <div className="form-field"><label htmlFor="password"><LocalizedText translationKey="password" /></label><input id="password" name="password" type="password" autoComplete="new-password" minLength={10} maxLength={72} required /></div>
          <button className="button button-rose" type="submit"><LocalizedPageText translationKey="saveNewPassword" /></button>
        </form>
        <p className="auth-switch"><Link href="/login"><LocalizedText translationKey="signIn" /></Link></p>
      </div>
    </AuthLayout>
  );
}