import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LocalizedPageText, LocalizedText } from "@/components/language-provider";

export default function NotFound() {
  return (
    <main className="legal-page">
      <section className="empty-state" style={{ width: "min(520px, calc(100% - 40px))", margin: "15vh auto" }}>
        <span className="eyebrow-small">WeDating</span>
        <h1><LocalizedPageText translationKey="notFoundTitle" /></h1>
        <p><LocalizedPageText translationKey="notFoundBody" /></p>
        <Link className="button button-rose" href="/"><ArrowLeft size={15} /><LocalizedText translationKey="backHome" /></Link>
      </section>
    </main>
  );
}