import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.blog.url.replace(/\/+$/, "");
  const now = new Date();

  let posts: Array<{ slug: string; updatedAt: Date; publishedAt: Date | null }> = [];
  let tags: Array<{ slug: string; createdAt: Date }> = [];

  try {
    [posts, tags] = await Promise.all([
      db.post.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true, publishedAt: true },
      }),
      db.tag.findMany({
        select: { slug: true, createdAt: true },
      }),
    ]);
  } catch {
    // Safe graceful fallback for build-time compilation without active database connection
  }

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt || post.publishedAt || now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const tagEntries: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${baseUrl}/tag/${tag.slug}`,
    lastModified: tag.createdAt || now,
    changeFrequency: "weekly",
    priority: 0.65,
  }));

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tag`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...postEntries,
    ...tagEntries,
  ];
}
