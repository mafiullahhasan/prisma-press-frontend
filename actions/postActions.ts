"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { deleteImage, isOwnThumbnail, publicIdFromUrl } from "@/lib/cloudinary";
import { findEditablePost, getCurrentUser } from "@/lib/data";
import type { ActionState, Post, PostStatus } from "@/lib/types";

const STATUSES: PostStatus[] = ["PUBLISHED", "DRAFT", "ARCHIVE"];

function readPostForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const thumbnail = String(formData.get("thumbnail") ?? "").trim();
  const status = String(formData.get("status") ?? "PUBLISHED") as PostStatus;
  const tags = [
    ...new Set(
      String(formData.get("tags") ?? "")
        .split(",")
        .map((t) => t.trim().replace(/^#+/, "").toLowerCase().replace(/\s+/g, "-").slice(0, 30))
        .filter(Boolean),
    ),
  ];
  const isFeatured = formData.get("isFeatured") === "on";
  const isPremium = formData.get("isPremium") === "on";

  let error: string | null = null;
  if (title.length < 3) error = "Title must be at least 3 characters";
  else if (title.length > 255) error = "Title must be 255 characters or less";
  else if (content.length < 10) error = "Content must be at least 10 characters";
  else if (thumbnail && !URL.canParse(thumbnail)) error = "Thumbnail must be a valid URL";
  else if (!STATUSES.includes(status)) error = "Invalid status";
  else if (tags.length > 10) error = "You can add up to 10 tags";

  return {
    error,
    data: {
      title,
      content,
      thumbnail: thumbnail || undefined,
      status,
      tags: [...new Set(tags)],
      isFeatured,
      isPremium,
    },
  };
}

/** POST /api/posts */
export async function createPostAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { error, data } = readPostForm(formData);
  if (error) return { success: false, message: error };

  const res = await api<Post>("/api/posts", { method: "POST", body: data });
  if (!res.success) {
    // The image was uploaded just before this call — don't leave it orphaned.
    // Owner-prefix check: never delete an image that belongs to someone else.
    const user = await getCurrentUser();
    if (user && isOwnThumbnail(data.thumbnail, user.id)) await deleteImage(data.thumbnail);
    return { success: false, message: res.message || "Could not create post" };
  }

  redirect("/dashboard/my-posts?created=1");
}

/** PATCH /api/posts/:postId */
export async function updatePostAction(
  postId: string,
  redirectTo: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { error, data } = readPostForm(formData);
  if (error) return { success: false, message: error };

  // Current thumbnail comes from the server, never from the client.
  const existing = await findEditablePost(postId);
  if (!existing) return { success: false, message: "Post not found or you can't edit it" };

  // isPremium is not part of the backend's update contract (IUpdatePostPayload).
  const { isPremium: _isPremium, ...rest } = data;
  void _isPremium;
  // null clears the thumbnail when the user removed the image.
  const payload = { ...rest, thumbnail: data.thumbnail ?? null };

  const res = await api<Post>(`/api/posts/${postId}`, { method: "PATCH", body: payload });

  const changed = publicIdFromUrl(existing.thumbnail) !== publicIdFromUrl(payload.thumbnail);
  if (!res.success) {
    // Drop the newly uploaded image; the post still points to the old one.
    const user = await getCurrentUser();
    if (changed && user && isOwnThumbnail(payload.thumbnail, user.id)) await deleteImage(payload.thumbnail);
    return { success: false, message: res.message || "Could not update post" };
  }

  // Replaced or removed → delete the old file so Cloudinary keeps no stale copy.
  if (changed) await deleteImage(existing.thumbnail);

  redirect(redirectTo.startsWith("/") ? redirectTo : "/dashboard/my-posts");
}

/** DELETE /api/posts/:postId */
export async function deletePostAction(postId: string): Promise<ActionState> {
  const existing = await findEditablePost(postId);

  const res = await api<null>(`/api/posts/${postId}`, { method: "DELETE" });
  if (!res.success) return { success: false, message: res.message || "Could not delete post" };

  // Only after the backend confirmed the delete.
  if (existing) await deleteImage(existing.thumbnail);

  refresh();
  return { success: true, message: res.message || "Post deleted" };
}
