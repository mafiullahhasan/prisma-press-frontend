import { Suspense } from "react";
import Link from "next/link";
import { Crown, Eye, FileText, MessageSquare, PenSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BlockSkeleton, PageHeader } from "@/components/shared/feedback";
import { getCommentsByAuthor, getMyPosts, getSubscriptionStatus, requireUser } from "@/lib/data";
import { formatDate, initials } from "@/lib/format";

export default function UserDashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your activity at a glance."
        action={
          <Link href="/dashboard/my-posts/new" className={buttonVariants()}>
            <PenSquare /> New post
          </Link>
        }
      />
      <Suspense fallback={<BlockSkeleton rows={5} />}>
        <Overview />
      </Suspense>
    </>
  );
}

async function Overview() {
  const user = await requireUser();
  const [postsRes, commentsRes, subscription] = await Promise.all([
    getMyPosts(),
    getCommentsByAuthor(user.id),
    getSubscriptionStatus(),
  ]);

  const posts = postsRes.success ? postsRes.data : [];
  const comments = commentsRes.success ? commentsRes.data : [];
  const totalViews = posts.reduce((sum, p) => sum + p.views, 0);

  const stats = [
    { label: "My posts", value: postsRes.success ? posts.length : "—", icon: FileText },
    { label: "Total views", value: postsRes.success ? totalViews : "—", icon: Eye },
    { label: "My comments", value: commentsRes.success ? comments.length : "—", icon: MessageSquare },
    { label: "Premium", value: subscription?.isSubscribed ? "Active" : "Inactive", icon: Crown },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar className="size-16 border">
            <AvatarImage src={user.profile?.profilePhoto || ""} alt={user.name} />
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <Badge variant="secondary">{user.role}</Badge>
              {user.activeStatus === "BLOCKED" && <Badge variant="destructive">Blocked</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {user.profile?.bio && <p className="mt-2 text-sm">{user.profile.bio}</p>}
            <p className="mt-1 text-xs text-muted-foreground">Member since {formatDate(user.createdAt)}</p>
          </div>
          <Link href="/dashboard/profile" className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto" })}>
            Edit profile
          </Link>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="py-4 sm:py-6">
            <CardContent className="flex flex-col items-start gap-2 px-4 sm:flex-row sm:items-center sm:gap-3 sm:px-6">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-10">
                <Icon className="size-4 sm:size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-semibold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!postsRes.success && (
        <p className="text-sm text-muted-foreground">Posts: {postsRes.message}</p>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent posts</CardTitle>
          <Link href="/dashboard/my-posts" className={buttonVariants({ variant: "link", size: "sm" })}>
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {posts.length ? (
            <ul className="divide-y">
              {posts.slice(0, 5).map((p) => (
                <li key={p.id} className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <span className="truncate font-medium">{p.title}</span>
                  <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                    <Badge variant="outline">{p.status}</Badge>
                    {formatDate(p.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">You haven&apos;t written anything yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
