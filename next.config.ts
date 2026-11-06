import type { NextConfig } from "next";

const developmentScriptSources = process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "";
const developmentConnections = process.env.NODE_ENV === "development" ? " ws://localhost:*" : "";
const allowedServerActionOrigins = new Set(["localhost:3000", "127.0.0.1:3000"]);

for (const configuredUrl of [process.env.NEXT_PUBLIC_SITE_URL, process.env.VERCEL_URL]) {
  if (!configuredUrl) continue;
  allowedServerActionOrigins.add(new URL(configuredUrl.startsWith("http") ? configuredUrl : `https://${configuredUrl}`).host);
}

if (process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN) {
  allowedServerActionOrigins.add(`*.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`);
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "9mb",
      allowedOrigins: [...allowedServerActionOrigins],
    },
  },
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Content-Security-Policy", value: `default-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self' https://*.supabase.co https://accounts.google.com; object-src 'none'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'${developmentScriptSources}; connect-src 'self'${developmentConnections} https://*.supabase.co wss://*.supabase.co` },
      ],
    }];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;