import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account", "/activate", "/admin", "/api", "/auth", "/checkout", "/dashboard", "/event", "/help", "/login", "/orders", "/pet", "/pets", "/preview", "/profile", "/register", "/scan", "/settings", "/studio", "/track"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
