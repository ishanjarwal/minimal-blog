import * as React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { db } from "@/lib/db";
import { siteConfig } from "@/lib/site-config";
import { getBreadcrumbJsonLd, getCollectionPageJsonLd } from "@/lib/jsonld";
import { Tag as TagIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

const title = "Tags & Topics Directory";
const description = "Browse all engineering topics, system architecture guides, and technical tags.";
const canonicalUrl = `${siteConfig.blog.url}/tag`;
const ogImageUrl = `${siteConfig.blog.url}/api/og?title=${encodeURIComponent(
  title
)}&tag=Topics&description=${encodeURIComponent(description)}`;

export const metadata: Metadata = {
  title,
  description,
  keywords: siteConfig.keywords,
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title,
    description,
    url: canonicalUrl,
    type: "website",
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: `@${siteConfig.author.handle}`,
    images: [ogImageUrl],
  },
};

export default async function TagsDirectoryPage() {
  const tags = await db.tag.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          posts: {
            where: {
              post: { published: true },
            },
          },
        },
      },
    },
  });

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Tags", path: "/tag" },
  ];
  const breadcrumbJsonLd = getBreadcrumbJsonLd(breadcrumbs);
  const collectionJsonLd = getCollectionPageJsonLd({
    title,
    description,
    path: "/tag",
    items: tags.map((t) => ({
      name: `#${t.name}`,
      path: `/tag/${t.slug}`,
    })),
  });

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      <div className="border-b border-border pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="text-muted-foreground font-semibold">
            ~/directory/tags
          </div>
          <h1 className="text-lg font-bold text-foreground">
            ## All Tags &amp; Topics
          </h1>
        </div>
        <Link
          href="/"
          className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 font-bold whitespace-nowrap shrink-0"
        >
          [← Home]
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {tags.map((tag) => {
          const count = tag._count.posts;
          return (
            <Link
              key={tag.id}
              href={`/tag/${tag.slug}`}
              className="group border border-border bg-card p-3 flex items-center justify-between gap-2 hover:border-blue-500/60 dark:hover:border-blue-400/60 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <TagIcon className="size-3 text-muted-foreground shrink-0" />
                <span className="font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                  #{tag.name}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground font-semibold whitespace-nowrap shrink-0">
                [{count} {count === 1 ? "post" : "posts"}]
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
