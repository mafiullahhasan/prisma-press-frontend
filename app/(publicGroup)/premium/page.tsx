import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2, Crown, Eye, Lock, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, ErrorState, PageHeader, PostGridSkeleton } from "@/components/shared/feedback";
import { PostFilters } from "@/components/shared/post-filters";
import { Pagination } from "@/components/shared/pagination";
import { SubscribeButton } from "@/components/subscription/subscribe-button";
import { getCurrentUser, getPremiumPosts } from "@/lib/data";
import { PAGE_SIZE, excerpt, formatDate, param } from "@/lib/format";
import type { Post } from "@/lib/types";
import { SafeImage } from "@/components/shared/safe-image";

export default function PremiumPage({ searchParams }: PageProps<"/premium">) {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <PageHeader
        title="Premium"
        description="In-depth articles available to Prisma Press subscribers."
      />
      <Suspense fallback={<PostGridSkeleton count={3} />}>
        <PremiumContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function PremiumContent({ searchParams }: Pick<PageProps<"/premium">, "searchParams">) {
  const sp = await searchParams;
  const justPaid = param(sp.success) === "true";

  const user = await getCurrentUser();
  if (!user) {
    return (
      <Paywall
        title="Log in to read premium posts"
        description="Premium articles are available to logged-in subscribers."
        action={
          <Link href="/login?next=/premium" className={buttonVariants({ size: "lg" })}>
            Log in
          </Link>
        }
      />
    );
  }

  const query = {
    searchTerm: param(sp.searchTerm),
    sortBy: param(sp.sortBy) ?? "createdAt",
    sortOrder: param(sp.sortOrder) ?? "desc",
    page: param(sp.page) ?? "1",
    limit: String(PAGE_SIZE),
  };
  const res = await getPremiumPosts(query);

  const successBanner = justPaid && (
    <p className="mb-6 flex items-center gap-2 rounded-xl bg-primary/10 p-4 text-sm text-primary">
      <CheckCircle2 className="size-4 shrink-0" />
      Payment successful! If posts are still locked, your subscription is being activated — refresh in a few
      seconds.
    </p>
  );

  if (res.statusCode === 403) {
    return (
      <>
        {successBanner}
        <Paywall title="Premium subscription required" description={res.message} action={<SubscribeButton />} />
      </>
    );
  }
  if (!res.success) return <ErrorState message={res.message} />;

  return (
    <>
      {successBanner}
      <Suspense fallback={<div className="mb-8 h-9" />}>
        <PostFilters />
      </Suspense>
      {res.data.length ? (
        <div className="space-y-6">
          {res.data.map((post) => (
            <PremiumArticle key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <EmptyState title="No premium posts found" />
      )}
      <Pagination
        page={res.meta?.page ?? 1}
        limit={res.meta?.limit ?? PAGE_SIZE}
        total={res.meta?.total ?? res.data.length}
        basePath="/premium"
        params={{ ...query, page: undefined, limit: undefined }}
      />
    </>
  );
}

// Premium posts have no details endpoint (GET /posts/:id excludes premium),
// so the full article is shown inline and expands on demand.
function PremiumArticle({ post }: { post: Post }) {
  return (
    <Card className="overflow-hidden pt-0">
      {post.thumbnail && <SafeImage src={post.thumbnail} className="aspect-[21/9] w-full" />}
      <CardContent className={post.thumbnail ? "" : "pt-6"}>
        <div className="mb-3 flex flex-wrap gap-1.5">
          <Badge>
            <Crown /> Premium
          </Badge>
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              #{tag}
            </Badge>
          ))}
        </div>
        <h2 className="font-heading text-2xl font-semibold">{post.title}</h2>
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span>
            {post.author?.name ?? "Unknown"} · {formatDate(post.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="size-3.5" /> {post.views}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="size-3.5" /> {post.comment?.length ?? 0}
          </span>
        </div>
        <details className="group mt-4">
          <summary className="cursor-pointer list-none text-sm text-muted-foreground">
            <span className="group-open:hidden">
              {excerpt(post.content, 220)}{" "}
              <span className="font-medium text-primary">Read full article</span>
            </span>
            <span className="hidden font-medium text-primary group-open:inline">Collapse</span>
          </summary>
          <div className="mt-3 whitespace-pre-line leading-7">{post.content}</div>
        </details>
      </CardContent>
    </Card>
  );
}

function Paywall({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border bg-linear-to-b from-primary/10 to-transparent p-10 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Lock className="size-6" />
      </div>
      <h2 className="font-heading text-2xl font-semibold">{title}</h2>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}
