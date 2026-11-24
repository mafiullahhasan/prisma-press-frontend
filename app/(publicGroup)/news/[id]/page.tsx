import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, MessageSquare, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/feedback";
import { PostOwnerActions } from "@/components/posts/post-owner-actions";
import { CommentForm } from "@/components/comments/comment-form";
import { CommentItem } from "@/components/comments/comment-item";
import { getCurrentUser, getPostById } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { SafeImage } from "@/components/shared/safe-image";

export default function NewsDetailsPage({ params }: PageProps<"/news/[id]">) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <Link href="/news" className={buttonVariants({ variant: "ghost", size: "sm", className: "mb-6" })}>
        <ArrowLeft /> Back to news
      </Link>
      <Suspense fallback={<DetailsSkeleton />}>
        <PostDetails params={params} />
      </Suspense>
    </main>
  );
}

async function PostDetails({ params }: Pick<PageProps<"/news/[id]">, "params">) {
  const { id } = await params;
  const [res, user] = await Promise.all([getPostById(id), getCurrentUser()]);

  if (!res.success) {
    if (res.statusCode === 404) notFound();
    return <ErrorState message={res.message} />;
  }

  const post = res.data;
  const isAdmin = user?.role === "ADMIN";
  const isOwner = !!user && user.id === post.authorId;

  // Backend returns approved comments only (newest first), each with an author summary.
  const comments = post.comment ?? [];

  return (
    <article>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {post.status !== "PUBLISHED" && <Badge variant="destructive">{post.status}</Badge>}
        {post.isFeatured && (
          <Badge variant="secondary">
            <Star /> Featured
          </Badge>
        )}
        {post.tags.map((tag) => (
          <Badge key={tag} variant="outline">
            #{tag}
          </Badge>
        ))}
      </div>

      <h1 className="font-heading text-2xl font-bold tracking-tight break-words sm:text-4xl">{post.title}</h1>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{post.author?.name ?? "Unknown"}</span>
          <span>{formatDate(post.createdAt)}</span>
          <span className="flex items-center gap-1">
            <Eye className="size-4" /> {post.views} views
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="size-4" /> {post._count?.comment ?? comments.length}
          </span>
        </div>
        {(isOwner || isAdmin) && (
          <PostOwnerActions
            postId={post.id}
            postTitle={post.title}
            editHref={`/dashboard/my-posts/${post.id}/edit`}
            redirectAfterDelete="/news"
          />
        )}
      </div>

      {post.thumbnail && (
        <SafeImage src={post.thumbnail} loading="eager" className="mt-6 aspect-video w-full rounded-xl sm:mt-8" />
      )}

      <div className="mt-8 whitespace-pre-line break-words text-base leading-7 sm:leading-8">{post.content}</div>

      <Separator className="my-10" />

      <section aria-labelledby="comments-heading">
        <h2 id="comments-heading" className="mb-4 font-heading text-xl font-semibold">
          Comments ({comments.length})
        </h2>

        {user ? (
          <CommentForm postId={post.id} />
        ) : (
          <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            <Link href={`/login?next=/news/${post.id}`} className="font-medium text-primary hover:underline">
              Log in
            </Link>{" "}
            to join the conversation.
          </p>
        )}

        {comments.length ? (
          <ul className="mt-6 space-y-3">
            {comments.map((c) => (
              <CommentItem
                key={c.id}
                comment={c}
                isOwner={c.authorId === user?.id}
                isAdmin={isAdmin}
                authorLabel={
                  `${c.author?.name ?? "Reader"}${c.authorId === user?.id ? " (you)" : ""}${
                    c.authorId === post.authorId ? " · Author" : ""
                  }`
                }
              />
            ))}
          </ul>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">No comments yet. Be the first!</p>
        )}
      </section>
    </article>
  );
}

function DetailsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-10 w-4/5" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="aspect-video w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-11/12" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  );
}
