import * as React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import { siteConfig } from "@/lib/site-config";
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import {
  Calendar,
  Clock,
  Tag,
  PenLine,
} from "@/components/icons";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await db.post.findUnique({
    where: { slug },
    select: {
      title: true,
      shortDescription: true,
      thumbnailUrl: true,
      publishedAt: true,
    },
  });

  if (!post) {
    return { title: "Post Not Found" };
  }

  const { author, blog } = siteConfig;
  const images = post.thumbnailUrl ? [{ url: post.thumbnailUrl }] : [];

  return {
    title: post.title,
    description: post.shortDescription,
    authors: [{ name: author.name, url: author.portfolioUrl }],
    openGraph: {
      title: post.title,
      description: post.shortDescription,
      url: `${blog.url}/blog/${slug}`,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.shortDescription,
      images: post.thumbnailUrl ? [post.thumbnailUrl] : [],
    },
  };
}

export default async function BlogPostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const isAuth = await isAdminAuthenticated();

  const post = await db.post.findUnique({
    where: { slug },
    include: {
      tags: {
        include: { tag: true },
      },
    },
  });

  if (!post) {
    notFound();
  }

  // Hide draft posts from public viewers
  if (!post.published && !isAuth) {
    notFound();
  }

  const { author } = siteConfig;

  const formattedPublishDate = post.publishedAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(post.publishedAt))
    : "Draft (Unpublished)";

  const formattedUpdateDate = post.updatedAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(post.updatedAt))
    : null;

  return (
    <article className="space-y-8 font-mono">
      {/* Top Navigation & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 text-xs">
        <Link
          href="/"
          className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 font-bold"
        >
          [← Back to all articles]
        </Link>

        <div className="flex items-center gap-2">
          {!post.published && (
            <span className="px-1.5 py-0.5 border border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold">
              [Draft Mode]
            </span>
          )}

          {isAuth && (
            <Link
              href={`/blog/${post.slug}/edit`}
              className="inline-flex items-center gap-1 px-2 py-0.5 border border-border bg-card hover:bg-muted text-blue-600 dark:text-blue-400 underline font-bold"
            >
              <PenLine className="size-3" />
              <span>[Edit Article]</span>
            </Link>
          )}
        </div>
      </div>

      {/* Header Info */}
      <header className="space-y-4">
        {/* Meta details banner */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3.5 text-muted-foreground" />
            <span>{formattedPublishDate}</span>
          </span>

          <span>&bull;</span>

          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5 text-muted-foreground" />
            <span>{post.readTimeMinutes} min read</span>
          </span>

          {formattedUpdateDate && (
            <>
              <span>&bull;</span>
              <span className="text-[11px] text-muted-foreground">
                Updated: {formattedUpdateDate}
              </span>
            </>
          )}
        </div>

        {/* Article Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
          {post.title}
        </h1>

        {/* Short Description */}
        <p className="text-sm sm:text-base text-foreground/80 leading-relaxed border-l-2 border-border pl-3 py-0.5">
          {post.shortDescription}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {post.tags.map(({ tag }) => (
            <Link
              key={tag.id}
              href={`/tag/${tag.slug}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 border border-border bg-muted/60 text-xs text-foreground hover:bg-muted transition-colors"
            >
              <Tag className="size-3 text-muted-foreground" />
              <span>#{tag.name}</span>
            </Link>
          ))}
        </div>

        {/* Optional Article Thumbnail */}
        {post.thumbnailUrl && (
          <div className="my-6 aspect-video w-full max-h-[420px] border border-border bg-muted overflow-hidden relative">
            <Image
              src={post.thumbnailUrl}
              alt={post.title}
              fill
              priority
              className="object-cover"
            />
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <div className="border-t border-border pt-6">
        <MarkdownRenderer content={post.content} />
      </div>

      {/* Author Bio Card */}
      <div className="border-t-2 border-border pt-6 mt-12">
        <div className="border border-border bg-card p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start">
          <div className="relative size-16 border border-border bg-muted overflow-hidden shrink-0">
            <Image
              src={author.avatarUrl}
              alt={author.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-1.5 flex-1 min-w-0 text-xs">
            <div className="font-bold text-foreground text-sm">
              Written by {author.name}
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {author.title}. Building distributed systems, agentic AI architectures, and high-performance software.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href={author.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 font-semibold"
              >
                [Portfolio]
              </a>
              <span className="text-border">|</span>
              <a
                href={author.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 font-semibold"
              >
                [GitHub]
              </a>
              <span className="text-border">|</span>
              <a
                href={author.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 font-semibold"
              >
                [LinkedIn]
              </a>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
