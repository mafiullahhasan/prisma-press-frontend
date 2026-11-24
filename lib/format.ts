export function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function excerpt(text: string, length = 140) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > length ? `${clean.slice(0, length).trimEnd()}…` : clean;
}

export function initials(name?: string) {
  if (!name) return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Reads a string value from Next.js searchParams. */
export function param(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/** Posts per page on public listings (4 columns x 2 rows). */
export const PAGE_SIZE = 8;
