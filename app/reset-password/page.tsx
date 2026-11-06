import type { Metadata } from "next";
import Link from "next/link";
import { AuthFeedback, AuthLayout } from "@/components/auth-ui";
import { LocalizedText } from "@/components/language-provider";
import { updatePassword } from "@/app/actions/auth";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return (
    <AuthLayout title="A fresh start, securely." description="Choose a new password you haven't used here before.">
      <div className="auth-form">
        <h2>Choose a new password</h2>
        <p className="auth-subtitle">Use at least 10 characters.</p>
        <AuthFeedback error={params.error} />
        <form action={updatePassword}>
          <div className="form-field"><label htmlFor="password"><LocalizedText translationKey="password" /></label><input id="password" name="password" type="password" autoComplete="new-password" minLength={10} maxLength={72} required /></div>
          <button className="button button-rose" type="submit">Save new password</button>
        </form>
        <p className="auth-switch"><Link href="/login"><LocalizedText translationKey="signIn" /></Link></p>
      </div>
    </AuthLayout>
  );
}