import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const privateSources = [
  "/dashboard/:path*",
  "/admin/:path*",
  "/rapport/:path*",
  "/resultats/:path*",
  "/optimiser/:path*",
  "/paiement/:path*",
  "/connexion/:path*",
  "/inscription/:path*",
  "/lancement/:path*",
  "/en/dashboard/:path*",
  "/en/admin/:path*",
  "/en/rapport/:path*",
  "/en/resultats/:path*",
  "/en/optimiser/:path*",
  "/en/paiement/:path*",
  "/en/connexion/:path*",
  "/en/inscription/:path*",
  "/en/lancement/:path*",
  "/ar/dashboard/:path*",
  "/ar/admin/:path*",
  "/ar/rapport/:path*",
  "/ar/resultats/:path*",
  "/ar/optimiser/:path*",
  "/ar/paiement/:path*",
  "/ar/connexion/:path*",
  "/ar/inscription/:path*",
  "/ar/lancement/:path*",
  "/api/:path*",
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  compress: true,
  agentRules: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "X-Robots-Tag",
            value: "noimageindex",
          },
        ],
      },
      {
        source: "/api/files/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
      ...privateSources.map((source) => ({
        source,
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      })),
    ];
  },
};

export default withNextIntl(nextConfig);
