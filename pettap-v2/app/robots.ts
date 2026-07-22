import type { MetadataRoute } from "next";

const siteUrl = "https://pettap.co.uk";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/checkout", "/pets", "/preview", "/studio", "/pet", "/profile", "/orders", "/settings", "/shipping", "/returns"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
