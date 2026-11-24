import { Suspense } from "react";
import { BlockSkeleton, EmptyState, ErrorState, PageHeader } from "@/components/shared/feedback";
import { CommentItem } from "@/components/comments/comment-item";
import { getCommentsByAuthor, requireUser } from "@/lib/data";

export default function MyCommentsPage() {
  return (
    <>
      <PageHeader title="My Comments" description="Every comment you've left across Prisma Press." />
      <Suspense fallback={<BlockSkeleton rows={5} />}>
        <MyComments />
      </Suspense>
    </>
  );
}

async function MyComments() {
  const user = await requireUser();
  // GET /api/comments/author/:authorId
  const res = await getCommentsByAuthor(user.id);

  if (!res.success) return <ErrorState message={res.message} />;
  if (!res.data.length) {
    return <EmptyState title="No comments yet" description="Join a discussion on any news post." />;
  }

  return (
    <ul className="space-y-3">
      {res.data.map((c) => (
        <CommentItem
          key={c.id}
          comment={c}
          isOwner
          isAdmin={user.role === "ADMIN"}
          authorLabel="You"
          showPostLink
        />
      ))}
    </ul>
  );
}
