import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BlockSkeleton, ErrorState, PageHeader } from "@/components/shared/feedback";
import { EditCommentForm } from "@/components/comments/comment-item";
import { getCommentById, requireUser } from "@/lib/data";
import { formatDate } from "@/lib/format";

export default function CommentDetailsPage({ params }: PageProps<"/dashboard/my-comments/[id]">) {
  return (
    <>
      <Link
        href="/dashboard/my-comments"
        className={buttonVariants({ variant: "ghost", size: "sm", className: "mb-4" })}
      >
        <ArrowLeft /> All comments
      </Link>
      <PageHeader title="Comment details" />
      <Suspense fallback={<BlockSkeleton rows={3} />}>
        <CommentDetails params={params} />
      </Suspense>
    </>
  );
}

async function CommentDetails({ params }: Pick<PageProps<"/dashboard/my-comments/[id]">, "params">) {
  const { id } = await params;
  const user = await requireUser();

  // GET /api/comments/:commentId
  const res = await getCommentById(id);
  if (!res.success) {
    if (res.statusCode === 404) notFound();
    return <ErrorState message={res.message} />;
  }

  const comment = res.data;
  const canEdit = comment.authorId === user.id || user.role === "ADMIN";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-base">
            Posted {formatDate(comment.createdAt)}
            <Badge variant={comment.status === "APPROVED" ? "secondary" : "destructive"}>{comment.status}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {canEdit ? (
            <EditCommentForm comment={comment} />
          ) : (
            <p className="whitespace-pre-line">{comment.content}</p>
          )}
          <p className="text-xs text-muted-foreground">Last updated {formatDate(comment.updatedAt)}</p>
        </CardContent>
      </Card>

      {comment.post && (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">On post</p>
              <p className="font-medium">{comment.post.title}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="size-3.5" /> {comment.post.views} views
              </p>
            </div>
            <Link href={`/news/${comment.post.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              Open post
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
