import type { NextConfig } from "next";
import path from "node:path";

const scriptSources = [
  "'self'",
  "'unsafe-inline'",
  ...(process.env.NODE_ENV === "development" ? ["'unsafe-eval'"] : []),
  "https://js.stripe.com",
].join(" ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "object-src 'none'",
              "frame-ancestors 'none'",
              "form-action 'self' https://checkout.stripe.com",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "style-src 'self' 'unsafe-inline'",
              `script-src ${scriptSources}`,
              "connect-src 'self' https://*.supabase.co https://api.stripe.com https://checkout.stripe.com",
              "frame-src https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com",
            ].join("; "),
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
        ],
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    localPatterns: [
      {
        pathname: "/images/tag/**",
        search: "?v=transparent-20260722",
      },
      {
        pathname: "/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
