import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.blog.url.replace(/\/+$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/blog/", "/tag/", "/rss.xml", "/feed.xml"],
        disallow: ["/admin", "/write", "/api/", "/*edit*"],
      },
      {
        userAgent: ["Googlebot", "bingbot", "Applebot"],
        allow: ["/", "/blog/", "/tag/"],
        disallow: ["/admin", "/write", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
