import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Crown } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PostCard } from "@/components/shared/post-card";
import { EmptyState, ErrorState, PostGridSkeleton } from "@/components/shared/feedback";
import { getPosts } from "@/lib/data";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <section className="py-16 text-center sm:py-24">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">Prisma Press</p>
        <h1 className="mx-auto max-w-3xl font-heading text-4xl font-bold tracking-tight sm:text-6xl">
          Stories, tutorials and ideas worth reading
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
          Read free articles from the community, share your own, and unlock premium posts with a
          subscription.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/news" className={buttonVariants({ size: "lg" })}>
            Browse news <ArrowRight />
          </Link>
          <Link href="/premium" className={buttonVariants({ size: "lg", variant: "outline" })}>
            <Crown /> Premium posts
          </Link>
        </div>
      </section>

      <section className="pb-20">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-heading text-2xl font-bold">Latest posts</h2>
          <Link href="/news" className={buttonVariants({ variant: "link" })}>
            View all <ArrowRight />
          </Link>
        </div>
        <Suspense fallback={<PostGridSkeleton />}>
          <LatestPosts />
        </Suspense>
      </section>
    </main>
  );
}

async function LatestPosts() {
  const res = await getPosts({ limit: "8", sortBy: "createdAt", sortOrder: "desc" });

  if (!res.success) return <ErrorState message={res.message} />;
  const posts = res.data;
  if (!posts.length) return <EmptyState title="No posts yet" description="Check back soon." />;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} href={`/news/${post.id}`} />
      ))}
    </div>
  );
}
