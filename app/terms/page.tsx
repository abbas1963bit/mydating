import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { LocalizedPageText } from "@/components/language-provider";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return <LegalPage eyebrowKey="legalTerms" titleKey="legalTerms">
    <p><LocalizedPageText translationKey="termsIntro" /></p>
    <h2><LocalizedPageText translationKey="termsWho" /></h2><p><LocalizedPageText translationKey="termsEligibility" /></p>
    <h2><LocalizedPageText translationKey="termsContentHeading" /></h2><p><LocalizedPageText translationKey="termsContent" /></p>
    <h2><LocalizedPageText translationKey="termsRespectHeading" /></h2><p><LocalizedPageText translationKey="termsRespect" /></p>
    <h2><LocalizedPageText translationKey="termsMessagesHeading" /></h2><p><LocalizedPageText translationKey="termsMessages" /></p>
    <h2><LocalizedPageText translationKey="termsAvailabilityHeading" /></h2><p><LocalizedPageText translationKey="termsAvailability" /></p>
    <h2><LocalizedPageText translationKey="termsClosureHeading" /></h2><p><LocalizedPageText translationKey="termsClosure" /></p>
    <h2><LocalizedPageText translationKey="termsContactHeading" /></h2><p><LocalizedPageText translationKey="termsContact" /></p>
  </LegalPage>;
}