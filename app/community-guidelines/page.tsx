import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { LocalizedPageText } from "@/components/language-provider";

export const metadata: Metadata = { title: "Community Guidelines" };

export default function CommunityGuidelinesPage() {
  return <LegalPage eyebrowKey="legalCommunity" titleKey="legalCommunity">
    <p><LocalizedPageText translationKey="communityIntro" /></p>
    <h2><LocalizedPageText translationKey="communityRealHeading" /></h2><p><LocalizedPageText translationKey="communityReal" /></p>
    <h2><LocalizedPageText translationKey="communityRespectHeading" /></h2><p><LocalizedPageText translationKey="communityRespect" /></p>
    <h2><LocalizedPageText translationKey="communitySafetyHeading" /></h2><p><LocalizedPageText translationKey="communitySafety" /></p>
    <h2><LocalizedPageText translationKey="communityTextHeading" /></h2><p><LocalizedPageText translationKey="communityText" /></p>
    <h2><LocalizedPageText translationKey="communityReportHeading" /></h2><p><LocalizedPageText translationKey="communityReport" /></p>
    <h2><LocalizedPageText translationKey="communityReviewHeading" /></h2><p><LocalizedPageText translationKey="communityReview" /></p>
  </LegalPage>;
}