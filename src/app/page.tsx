import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import { Clock, Calendar, ArrowRight, Tag, BookOpen, PenLine } from "@/components/icons";

interface HomePageProps {
  searchParams: Promise<{ page?: string }>;
}

const PAGE_SIZE = 5;

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams;
  const currentPage = Math.max(1, parseInt(resolvedParams.page || "1", 10));
  const isAuth = await isAdminAuthenticated();

  const [posts, totalPosts] = await Promise.all([
    db.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        tags: {
          include: { tag: true },
        },
      },
    }),
    db.post.count({ where: { published: true } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalPosts / PAGE_SIZE));

  return (
    <div className="space-y-6">
      {/* Feed Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-muted-foreground" />
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground font-mono">
            ## Latest Articles
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <span>
            [{totalPosts} {totalPosts === 1 ? "article" : "articles"}]
          </span>
          {isAuth && (
            <Link
              href="/write"
              className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 font-bold"
            >
              [+ New Post]
            </Link>
          )}
        </div>
      </div>

      {/* Feed List */}
      {posts.length === 0 ? (
        <div className="border border-border bg-card p-8 text-center font-mono text-xs text-muted-foreground space-y-2">
          <p>No published articles found.</p>
          {isAuth && (
            <Link
              href="/write"
              className="inline-block text-blue-600 dark:text-blue-400 underline font-semibold"
            >
              [Write the first article]
            </Link>
          )}
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
                  {/* Text area */}
                  <div className="flex-1 min-w-0 space-y-2.5">
                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-mono">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="size-3" />
                        {formattedDate}
                      </span>
                      <span>&bull;</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" />
                        {post.readTimeMinutes} min read
                      </span>
                      {isAuth && (
                        <>
                          <span>&bull;</span>
                          <Link
                            href={`/blog/${post.slug}/edit`}
                            className="inline-flex items-center gap-0.5 text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 font-bold"
                          >
                            <PenLine className="size-2.5" />
                            <span>[Edit]</span>
                          </Link>
                        </>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="text-base sm:text-lg font-bold text-foreground leading-snug">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                      >
                        {post.title}
                      </Link>
                    </h2>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-foreground/85 font-mono leading-relaxed line-clamp-3">
                      {post.shortDescription}
                    </p>

                    {/* Tags & Read Link */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60 text-xs font-mono">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {post.tags.map(({ tag }) => (
                          <Link
                            key={tag.id}
                            href={`/tag/${tag.slug}`}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 border border-border bg-muted/60 text-[11px] text-foreground hover:bg-muted transition-colors"
                          >
                            <Tag className="size-2.5 text-muted-foreground" />
                            <span>{tag.name}</span>
                          </Link>
                        ))}
                      </div>

                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 ml-auto"
                      >
                        <span>[Read</span>
                        <ArrowRight className="size-3" />
                        <span>]</span>
                      </Link>
                    </div>
                  </div>

                  {/* Optional Thumbnail: Conditionally rendered only if present */}
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4 text-xs font-mono">
          {currentPage > 1 ? (
            <Link
              href={`/?page=${currentPage - 1}`}
              className="px-2 py-1 border border-border bg-card hover:bg-muted text-blue-600 dark:text-blue-400 underline select-none font-bold"
            >
              [← Previous]
            </Link>
          ) : (
            <span className="px-2 py-1 border border-border bg-muted/40 text-muted-foreground select-none cursor-not-allowed">
              [← Previous]
            </span>
          )}

          <span className="text-muted-foreground select-none">
            Page {currentPage} of {totalPages}
          </span>

          {currentPage < totalPages ? (
            <Link
              href={`/?page=${currentPage + 1}`}
              className="px-2 py-1 border border-border bg-card hover:bg-muted text-blue-600 dark:text-blue-400 underline select-none font-bold"
            >
              [Next →]
            </Link>
          ) : (
            <span className="px-2 py-1 border border-border bg-muted/40 text-muted-foreground select-none cursor-not-allowed">
              [Next →]
            </span>
          )}
        </div>
      )}
    </div>
  );
}
