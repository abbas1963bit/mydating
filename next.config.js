/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ["ar", "en", "zh", "es"],
    defaultLocale: "ar",
  },
  reactStrictMode: true,
}

module.exports = nextConfig
