"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { savePostAction, deletePostAction } from "@/app/actions/posts";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Quote,
  ImageIcon,
  Video,
  List,
  Eye,
  Edit3,
  Trash2,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
} from "@/components/icons";
import { Button } from "@/components/ui/button";

interface InitialPostData {
  id?: string;
  title?: string;
  slug?: string;
  shortDescription?: string;
  content?: string;
  thumbnailUrl?: string | null;
  published?: boolean;
  tags?: string[];
}

export function DevtoEditor({ initialData }: { initialData?: InitialPostData }) {
  const router = useRouter();

  // Tab State
  const [activeTab, setActiveTab] = React.useState<"write" | "preview">("write");

  // Post Form State
  const [title, setTitle] = React.useState(initialData?.title || "");
  const [slug, setSlug] = React.useState(initialData?.slug || "");
  const [slugEdited, setSlugEdited] = React.useState(Boolean(initialData?.slug));
  const [shortDescription, setShortDescription] = React.useState(
    initialData?.shortDescription || ""
  );
  const [content, setContent] = React.useState(initialData?.content || "");
  const [thumbnailUrl, setThumbnailUrl] = React.useState(initialData?.thumbnailUrl || "");
  const [tagsString, setTagsString] = React.useState(initialData?.tags?.join(", ") || "");
  const [published, setPublished] = React.useState(Boolean(initialData?.published));

  // Loading & Feedback State
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);
  const [isUploadingThumb, setIsUploadingThumb] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const thumbnailInputRef = React.useRef<HTMLInputElement>(null);

  // Auto-generate slug from title unless manually edited
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!slugEdited) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generated);
    }
  };

  // Helper to insert markdown tags at cursor
  const insertFormatting = (before: string, after = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = `${before}${selected || "text"}${after}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + (selected.length || 4));
    }, 50);
  };

  // Upload image handler to Cloudinary via /api/media/upload
  const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Image upload failed");
      }

      insertFormatting(`\n![${file.name.replace(/\.[^/.]+$/, "")}](${data.url})\n`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  // Upload thumbnail handler
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingThumb(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Thumbnail upload failed");
      }

      setThumbnailUrl(data.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to upload thumbnail");
    } finally {
      setIsUploadingThumb(false);
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
    }
  };

  // Video embed template helper
  const handleEmbedVideoPrompt = () => {
    const url = prompt("Enter YouTube video link (e.g. https://www.youtube.com/watch?v=...):");
    if (url) {
      insertFormatting(`\n${url.trim()}\n`);
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    const tagsArray = tagsString
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const result = await savePostAction({
      id: initialData?.id,
      title,
      slug,
      shortDescription,
      content,
      thumbnailUrl,
      published,
      tags: tagsArray,
    });

    setIsSaving(false);

    if (result.success && result.slug) {
      setSuccess("Post saved successfully!");
      setTimeout(() => {
        router.push(`/blog/${result.slug}`);
        router.refresh();
      }, 700);
    } else {
      setError(result.error || "Failed to save post");
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    if (!confirm("Are you sure you want to permanently delete this article?")) return;

    setIsDeleting(true);
    setError(null);

    const result = await deletePostAction(initialData.id);
    setIsDeleting(false);

    if (result.success) {
      router.push("/");
      router.refresh();
    } else {
      setError(result.error || "Failed to delete post");
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Dev.to-style Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("write")}
            className={`px-3 py-1.5 border border-border flex items-center gap-1.5 font-bold transition-colors cursor-pointer select-none whitespace-nowrap shrink-0 ${
              activeTab === "write"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground hover:bg-muted"
            }`}
          >
            <Edit3 className="size-3.5" />
            <span className="whitespace-nowrap">[Write]</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1.5 border border-border flex items-center gap-1.5 font-bold transition-colors cursor-pointer select-none whitespace-nowrap shrink-0 ${
              activeTab === "preview"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground hover:bg-muted"
            }`}
          >
            <Eye className="size-3.5" />
            <span className="whitespace-nowrap">[Preview]</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          {initialData?.id && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isDeleting || isSaving}
              onClick={handleDelete}
              className="text-xs font-mono rounded-none border border-destructive/40 whitespace-nowrap shrink-0"
            >
              <Trash2 className="size-3.5" />
              <span className="whitespace-nowrap">[Delete]</span>
            </Button>
          )}

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="text-xs font-bold font-mono rounded-none border border-border bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer whitespace-nowrap shrink-0"
          >
            {isSaving ? (
              <span className="whitespace-nowrap">Saving...</span>
            ) : (
              <span className="flex items-center gap-1 whitespace-nowrap">
                <span>{initialData?.id ? "[Update Post" : "[Publish Post"}</span>
                <ArrowRight className="size-3 shrink-0" />
                <span>]</span>
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Feedback Alerts */}
      {error && (
        <div className="p-3 border border-destructive/40 bg-destructive/10 text-destructive flex items-center gap-2">
          <ShieldAlert className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* WRITE TAB */}
      {activeTab === "write" ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label htmlFor="title" className="font-bold text-foreground block">
              Title *
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={handleTitleChange}
              placeholder="e.g. Understanding Linux Virtual Memory"
              className="w-full px-3 py-2 border border-border bg-background text-foreground font-mono text-sm outline-none focus:border-ring"
            />
          </div>

          {/* Slug & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label htmlFor="slug" className="font-bold text-foreground block">
                Slug (URL identifier) *
              </label>
              <input
                id="slug"
                type="text"
                required
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugEdited(true);
                }}
                placeholder="understanding-linux-memory"
                className="w-full px-3 py-2 border border-border bg-background text-foreground font-mono text-xs outline-none focus:border-ring"
              />
            </div>

            <div className="space-y-1">
              <span className="font-bold text-foreground block">Status</span>
              <label className="flex items-center gap-2 px-3 py-2 border border-border bg-card cursor-pointer h-[38px]">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="rounded-none border-border"
                />
                <span className="text-xs font-semibold text-foreground">
                  {published ? "Published" : "Draft (Hidden)"}
                </span>
              </label>
            </div>
          </div>

          {/* Short Description */}
          <div className="space-y-1">
            <label htmlFor="desc" className="font-bold text-foreground block">
              Short Description (Card Teaser &amp; SEO) *
            </label>
            <textarea
              id="desc"
              required
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="A brief 1-2 sentence overview of the article..."
              className="w-full px-3 py-2 border border-border bg-background text-foreground font-mono text-xs outline-none focus:border-ring"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label htmlFor="tags" className="font-bold text-foreground block">
              Tags (comma separated)
            </label>
            <input
              id="tags"
              type="text"
              value={tagsString}
              onChange={(e) => setTagsString(e.target.value)}
              placeholder="linux, kernel, architecture, systems"
              className="w-full px-3 py-2 border border-border bg-background text-foreground font-mono text-xs outline-none focus:border-ring"
            />
          </div>

          {/* Thumbnail (Optional) */}
          <div className="space-y-2 border border-border bg-card p-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-foreground block">
                  Article Thumbnail (Optional)
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Leave empty for a clean typographic card, or upload/paste an image URL.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  disabled={isUploadingThumb}
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="rounded-none text-xs border border-border cursor-pointer"
                >
                  <ImageIcon className="size-3" />
                  <span>{isUploadingThumb ? "Uploading..." : "[Upload to Cloudinary]"}</span>
                </Button>
              </div>
            </div>

            <input
              type="url"
              value={thumbnailUrl || ""}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://res.cloudinary.com/... or paste image URL"
              className="w-full px-3 py-1.5 border border-border bg-background text-foreground font-mono text-xs outline-none focus:border-ring"
            />

            {thumbnailUrl && (
              <div className="relative w-40 h-24 border border-border bg-muted overflow-hidden">
                <Image
                  src={thumbnailUrl}
                  alt="Thumbnail preview"
                  fill
                  sizes="160px"
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => setThumbnailUrl("")}
                  className="absolute top-1 right-1 bg-black/80 text-white px-1 text-[10px] cursor-pointer"
                  title="Remove thumbnail"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Markdown Content & Toolbar */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-1">
              <span className="font-bold text-foreground">Markdown Content *</span>

              {/* Formatting Toolbar */}
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => insertFormatting("## ", "\n")}
                  className="px-1.5 py-0.5 border border-border bg-card hover:bg-muted text-[11px] cursor-pointer"
                  title="Heading 2"
                >
                  <Heading1 className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("### ", "\n")}
                  className="px-1.5 py-0.5 border border-border bg-card hover:bg-muted text-[11px] cursor-pointer"
                  title="Heading 3"
                >
                  <Heading2 className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("**", "**")}
                  className="px-1.5 py-0.5 border border-border bg-card hover:bg-muted text-[11px] cursor-pointer"
                  title="Bold"
                >
                  <Bold className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("*", "*")}
                  className="px-1.5 py-0.5 border border-border bg-card hover:bg-muted text-[11px] cursor-pointer"
                  title="Italic"
                >
                  <Italic className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("> ", "\n")}
                  className="px-1.5 py-0.5 border border-border bg-card hover:bg-muted text-[11px] cursor-pointer"
                  title="Quote"
                >
                  <Quote className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("\n```typescript\n", "\n```\n")}
                  className="px-1.5 py-0.5 border border-border bg-card hover:bg-muted text-[11px] cursor-pointer"
                  title="Code block"
                >
                  <List className="size-3" />
                </button>

                <span className="text-border">|</span>

                {/* Upload Image to Cloudinary */}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleInlineImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploadingImage}
                  onClick={() => imageInputRef.current?.click()}
                  className="inline-flex items-center gap-1 px-2 py-0.5 border border-border bg-card hover:bg-muted text-blue-600 dark:text-blue-400 underline text-[11px] cursor-pointer"
                  title="Upload image to Cloudinary and insert markdown"
                >
                  <ImageIcon className="size-3" />
                  <span>{isUploadingImage ? "Uploading..." : "[Add Image]"}</span>
                </button>

                {/* Video Link Prompt */}
                <button
                  type="button"
                  onClick={handleEmbedVideoPrompt}
                  className="inline-flex items-center gap-1 px-2 py-0.5 border border-border bg-card hover:bg-muted text-blue-600 dark:text-blue-400 underline text-[11px] cursor-pointer"
                  title="Embed YouTube video"
                >
                  <Video className="size-3" />
                  <span>[Add Video]</span>
                </button>
              </div>
            </div>

            <textarea
              ref={textareaRef}
              required
              rows={20}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your article in Markdown..."
              className="w-full p-3 border border-border bg-background text-foreground font-mono text-xs leading-relaxed outline-none focus:border-ring"
            />
          </div>
        </form>
      ) : (
        /* PREVIEW TAB */
        <div className="border border-border bg-card p-4 sm:p-6 space-y-6">
          <div className="border-b border-border pb-4 space-y-2">
            <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
              {"// Live Article Preview"}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {title || "Untitled Article"}
            </h1>

            {shortDescription && (
              <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-medium">
                {shortDescription}
              </p>
            )}

            {thumbnailUrl && (
              <div className="my-4 aspect-video w-full max-h-72 border border-border bg-muted overflow-hidden relative">
                <Image
                  src={thumbnailUrl}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="object-cover"
                />
              </div>
            )}
          </div>

          <MarkdownRenderer content={content || "*No content written yet.*"} />
        </div>
      )}
    </div>
  );
}
