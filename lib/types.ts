// Shapes mirror the Prisma Press backend (prisma/schema + services).

export type Role = "USER" | "AUTHOR" | "ADMIN";
export type ActiveStatus = "ACTIVE" | "BLOCKED";
export type PostStatus = "PUBLISHED" | "DRAFT" | "ARCHIVE";
export type CommentStatus = "APPROVED" | "REJECT";
export type SubscriptionStatus = "ACTIVE" | "CANCELED" | "EXPIRED";

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: { page: number; limit: number; total: number };
  errors?: unknown[];
}

export interface Profile {
  id: string;
  profilePhoto: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  activeStatus: ActiveStatus;
  role: Role;
  createdAt: string;
  updatedAt: string;
  profile?: Profile | null;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  status: CommentStatus;
  createdAt: string;
  updatedAt: string;
  post?: { id: string; title: string; views: number };
  // Included by GET /posts/:id (approved comments only)
  author?: { id: string; name: string; profile: { profilePhoto: string | null } | null };
}

export interface Post {
  id: string;
  title: string;
  content: string;
  thumbnail: string | null;
  isFeatured: boolean;
  isPremium: boolean;
  status: PostStatus;
  tags: string[];
  views: number;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author?: Omit<User, "profile">;
  comment?: Comment[];
  _count?: { comment: number };
}

// Backend returns arrays for the status buckets (findMany), not counts.
export interface PostStats {
  totalPosts: number;
  totalPublishedPosts: Post[];
  totalArchivedPosts: Post[];
  totalDraftPosts: Post[];
  totalPostViews: number | null;
  totalComments: number;
  totalApprovedComments: Comment[];
  totalRejectComments: Comment[];
}

export interface SubscriptionInfo {
  status: SubscriptionStatus;
  isSubscribed: boolean;
  currentPeriodEnd: string;
}

export interface PostQuery {
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: string;
  limit?: string;
}

// Shared return type for every Server Action used with useActionState.
export type ActionState = {
  success: boolean;
  message: string;
} | null;
