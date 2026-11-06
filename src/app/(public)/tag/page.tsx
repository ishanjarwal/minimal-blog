import * as React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { db } from "@/lib/db";
import { Tag as TagIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Tags Directory",
  description: "Browse all topics and article tags",
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

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="border-b border-border pb-3 flex items-center justify-between">
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
          className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 font-bold"
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
              className="group border border-border bg-card p-3 flex items-center justify-between hover:border-blue-500/60 dark:hover:border-blue-400/60 transition-colors"
            >
              <div className="flex items-center gap-2">
                <TagIcon className="size-3 text-muted-foreground" />
                <span className="font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  #{tag.name}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground font-semibold">
                [{count} {count === 1 ? "post" : "posts"}]
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
