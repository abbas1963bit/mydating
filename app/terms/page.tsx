import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return <LegalPage eyebrow="The essentials" title="Terms of Service" updated="November 6, 2026">
    <p>These terms describe the expectations for using WeDating. By creating an account, you agree to follow them and our Community Guidelines.</p>
    <h2>Who can use WeDating</h2><p>You must be at least 18 years old and able to enter into a binding agreement. Use accurate information, keep your sign-in details secure, and maintain only one personal account.</p>
    <h2>Your account and content</h2><p>You keep ownership of the content you submit. You give WeDating permission to host and display it as needed to provide the service and to other members according to the privacy controls you select. Do not post content that violates another person&apos;s rights or safety.</p>
    <h2>Respectful use</h2><p>Do not harass, impersonate, defraud, threaten, exploit, or spam other members. Do not try to access another account, bypass privacy settings, scrape profiles, or disrupt the service. We may restrict accounts or remove content when needed to protect the community.</p>
    <h2>Messages and member interactions</h2><p>Messages on WeDating support text and emoji. Do not use the service to send harmful or unlawful content. You are responsible for your decisions when communicating with or meeting other members.</p>
    <h2>Availability and changes</h2><p>We work to keep the service available, but features may change or be temporarily unavailable. We may update these terms and will post the current version here. Continued use after an update means you accept the revised terms.</p>
    <h2>Account closure</h2><p>You can deactivate your account or request permanent deletion in Settings. We may retain limited information where required by law or needed to address abuse, safety, and security.</p>
    <h2>Contact</h2><p>For questions about these terms or an account decision, use the support contact provided by the service operator.</p>
  </LegalPage>;
}