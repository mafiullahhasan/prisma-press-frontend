import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { api } from "./api";
import type {
  Comment,
  Post,
  PostQuery,
  PostStats,
  Role,
  SubscriptionInfo,
  User,
} from "./types";

// ---------------- Users ----------------

/** GET /api/users/me — null when not logged in / token invalid. Deduped per request. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const res = await api<User>("/api/users/me");
  return res.success ? res.data : null;
});

/** Use in protected pages: redirects to /login, optionally checks role. */
export async function requireUser(roles?: Role[]): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (roles && !roles.includes(user.role)) redirect("/dashboard");
  return user;
}

// ---------------- Posts ----------------

/** GET /api/posts (public, non-premium only) */
export async function getPosts(query: PostQuery = {}) {
  return api<Post[]>("/api/posts", { auth: false, query: { ...query } });
}

/** GET /api/posts/:id — also increments views, so dedupe within a request. */
export const getPostById = cache(async (id: string) => {
  return api<Post>(`/api/posts/${id}`, { auth: false });
});

/** GET /api/posts/my-posts (ADMIN, USER) */
export async function getMyPosts() {
  return api<Post[]>("/api/posts/my-posts");
}

/** GET /api/posts/stats (ADMIN) */
export async function getPostStats() {
  return api<PostStats>("/api/posts/stats");
}

/** GET /api/premium (logged in + active subscription) */
export async function getPremiumPosts(query: PostQuery = {}) {
  return api<Post[]>("/api/premium", { query: { ...query } });
}

/**
 * A post the current user may edit/delete: their own (via my-posts, includes
 * premium & drafts), or — for admins — anyone's (via the details endpoint).
 * Server-side source of truth for the current thumbnail during cleanup.
 */
export async function findEditablePost(postId: string): Promise<Post | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const mine = await getMyPosts();
  const own = mine.success ? mine.data.find((p) => p.id === postId) : undefined;
  if (own) return own;

  if (user.role === "ADMIN") {
    const res = await getPostById(postId);
    if (res.success) return res.data;
  }
  return null;
}

// ---------------- Comments ----------------

/** GET /api/comments/author/:authorId */
export async function getCommentsByAuthor(authorId: string) {
  return api<Comment[]>(`/api/comments/author/${authorId}`, { auth: false });
}

/** GET /api/comments/:commentId */
export async function getCommentById(commentId: string) {
  return api<Comment>(`/api/comments/${commentId}`, { auth: false });
}

// ---------------- Subscription ----------------

/**
 * GET /api/subscription/status
 * Backend returns 404 when the user never subscribed — treat that as "no subscription".
 */
export async function getSubscriptionStatus(): Promise<SubscriptionInfo | null> {
  const res = await api<SubscriptionInfo>("/api/subscription/status");
  return res.success ? res.data : null;
}
