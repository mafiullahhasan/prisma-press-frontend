import Link from "next/link";
import { Crown, ExternalLink, Eye, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { PostOwnerActions } from "@/components/posts/post-owner-actions";
import { formatDate } from "@/lib/format";
import type { Post } from "@/lib/types";
import { SafeImage } from "@/components/shared/safe-image";

/** Compact post row for phones — replaces the data table below `md`. */
export function PostMobileCard({
  post,
  showAuthor = false,
  moderateLink = false,
}: {
  post: Post;
  showAuthor?: boolean;
  moderateLink?: boolean;
}) {
  return (
    <li className="rounded-2xl border bg-card p-4">
      <div className="flex gap-3">
        <SafeImage src={post.thumbnail} className="size-16 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="flex items-start gap-1.5 font-medium leading-snug">
            {post.isPremium && <Crown className="mt-0.5 size-4 shrink-0 text-primary" aria-label="Premium" />}
            <span className="line-clamp-2">{post.title}</span>
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Badge variant={post.status === "PUBLISHED" ? "secondary" : "outline"}>{post.status}</Badge>
            {post.isFeatured && <Badge variant="outline">Featured</Badge>}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {showAuthor && <span className="font-medium text-foreground">{post.author?.name ?? "—"}</span>}
        <span>{formatDate(post.createdAt)}</span>
        <span className="flex items-center gap-1">
          <Eye className="size-3.5" /> {post.views}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="size-3.5" /> {post._count?.comment ?? post.comment?.length ?? 0}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3">
        <Link
          href={moderateLink ? `/news/${post.id}#comments-heading` : post.isPremium ? "/premium" : `/news/${post.id}`}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          {moderateLink ? <MessageSquare /> : <ExternalLink />} {moderateLink ? "Moderate" : "View"}
        </Link>
        <div className="ml-auto">
          <PostOwnerActions postId={post.id} postTitle={post.title} editHref={`/dashboard/my-posts/${post.id}/edit`} />
        </div>
      </div>
    </li>
  );
}
