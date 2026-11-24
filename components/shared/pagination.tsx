import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Page numbers to show, with "…" gaps: 1 … 4 5 6 … 12 */
function pageList(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

export function Pagination({
  page,
  limit,
  total,
  basePath,
  params,
}: {
  page: number;
  limit: number;
  total: number;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;

  const hrefFor = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const edge = (disabled: boolean) =>
    cn(
      buttonVariants({ variant: "ghost", size: "sm" }),
      "text-muted-foreground hover:bg-primary/10 hover:text-primary",
      disabled && "pointer-events-none opacity-40",
    );

  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-col items-center gap-3">
      <div className="flex items-center gap-1">
        <Link href={hrefFor(page - 1)} className={edge(page <= 1)} aria-disabled={page <= 1}>
          <ChevronLeft /> <span className="hidden sm:inline">Previous</span>
        </Link>

        {pageList(page, totalPages).map((p, i) =>
          p === "gap" ? (
            <span key={`gap-${i}`} className="px-2 text-sm text-muted-foreground">
              …
            </span>
          ) : (
            <Link
              key={p}
              href={hrefFor(p)}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon-sm" }),
                p === page
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary",
              )}
            >
              {p}
            </Link>
          ),
        )}

        <Link href={hrefFor(page + 1)} className={edge(page >= totalPages)} aria-disabled={page >= totalPages}>
          <span className="hidden sm:inline">Next</span> <ChevronRight />
        </Link>
      </div>
      <p className="text-xs text-muted-foreground">
        Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
      </p>
    </nav>
  );
}
