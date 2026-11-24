import { Suspense } from "react";
import Link from "next/link";
import {
  Archive,
  Ban,
  CheckCircle2,
  Eye,
  FilePen,
  FileText,
  MessageSquare,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BlockSkeleton, EmptyState, ErrorState, PageHeader } from "@/components/shared/feedback";
import { Pagination } from "@/components/shared/pagination";
import { PostOwnerActions } from "@/components/posts/post-owner-actions";
import { PostMobileCard } from "@/components/posts/post-mobile-card";
import { getPostStats, getPosts, requireUser } from "@/lib/data";
import { formatDate, param } from "@/lib/format";

export default function AdminDashboardPage({ searchParams }: PageProps<"/admin-dashboard">) {
  return (
    <>
      <PageHeader title="Admin Dashboard" description="Platform-wide statistics and content management." />
      <Suspense fallback={<BlockSkeleton rows={6} />}>
        <AdminContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function AdminContent({ searchParams }: Pick<PageProps<"/admin-dashboard">, "searchParams">) {
  await requireUser(["ADMIN"]);
  const sp = await searchParams;
  const page = param(sp.page) ?? "1";

  // GET /api/posts/stats (ADMIN) + GET /api/posts for management
  const [statsRes, postsRes] = await Promise.all([
    getPostStats(),
    getPosts({ page, limit: "10", sortBy: "createdAt", sortOrder: "desc" }),
  ]);

  return (
    <div className="space-y-8">
      {statsRes.success ? (
        <StatsGrid stats={statsRes.data} />
      ) : (
        <ErrorState message={`Stats: ${statsRes.message}`} />
      )}

      <Card className="pb-4 md:pb-0">
        <CardHeader>
          <CardTitle>All free posts</CardTitle>
          <CardDescription>
            Edit or delete any post. Open a post to moderate its comments.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {!postsRes.success ? (
            <div className="px-6 pb-6">
              <ErrorState message={postsRes.message} />
            </div>
          ) : !postsRes.data.length ? (
            <div className="px-6 pb-6">
              <EmptyState title="No posts" />
            </div>
          ) : (
            <>
            {/* Phones: card list */}
            <ul className="space-y-3 px-4 md:hidden">
              {postsRes.data.map((post) => (
                <PostMobileCard key={post.id} post={post} showAuthor moderateLink />
              ))}
            </ul>
            {/* md+: data table */}
            <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {postsRes.data.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="max-w-xs pl-6">
                      <Link href={`/news/${post.id}`} className="block truncate font-medium hover:underline">
                        {post.title}
                      </Link>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{post.author?.name ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={post.status === "PUBLISHED" ? "secondary" : "outline"}>{post.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{post.views}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(post.createdAt)}</TableCell>
                    <TableCell className="pr-6">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/news/${post.id}#comments-heading`}
                          className={buttonVariants({ variant: "ghost", size: "xs" })}
                        >
                          <MessageSquare /> Moderate
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
            </div>
            </>
          )}
        </CardContent>
      </Card>

      {postsRes.success && (
        <Pagination
          page={postsRes.meta?.page ?? Number(page)}
          limit={postsRes.meta?.limit ?? 10}
          total={postsRes.meta?.total ?? postsRes.data.length}
          basePath="/admin-dashboard"
          params={{}}
        />
      )}
    </div>
  );
}

function StatsGrid({ stats }: { stats: import("@/lib/types").PostStats }) {
  const items = [
    { label: "Total posts", value: stats.totalPosts, icon: FileText },
    { label: "Published", value: stats.totalPublishedPosts.length, icon: Send },
    { label: "Drafts", value: stats.totalDraftPosts.length, icon: FilePen },
    { label: "Archived", value: stats.totalArchivedPosts.length, icon: Archive },
    { label: "Total views", value: stats.totalPostViews ?? 0, icon: Eye },
    { label: "Total comments", value: stats.totalComments, icon: MessageSquare },
    { label: "Approved comments", value: stats.totalApprovedComments.length, icon: CheckCircle2 },
    { label: "Rejected comments", value: stats.totalRejectComments.length, icon: Ban },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {items.map(({ label, value, icon: Icon }) => (
        <Card key={label} className="py-4 sm:py-6">
          <CardContent className="flex flex-col items-start gap-2 px-4 sm:flex-row sm:items-center sm:gap-3 sm:px-6">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-10">
              <Icon className="size-4 sm:size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xl font-semibold sm:text-2xl">{value.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
