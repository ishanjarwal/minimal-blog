import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Calendar, ArrowRight, Tag, BookOpen } from "@/components/icons";

interface PostItem {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  thumbnailUrl?: string | null;
  publishedAt: string;
  readTimeMinutes: number;
  tags: string[];
}

// Sample feed items demonstrating both thumbnail & thumbnail-less cards
const SAMPLE_POSTS: PostItem[] = [
  {
    id: "1",
    slug: "understanding-linux-memory-management",
    title: "Understanding Linux Virtual Memory & Page Cache Internals",
    shortDescription:
      "A deep-dive analysis of Linux page tables, memory overcommit heuristics, swap mechanics, and zero-copy I/O optimizations for high-throughput distributed systems.",
    thumbnailUrl:
      "https://res.cloudinary.com/dsf4t9wmc/image/upload/v1793573698/AI-Focused_Product_Engineer_Banner_pnc70e.png",
    publishedAt: "Nov 6, 2026",
    readTimeMinutes: 6,
    tags: ["linux", "systems", "kernel"],
  },
  {
    id: "2",
    slug: "building-resilient-agentic-reasoning-loops",
    title: "Building Resilient Agentic AI Reasoning Loops with Subagent Oracles",
    shortDescription:
      "Architectural lessons from productionizing multi-agent workflows: dealing with hallucination budgets, deterministic error back-propagation, and dynamic context pruning.",
    thumbnailUrl: null, // Optional thumbnail omitted to demonstrate conditional rendering
    publishedAt: "Oct 28, 2026",
    readTimeMinutes: 8,
    tags: ["agentic-ai", "llm", "architecture"],
  },
  {
    id: "3",
    slug: "designing-type-safe-real-time-protocols",
    title: "Designing Type-Safe Real-Time WebSocket Protocols with Binary Payloads",
    shortDescription:
      "Exploring Protobuf and MessagePack serialization patterns over raw WebSockets to achieve sub-millisecond roundtrips in collaborative canvas software.",
    thumbnailUrl: null, // Optional thumbnail omitted
    publishedAt: "Oct 15, 2026",
    readTimeMinutes: 5,
    tags: ["websockets", "typescript", "networking"],
  },
];

export default function HomePage() {
  return (
    <div className="space-y-6">
      {/* Feed Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-muted-foreground" />
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
            ## Latest Articles
          </h1>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          [Showing latest {SAMPLE_POSTS.length} posts]
        </span>
      </div>

      {/* Article Feed */}
      <div className="space-y-4">
        {SAMPLE_POSTS.map((post) => (
          <article
            key={post.id}
            className="group border border-border bg-card p-4 sm:p-5 transition-colors hover:border-blue-500/60 dark:hover:border-blue-400/60"
          >
            <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
              {/* Text content area */}
              <div className="flex-1 min-w-0 space-y-2.5">
                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-mono">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="size-3" />
                    {post.publishedAt}
                  </span>
                  <span>&bull;</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3" />
                    {post.readTimeMinutes} min read
                  </span>
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

                {/* Short Description */}
                <p className="text-xs sm:text-sm text-foreground/85 font-mono leading-relaxed line-clamp-3">
                  {post.shortDescription}
                </p>

                {/* Tags & Action link */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60 text-xs font-mono">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/tag/${tag}`}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 border border-border bg-muted/60 text-[11px] text-foreground hover:bg-muted transition-colors"
                      >
                        <Tag className="size-2.5 text-muted-foreground" />
                        <span>{tag}</span>
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

              {/* Optional Thumbnail: Conditionally rendered only when thumbnailUrl is present */}
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
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between border-t border-border pt-4 text-xs font-mono">
        <button
          disabled
          className="px-2 py-1 border border-border bg-muted/40 text-muted-foreground cursor-not-allowed select-none"
        >
          [← Previous]
        </button>

        <span className="text-muted-foreground select-none">
          Page 1 of 1
        </span>

        <button
          disabled
          className="px-2 py-1 border border-border bg-muted/40 text-muted-foreground cursor-not-allowed select-none"
        >
          [Next →]
        </button>
      </div>
    </div>
  );
}
