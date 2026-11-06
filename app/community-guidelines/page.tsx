import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Community Guidelines" };

export default function CommunityGuidelinesPage() {
  return <LegalPage eyebrow="How we treat each other" title="Community Guidelines" updated="November 6, 2026">
    <p>WeDating is for adults who want to meet one another with honesty, care, and curiosity. These guidelines apply to profiles, messages, and every interaction on the service.</p>
    <h2>Be real</h2><p>Use your own identity and current photos. Do not impersonate another person, misrepresent your intentions, or use a profile to deceive or exploit others.</p>
    <h2>Be respectful</h2><p>Consent and boundaries matter. Do not send unwanted sexual content, repeated unwanted messages, threats, hate, harassment, or attempts to pressure another member.</p>
    <h2>Keep people safe</h2><p>Never use WeDating to facilitate abuse, trafficking, scams, financial exploitation, or any illegal activity. Do not share another person&apos;s private information without permission. WeDating is for adults only.</p>
    <h2>Keep conversations text-only</h2><p>Messages support text and emoji only. Do not attempt to bypass that limit with links to harmful content, encoded payloads, or requests to move a conversation for suspicious purposes.</p>
    <h2>Report concerns</h2><p>Use the report tool on a member&apos;s profile to tell us about fake profiles, harassment, spam, underage users, or inappropriate content. Block an account to stop profile visibility and messaging between you.</p>
    <h2>How reports are handled</h2><p>Authorized moderators review reports and may request more information, remove content, restrict an account, or close an account when appropriate. Do not file intentionally false or retaliatory reports.</p>
  </LegalPage>;
}