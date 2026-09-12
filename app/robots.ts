import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/seo.js";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/og"],
        disallow: ["/admin", "/preview", "/api/admin/", "/api/auth/"],
      },
      {
        userAgent: ["GPTBot", "ClaudeBot", "PerplexityBot", "GoogleOther"],
        allow: ["/", "/api/og"],
        disallow: ["/admin", "/preview", "/api/admin/", "/api/auth/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
