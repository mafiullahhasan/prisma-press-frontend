import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-1 flex-col items-center justify-center px-4 text-center">
      <p className="font-heading text-6xl font-bold text-primary">404</p>
      <h1 className="mt-3 text-xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The page or post you&apos;re looking for doesn&apos;t exist or was removed.
      </p>
      <Link href="/" className={buttonVariants({ className: "mt-6" })}>
        Go home
      </Link>
    </div>
  );
}
