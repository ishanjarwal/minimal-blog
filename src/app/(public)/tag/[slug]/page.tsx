import * as React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import {
  Calendar,
  Clock,
  Tag as TagIcon,
  ArrowRight,
} from "@/components/icons";

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = await db.tag.findUnique({
    where: { slug },
    select: { name: true },
  });

  if (!tag) {
    return { title: "Tag Not Found" };
  }

  return {
    title: `Articles tagged with #${tag.name}`,
    description: `Collection of engineering articles exploring ${tag.name}`,
  };
}

export default async function TagFeedPage({ params }: TagPageProps) {
  const { slug } = await params;

  const tag = await db.tag.findUnique({
    where: { slug },
    include: {
      posts: {
        where: {
          post: { published: true },
        },
        include: {
          post: {
            include: {
              tags: {
                include: { tag: true },
              },
            },
          },
        },
      },
    },
  });

  if (!tag) {
    notFound();
  }

  const posts = tag.posts.map((p) => p.post);

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Tag Banner */}
      <div className="border-b border-border pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="text-muted-foreground font-semibold">
            ~/tag/{tag.slug}
          </div>
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <TagIcon className="size-4 text-muted-foreground" />
            <span>## Articles tagged with #{tag.name}</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/tag"
            className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 font-bold"
          >
            [All Tags]
          </Link>
          <span className="text-border">|</span>
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 font-bold"
          >
            [Home]
          </Link>
        </div>
      </div>

      {/* Post List */}
      {posts.length === 0 ? (
        <div className="border border-border bg-card p-6 text-center text-muted-foreground">
          No published articles found under #{tag.name}.
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const formattedDate = post.publishedAt
              ? new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }).format(new Date(post.publishedAt))
              : "Draft";

            return (
              <article
                key={post.id}
                className="group border border-border bg-card p-4 sm:p-5 transition-colors hover:border-blue-500/60 dark:hover:border-blue-400/60"
              >
                <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
                  <div className="flex-1 min-w-0 space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="size-3" />
                        {formattedDate}
                      </span>
                      <span>&bull;</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" />
                        {post.readTimeMinutes} min read
                      </span>
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-foreground">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                      >
                        {post.title}
                      </Link>
                    </h2>

                    <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed line-clamp-3">
                      {post.shortDescription}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {post.tags.map(({ tag: otherTag }) => (
                          <Link
                            key={otherTag.id}
                            href={`/tag/${otherTag.slug}`}
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 border text-[11px] transition-colors ${
                              otherTag.slug === tag.slug
                                ? "border-blue-500/80 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold"
                                : "border-border bg-muted/60 text-foreground hover:bg-muted"
                            }`}
                          >
                            <TagIcon className="size-2.5 text-muted-foreground" />
                            <span>{otherTag.name}</span>
                          </Link>
                        ))}
                      </div>

                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 ml-auto"
                      >
                        <span>[Read</span>
                        <ArrowRight className="size-3" />
                        <span>]</span>
                      </Link>
                    </div>
                  </div>

                  {post.thumbnailUrl && (
                    <div className="w-full md:w-44 sm:h-28 aspect-video sm:aspect-auto border border-border bg-muted overflow-hidden shrink-0">
                      <Link href={`/blog/${post.slug}`} tabIndex={-1} aria-hidden="true">
                        <Image
                          src={post.thumbnailUrl}
                          alt={post.title}
                          width={176}
                          height={112}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      </Link>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
