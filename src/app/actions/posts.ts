"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { assertAdmin } from "@/lib/auth";

const postSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
  shortDescription: z
    .string()
    .min(10, "Short description must be at least 10 characters")
    .max(500),
  content: z.string().min(10, "Content must be at least 10 characters"),
  thumbnailUrl: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  published: z.boolean().default(false),
  tags: z.array(z.string().min(1)).default([]),
});

export type PostInput = z.infer<typeof postSchema>;

function calculateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function normalizeTagSlug(name: string): { name: string; slug: string } {
  const cleanName = name.trim();
  const slug = cleanName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  return { name: cleanName, slug };
}

export async function savePostAction(
  rawInput: PostInput
): Promise<{ success: boolean; slug?: string; error?: string }> {
  try {
    await assertAdmin();

    const parsed = postSchema.safeParse(rawInput);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Validation failed";
      return { success: false, error: firstError };
    }

    const { id, title, slug, shortDescription, content, thumbnailUrl, published, tags } =
      parsed.data;

    const readTimeMinutes = calculateReadTime(content);
    const cleanThumbnail = thumbnailUrl && thumbnailUrl.trim() !== "" ? thumbnailUrl.trim() : null;

    // Check slug collision
    const existing = await db.post.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existing && existing.id !== id) {
      return { success: false, error: `Slug "${slug}" is already in use by another article` };
    }

    // Upsert tags
    const tagRecords = await Promise.all(
      tags.map(async (rawTag) => {
        const { name, slug: tagSlug } = normalizeTagSlug(rawTag);
        if (!tagSlug) return null;
        return db.tag.upsert({
          where: { slug: tagSlug },
          update: { name },
          create: { name, slug: tagSlug },
        });
      })
    );

    const validTagIds = tagRecords.filter(Boolean).map((t) => t!.id);

    let savedPost;

    if (id) {
      // Update existing post
      savedPost = await db.post.update({
        where: { id },
        data: {
          title,
          slug,
          shortDescription,
          content,
          thumbnailUrl: cleanThumbnail,
          published,
          publishedAt: published ? new Date() : null,
          readTimeMinutes,
          tags: {
            deleteMany: {}, // Reset tag relations
            create: validTagIds.map((tagId) => ({ tagId })),
          },
        },
      });
    } else {
      // Create new post
      savedPost = await db.post.create({
        data: {
          title,
          slug,
          shortDescription,
          content,
          thumbnailUrl: cleanThumbnail,
          published,
          publishedAt: published ? new Date() : null,
          readTimeMinutes,
          tags: {
            create: validTagIds.map((tagId) => ({ tagId })),
          },
        },
      });
    }

    revalidatePath("/");
    revalidatePath(`/blog/${savedPost.slug}`);
    revalidatePath("/tag");

    return { success: true, slug: savedPost.slug };
  } catch (err: unknown) {
    console.error("Save post error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save post",
    };
  }
}

export async function deletePostAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await assertAdmin();

    const post = await db.post.delete({
      where: { id },
      select: { slug: true },
    });

    revalidatePath("/");
    revalidatePath(`/blog/${post.slug}`);
    revalidatePath("/tag");

    return { success: true };
  } catch (err: unknown) {
    console.error("Delete post error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete post",
    };
  }
}
