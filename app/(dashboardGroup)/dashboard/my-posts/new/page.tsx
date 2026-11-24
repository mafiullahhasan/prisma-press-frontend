import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BlockSkeleton, PageHeader } from "@/components/shared/feedback";
import { PostForm } from "@/components/posts/post-form";
import { getSubscriptionStatus, requireUser } from "@/lib/data";

export default function NewPostPage() {
  return (
    <>
      <PageHeader title="New post" description="Write and publish a new article." />
      <Suspense fallback={<BlockSkeleton rows={6} />}>
        <NewPost />
      </Suspense>
    </>
  );
}

async function NewPost() {
  await requireUser();
  const subscription = await getSubscriptionStatus();

  return (
    <Card>
      <CardContent>
        <PostForm canCreatePremium={subscription?.status === "ACTIVE"} />
      </CardContent>
    </Card>
  );
}
