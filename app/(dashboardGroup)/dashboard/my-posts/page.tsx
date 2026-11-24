import { Suspense } from "react";
import Link from "next/link";
import { Crown, ExternalLink, PenSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BlockSkeleton, EmptyState, ErrorState, PageHeader } from "@/components/shared/feedback";
import { PostOwnerActions } from "@/components/posts/post-owner-actions";
import { PostMobileCard } from "@/components/posts/post-mobile-card";
import { getMyPosts, requireUser } from "@/lib/data";
import { formatDate } from "@/lib/format";

export default function UserMyPostsPage() {
  return (
    <>
      <PageHeader
        title="My Posts"
        description="Everything you've written, including drafts."
        action={
          <Link href="/dashboard/my-posts/new" className={buttonVariants()}>
            <PenSquare /> New post
          </Link>
        }
      />
      <Suspense fallback={<BlockSkeleton rows={6} />}>
        <MyPosts />
      </Suspense>
    </>
  );
}

async function MyPosts() {
  await requireUser();
  const res = await getMyPosts();

  if (!res.success) return <ErrorState message={res.message} />;
  if (!res.data.length) {
    return (
      <EmptyState
        title="No posts yet"
        description="Write your first article."
        action={
          <Link href="/dashboard/my-posts/new" className={buttonVariants()}>
            Create post
          </Link>
        }
      />
    );
  }

  return (
    <>
    {/* Phones: card list */}
    <ul className="space-y-3 md:hidden">
      {res.data.map((post) => (
        <PostMobileCard key={post.id} post={post} />
      ))}
    </ul>

    {/* md+: data table */}
    <Card className="hidden py-0 md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Views</TableHead>
            <TableHead className="text-right">Comments</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {res.data.map((post) => (
            <TableRow key={post.id}>
              <TableCell className="max-w-xs">
                <div className="flex items-center gap-2">
                  {post.isPremium && <Crown className="size-4 shrink-0 text-primary" aria-label="Premium" />}
                  <span className="truncate font-medium">{post.title}</span>
                </div>
                {post.tags.length > 0 && (
                  <p className="truncate text-xs text-muted-foreground">
                    {post.tags.map((t) => `#${t}`).join(" ")}
                  </p>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Badge variant={post.status === "PUBLISHED" ? "secondary" : "outline"}>{post.status}</Badge>
                  {post.isFeatured && <Badge variant="outline">Featured</Badge>}
                </div>
              </TableCell>
              <TableCell className="text-right">{post.views}</TableCell>
              <TableCell className="text-right">{post._count?.comment ?? post.comment?.length ?? 0}</TableCell>
              <TableCell className="whitespace-nowrap">{formatDate(post.createdAt)}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Link
                    href={post.isPremium ? "/premium" : `/news/${post.id}`}
                    className={buttonVariants({ variant: "ghost", size: "xs" })}
                  >
                    <ExternalLink /> View
                  </Link>
                  <PostOwnerActions
                    postId={post.id}
                    postTitle={post.title}
                    editHref={`/dashboard/my-posts/${post.id}/edit`}
                    size="xs"
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
    </>
  );
}
