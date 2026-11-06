import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return <LegalPage eyebrow="Your choices matter" title="Privacy Policy" updated="November 6, 2026">
    <p>This policy explains the information WeDating uses to provide profiles, discovery, messaging, and safety tools. The service operator should replace this template with its jurisdiction-specific policy and verified contact details before public launch.</p>
    <h2>Information you provide</h2><p>Your account email is handled by the authentication provider. Profile details, preferences, photos, likes, reports, and messages are stored to operate the service. Your password is managed by the authentication provider and is not stored in the profile database.</p>
    <h2>How information is used</h2><p>We use account and profile information to authenticate you, show profiles according to your visibility settings, deliver messages and notifications, improve safety, and respond to reports. We do not automatically translate your name, password, or the content you write.</p>
    <h2>What other members can see</h2><p>Members can see only the profile details and photos permitted by the privacy controls you choose. Your email address is not included in public profile data. Blocking a member prevents profile discovery and messaging between those accounts.</p>
    <h2>Storage and security</h2><p>Account records and private photos are stored using access policies intended to limit access to the account owner and authorized members. No online service can promise absolute security. Use a unique password and contact the operator if you suspect account misuse.</p>
    <h2>Retention and deletion</h2><p>You can delete your account from Settings. Associated profile and activity records are deleted with it, subject to limited retention required for legal, safety, and security purposes. Backups may take time to expire.</p>
    <h2>Cookies and session data</h2><p>We use secure authentication cookies to maintain your session and local storage to remember your selected display language. You can change that language at any time using the language control.</p>
    <h2>Your rights</h2><p>Depending on where you live, you may have rights to access, correct, export, restrict, or delete personal information. Contact the service operator to make a request.</p>
  </LegalPage>;
}