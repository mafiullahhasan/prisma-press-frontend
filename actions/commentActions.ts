"use server";

import { refresh } from "next/cache";
import { api } from "@/lib/api";
import type { ActionState, Comment } from "@/lib/types";

function readContent(formData: FormData) {
  const content = String(formData.get("content") ?? "").trim();
  if (!content) return { error: "Comment cannot be empty", content };
  if (content.length > 2000) return { error: "Comment must be 2000 characters or less", content };
  return { error: null, content };
}

/** POST /api/comments */
export async function createCommentAction(
  postId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { error, content } = readContent(formData);
  if (error) return { success: false, message: error };

  const res = await api<Comment>("/api/comments", {
    method: "POST",
    body: { postId, content },
  });
  if (!res.success) return { success: false, message: res.message || "Could not post comment" };

  refresh();
  return { success: true, message: "Comment posted" };
}

/** PATCH /api/comments/:commentId */
export async function updateCommentAction(
  commentId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { error, content } = readContent(formData);
  if (error) return { success: false, message: error };

  const res = await api<Comment>(`/api/comments/${commentId}`, {
    method: "PATCH",
    body: { content },
  });
  if (!res.success) return { success: false, message: res.message || "Could not update comment" };

  refresh();
  return { success: true, message: "Comment updated" };
}

/** DELETE /api/comments/:commentId */
export async function deleteCommentAction(commentId: string): Promise<ActionState> {
  const res = await api<null>(`/api/comments/${commentId}`, { method: "DELETE" });
  if (!res.success) return { success: false, message: res.message || "Could not delete comment" };

  refresh();
  return { success: true, message: "Comment deleted" };
}

/** PATCH /api/comments/:commentId/moderate (ADMIN) — sets status to REJECT */
export async function moderateCommentAction(commentId: string): Promise<ActionState> {
  const res = await api<Comment>(`/api/comments/${commentId}/moderate`, { method: "PATCH" });
  if (!res.success) return { success: false, message: res.message || "Could not moderate comment" };

  refresh();
  return { success: true, message: "Comment rejected" };
}
