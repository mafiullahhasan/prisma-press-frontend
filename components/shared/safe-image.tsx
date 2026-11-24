"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * <img> that swaps to a theme gradient when the URL is missing or fails to load
 * (user-supplied URLs like https://example.com/thumbnail.jpg often 404).
 */
export function SafeImage({
  src,
  alt = "",
  className,
  loading = "lazy",
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // A server-rendered <img> can fail before hydration, so React never sees onError.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0 && src) setFailedSrc(src);
  }, [src]);

  if (!src || failedSrc === src) {
    return <div aria-hidden className={cn("bg-linear-to-br from-primary/20 via-primary/5 to-muted", className)} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={imgRef} src={src} alt={alt} loading={loading} onError={() => setFailedSrc(src)} className={cn("bg-muted object-cover", className)} />
  );
}
