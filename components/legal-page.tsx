import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import { LanguagePicker } from "@/components/language-picker";

export function LegalPage({ eyebrow, title, updated, children }: Readonly<{ eyebrow: string; title: string; updated: string; children: React.ReactNode }>) {
  return (
    <main className="legal-page">
      <header className="legal-header"><Link href="/" className="wordmark"><span className="brand-mark"><Heart size={16} fill="currentColor" /></span><span>WeDating</span></Link><div className="legal-header-actions"><LanguagePicker /><Link href="/" className="text-link"><ArrowLeft size={14} />Home</Link></div></header>
      <article className="legal-content"><span className="eyebrow-small">{eyebrow}</span><h1>{title}</h1><p className="legal-updated">Last updated {updated}</p>{children}</article>
      <footer className="legal-footer"><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link><Link href="/community-guidelines">Community guidelines</Link></footer>
    </main>
  );
}