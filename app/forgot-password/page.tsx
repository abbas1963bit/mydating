import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthFeedback, AuthLayout } from "@/components/auth-ui";
import { LocalizedPageText, LocalizedText } from "@/components/language-provider";
import { requestPasswordReset } from "@/app/actions/auth";

export const metadata: Metadata = { title: "Reset your password" };

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string; sent?: string }> }) {
  const params = await searchParams;
  return (
    <AuthLayout title={<LocalizedPageText translationKey="forgotAsideTitle" />} description={<LocalizedPageText translationKey="forgotAsideBody" />}>
      <div className="auth-form">
        <Link href="/login" className="back-home"><ArrowLeft size={14} /><LocalizedText translationKey="signIn" /></Link>
        <h2><LocalizedText translationKey="forgotPassword" /></h2>
        <p className="auth-subtitle"><LocalizedPageText translationKey="forgotSubtitle" /></p>
        <AuthFeedback error={params.error} sent={params.sent === "1"} />
        {params.sent === "1" && <p className="form-success">{<LocalizedText translationKey="resetSent" />}</p>}
        <form action={requestPasswordReset}>
          <div className="form-field"><label htmlFor="email"><LocalizedText translationKey="email" /></label><input id="email" name="email" type="email" autoComplete="email" required /></div>
          <button className="button button-rose" type="submit"><LocalizedText translationKey="sendReset" /></button>
        </form>
      </div>
    </AuthLayout>
  );
}