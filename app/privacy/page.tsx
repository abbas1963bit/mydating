import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { LocalizedPageText } from "@/components/language-provider";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return <LegalPage eyebrowKey="legalPrivacy" titleKey="legalPrivacy">
    <p><LocalizedPageText translationKey="privacyIntro" /></p>
    <h2><LocalizedPageText translationKey="privacyDataHeading" /></h2><p><LocalizedPageText translationKey="privacyData" /></p>
    <h2><LocalizedPageText translationKey="privacyUseHeading" /></h2><p><LocalizedPageText translationKey="privacyUse" /></p>
    <h2><LocalizedPageText translationKey="privacyVisibilityHeading" /></h2><p><LocalizedPageText translationKey="privacyVisibility" /></p>
    <h2><LocalizedPageText translationKey="privacySecurityHeading" /></h2><p><LocalizedPageText translationKey="privacySecurity" /></p>
    <h2><LocalizedPageText translationKey="privacyRetentionHeading" /></h2><p><LocalizedPageText translationKey="privacyRetention" /></p>
    <h2><LocalizedPageText translationKey="privacyCookiesHeading" /></h2><p><LocalizedPageText translationKey="privacyCookies" /></p>
    <h2><LocalizedPageText translationKey="privacyRightsHeading" /></h2><p><LocalizedPageText translationKey="privacyRights" /></p>
  </LegalPage>;
}