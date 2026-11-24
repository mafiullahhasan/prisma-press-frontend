import { Suspense } from "react";
import { PostCard } from "@/components/shared/post-card";
import { PostFilters } from "@/components/shared/post-filters";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState, ErrorState, PageHeader, PostGridSkeleton } from "@/components/shared/feedback";
import { getPosts } from "@/lib/data";
import { PAGE_SIZE, param } from "@/lib/format";

export default function NewsPage({ searchParams }: PageProps<"/news">) {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader title="News" description="All free articles from Prisma Press writers." />
      <Suspense fallback={<div className="mb-8 h-9" />}>
        <PostFilters />
      </Suspense>
      <Suspense fallback={<PostGridSkeleton />}>
        <NewsList searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function NewsList({ searchParams }: Pick<PageProps<"/news">, "searchParams">) {
  const sp = await searchParams;
  const query = {
    searchTerm: param(sp.searchTerm),
    sortBy: param(sp.sortBy) ?? "createdAt",
    sortOrder: param(sp.sortOrder) ?? "desc",
    page: param(sp.page) ?? "1",
    limit: String(PAGE_SIZE),
  };

  const res = await getPosts(query);
  if (!res.success) return <ErrorState message={res.message} />;

  if (!res.data.length) {
    return (
      <EmptyState
        title="No posts found"
        description={query.searchTerm ? `Nothing matches “${query.searchTerm}”.` : "No posts yet."}
      />
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {res.data.map((post) => (
          <PostCard key={post.id} post={post} href={`/news/${post.id}`} />
        ))}
      </div>
      <Pagination
        page={res.meta?.page ?? Number(query.page)}
        limit={res.meta?.limit ?? PAGE_SIZE}
        total={res.meta?.total ?? res.data.length}
        basePath="/news"
        params={{ ...query, page: undefined, limit: undefined }}
      />
    </>
  );
}
