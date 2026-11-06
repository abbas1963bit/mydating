"use client";

import { useLanguage } from "@/components/language-provider";

export default function ErrorPage({ reset }: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  const { pageT } = useLanguage();
  return (
    <main className="legal-page">
      <section className="empty-state" style={{ width: "min(520px, calc(100% - 40px))", margin: "15vh auto" }}>
        <span className="eyebrow-small">WeDating</span>
        <h1>{pageT("errorTitle")}</h1>
        <p>{pageT("errorBody")}</p>
        <button className="button button-rose" type="button" onClick={() => reset()}>{pageT("tryAgainButton")}</button>
      </section>
    </main>
  );
}