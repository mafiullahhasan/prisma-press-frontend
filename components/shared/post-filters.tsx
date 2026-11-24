"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SORTS = [
  { value: "createdAt:desc", label: "Newest" },
  { value: "createdAt:asc", label: "Oldest" },
  { value: "views:desc", label: "Most viewed" },
  { value: "title:asc", label: "Title A–Z" },
];

/** Drives searchTerm, sortBy, sortOrder via the URL (backend query params). Page size is fixed. */
export function PostFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const currentSort = `${searchParams.get("sortBy") ?? "createdAt"}:${searchParams.get("sortOrder") ?? "desc"}`;

  function apply(formData: FormData) {
    const sp = new URLSearchParams(searchParams.toString());
    const term = String(formData.get("searchTerm") ?? "").trim();
    const [sortBy, sortOrder] = String(formData.get("sort") ?? "createdAt:desc").split(":");

    if (term) sp.set("searchTerm", term);
    else sp.delete("searchTerm");
    sp.set("sortBy", sortBy);
    sp.set("sortOrder", sortOrder);
    sp.delete("limit");
    sp.delete("page"); // new filter → first page

    startTransition(() => router.push(`${pathname}?${sp.toString()}`));
  }

  return (
    // key: remount when the URL changes so the uncontrolled fields pick up new defaults
    <form key={searchParams.toString()} action={apply} className="mb-8 flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="searchTerm"
          defaultValue={searchParams.get("searchTerm") ?? ""}
          placeholder="Search title or content…"
          className="pl-9"
          aria-label="Search posts"
        />
      </div>
      <Select name="sort" items={SORTS} defaultValue={currentSort}>
        <SelectTrigger aria-label="Sort" className="w-full sm:w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORTS.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" disabled={pending}>
        {pending ? "Searching…" : "Apply"}
      </Button>
    </form>
  );
}
