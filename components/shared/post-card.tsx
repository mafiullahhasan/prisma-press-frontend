import Link from "next/link";
import { Crown, Eye, MessageSquare, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { excerpt, formatDate } from "@/lib/format";
import type { Post } from "@/lib/types";
import { SafeImage } from "@/components/shared/safe-image";

/**
 * `href` is optional: premium posts have no public details endpoint,
 * so premium cards render their full content instead of linking.
 */
export function PostCard({ post, href, full = false }: { post: Post; href?: string; full?: boolean }) {
  const commentCount = post._count?.comment ?? post.comment?.length ?? 0;

  const title = <h3 className="font-heading text-lg font-semibold leading-snug">{post.title}</h3>;

  return (
    <Card className="flex h-full flex-col overflow-hidden pt-0">
      {/* Arbitrary user-supplied URLs → SafeImage falls back to a gradient on 404 */}
      <SafeImage src={post.thumbnail} className="aspect-video w-full" />

      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          {post.status !== "PUBLISHED" && <Badge variant="destructive">{post.status}</Badge>}
          {post.isPremium && (
            <Badge>
              <Crown /> Premium
            </Badge>
          )}
          {post.isFeatured && (
            <Badge variant="secondary">
              <Star /> Featured
            </Badge>
          )}
          {post.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline">
              #{tag}
            </Badge>
          ))}
        </div>

        {href ? (
          <Link href={href} className="hover:text-primary hover:underline underline-offset-4">
            {title}
          </Link>
        ) : (
          title
        )}

        <p className="text-sm text-muted-foreground whitespace-pre-line">
          {full ? post.content : excerpt(post.content)}
        </p>
      </CardContent>

      <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {post.author?.name ?? "Unknown"} · {formatDate(post.createdAt)}
        </span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Eye className="size-3.5" /> {post.views}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="size-3.5" /> {commentCount}
          </span>
        </span>
      </CardFooter>
    </Card>
  );
}
