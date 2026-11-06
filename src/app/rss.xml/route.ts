import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

export async function GET() {
  const baseUrl = siteConfig.blog.url.replace(/\/+$/, "");
  let posts: Array<{
    title: string;
    slug: string;
    shortDescription: string;
    publishedAt: Date | null;
    tags: Array<{ tag: { name: string } }>;
  }> = [];

  try {
    posts = await db.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: 20,
      select: {
        title: true,
        slug: true,
        shortDescription: true,
        publishedAt: true,
        tags: {
          select: {
            tag: { select: { name: true } },
          },
        },
      },
    });
  } catch {
    // Graceful fallback during build or offline database scenarios
  }

  const itemsXml = posts
    .map((post) => {
      const postUrl = `${baseUrl}/blog/${post.slug}`;
      const pubDate = post.publishedAt
        ? new Date(post.publishedAt).toUTCString()
        : new Date().toUTCString();
      const categories = post.tags
        .map((t) => `<category>${escapeXml(t.tag.name)}</category>`)
        .join("\n        ");

      return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${post.shortDescription}]]></description>
      <author>${siteConfig.author.email} (${siteConfig.author.name})</author>
      ${categories}
    </item>`;
    })
    .join("\n");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.blog.name)}</title>
    <link>${baseUrl}</link>
    <description>${escapeXml(siteConfig.blog.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(rssFeed, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
