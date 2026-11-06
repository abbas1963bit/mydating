import type { Metadata } from "next";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/dm-serif-display/400.css";
import "./globals.css";
import { LanguageProvider } from "@/components/language-provider";
import { cookies, headers } from "next/headers";
import { resolveLanguage, rtlLanguages } from "@/lib/i18n";

export const metadata: Metadata = {
  title: { default: "WeDating | Meet beyond the familiar", template: "%s | WeDating" },
  description: "Meet people who share your pace, your curiosity, and the details that make a real connection.",
  applicationName: "WeDating",
  ...(process.env.NEXT_PUBLIC_SITE_URL ? { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL) } : {}),
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [cookieStore, requestHeaders] = await Promise.all([cookies(), headers()]);
  const savedLanguage = resolveLanguage(cookieStore.get("wedating-language")?.value);
  const browserLanguage = requestHeaders.get("accept-language")?.split(",")[0]?.split(";")[0];
  const initialLanguage = savedLanguage ?? resolveLanguage(browserLanguage) ?? "en";
  return (
    <html lang={initialLanguage} dir={rtlLanguages.has(initialLanguage) ? "rtl" : "ltr"}>
      <body><LanguageProvider initialLanguage={initialLanguage}>{children}</LanguageProvider></body>
    </html>
  );
}