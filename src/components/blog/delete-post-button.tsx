"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "@/components/icons";
import { deletePostAction } from "@/app/actions/posts";

interface DeletePostButtonProps {
  postId: string;
  postTitle: string;
}

export function DeletePostButton({ postId, postTitle }: DeletePostButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${postTitle}"?\n\nThis will permanently delete the post and remove all its uploaded images and thumbnails from Cloudinary storage.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const result = await deletePostAction(postId);
      if (result.success) {
        router.push("/");
        router.refresh();
      } else {
        alert(result.error || "Failed to delete post");
        setIsDeleting(false);
      }
    } catch {
      alert("An unexpected error occurred while deleting the post");
      setIsDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex items-center gap-1 px-2 py-0.5 border border-destructive/40 bg-card hover:bg-destructive/10 text-destructive underline font-bold text-xs whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
      title="Permanently delete this article and all associated Cloudinary media"
    >
      <Trash2 className="size-3 shrink-0" />
      <span>{isDeleting ? "[Deleting...]" : "[Delete Article]"}</span>
    </button>
  );
}
