import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { BlockSkeleton, PageHeader } from "@/components/shared/feedback";
import { PostForm } from "@/components/posts/post-form";
import { findEditablePost, requireUser } from "@/lib/data";

export default function EditPostPage({ params }: PageProps<"/dashboard/my-posts/[id]/edit">) {
  return (
    <>
      <PageHeader title="Edit post" description="Update your article." />
      <Suspense fallback={<BlockSkeleton rows={6} />}>
        <EditPost params={params} />
      </Suspense>
    </>
  );
}

async function EditPost({ params }: Pick<PageProps<"/dashboard/my-posts/[id]/edit">, "params">) {
  const { id } = await params;
  const user = await requireUser();

  const post = await findEditablePost(id);
  // Admins editing someone else's post go back to the admin dashboard.
  const redirectTo = post && post.authorId !== user.id ? "/admin-dashboard" : "/dashboard/my-posts";

  if (!post) notFound();

  return (
    <Card>
      <CardContent>
        <PostForm post={post} redirectTo={redirectTo} />
      </CardContent>
    </Card>
  );
}
