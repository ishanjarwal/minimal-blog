import * as React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { db } from "@/lib/db";
import { DevtoEditor } from "@/components/editor/devto-editor";

interface EditPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EditPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Edit Post: ${slug} | Admin Studio`,
  };
}

export default async function EditPage({ params }: EditPageProps) {
  const { slug } = await params;

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

  const initialData = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    shortDescription: post.shortDescription,
    content: post.content,
    thumbnailUrl: post.thumbnailUrl,
    published: post.published,
    tags: post.tags.map((t) => t.tag.name),
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-3 flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground font-mono font-semibold">
            ~/studio/edit/{post.slug}
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground font-mono">
            # Edit Article
          </h1>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          [ID: {post.id.slice(-8)}]
        </span>
      </div>

      <DevtoEditor initialData={initialData} />
    </div>
  );
}
