import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import { LanguagePicker } from "@/components/language-picker";
import { LocalizedPageText } from "@/components/language-provider";
import type { PageTranslationKey } from "@/lib/i18n-pages";

export function LegalPage({ eyebrowKey, titleKey, children }: Readonly<{ eyebrowKey: PageTranslationKey; titleKey: PageTranslationKey; children: React.ReactNode }>) {
  return (
    <main className="legal-page">
      <header className="legal-header"><Link href="/" className="wordmark"><span className="brand-mark"><Heart size={16} fill="currentColor" /></span><span>WeDating</span></Link><div className="legal-header-actions"><LanguagePicker /><Link href="/" className="text-link"><ArrowLeft size={14} /><LocalizedPageText translationKey="legalHome" /></Link></div></header>
      <article className="legal-content"><span className="eyebrow-small"><LocalizedPageText translationKey={eyebrowKey} /></span><h1><LocalizedPageText translationKey={titleKey} /></h1><p className="legal-updated"><LocalizedPageText translationKey="legalUpdated" /></p>{children}</article>
      <footer className="legal-footer"><Link href="/terms"><LocalizedPageText translationKey="legalTerms" /></Link><Link href="/privacy"><LocalizedPageText translationKey="legalPrivacy" /></Link><Link href="/community-guidelines"><LocalizedPageText translationKey="legalCommunity" /></Link></footer>
    </main>
  );
}