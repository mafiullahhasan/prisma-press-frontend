"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  LayoutDashboard,
  MessageSquare,
  PenSquare,
  ShieldCheck,
  User,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/my-posts", label: "My Posts", icon: FileText, exact: true },
  { href: "/dashboard/my-posts/new", label: "New Post", icon: PenSquare },
  { href: "/dashboard/my-comments", label: "My Comments", icon: MessageSquare },
  { href: "/dashboard/subscription", label: "Subscription", icon: CreditCard },
];

export function DashboardSidebar({ adminSlot }: { adminSlot?: ReactNode }) {
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  // Which directions still have hidden tabs (mobile horizontal bar only).
  const updateArrows = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;
    const max = nav.scrollWidth - nav.clientWidth;
    setCanLeft(nav.scrollLeft > 4);
    setCanRight(nav.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    updateArrows();
    nav.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    // The Admin tab streams in later (Suspense) — re-measure when tabs change.
    const observer = new MutationObserver(updateArrows);
    observer.observe(nav, { childList: true, subtree: true });
    return () => {
      nav.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
      observer.disconnect();
    };
  }, [updateArrows]);

  // Center the active tab inside the bar (scrolls only the bar, never the page).
  useEffect(() => {
    const nav = navRef.current;
    const active = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !active || nav.scrollWidth <= nav.clientWidth) return;
    nav.scrollTo({ left: active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2, behavior: "smooth" });
  }, [pathname]);

  const scrollBy = (direction: 1 | -1) => {
    const nav = navRef.current;
    nav?.scrollBy({ left: direction * nav.clientWidth * 0.6, behavior: "smooth" });
  };

  return (
    <div className="relative -mx-4 border-b bg-background/90 backdrop-blur-md sm:-mx-6 md:mx-0 md:border-0 md:bg-transparent md:backdrop-blur-none">
      <nav
        ref={navRef}
        aria-label="Dashboard"
        className="no-scrollbar flex snap-x gap-1.5 overflow-x-auto scroll-px-12 px-4 py-2 sm:px-6 md:snap-none md:flex-col md:gap-1 md:overflow-visible md:p-0"
      >
        {links.map((link) => (
          <SidebarLink key={link.href} {...link} />
        ))}
        {adminSlot}
      </nav>

      {/* Mobile carousel controls: fade edge + arrow, shown only when more tabs exist that way */}
      <ScrollArrow side="left" visible={canLeft} onClick={() => scrollBy(-1)} />
      <ScrollArrow side="right" visible={canRight} onClick={() => scrollBy(1)} />
    </div>
  );
}

function ScrollArrow({
  side,
  visible,
  onClick,
}: {
  side: "left" | "right";
  visible: boolean;
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-y-0 flex w-14 items-center transition-opacity duration-200 md:hidden",
        side === "left"
          ? "left-0 justify-start bg-linear-to-r from-background via-background/90 to-transparent pl-2"
          : "right-0 justify-end bg-linear-to-l from-background via-background/90 to-transparent pr-2",
        visible ? "opacity-100" : "opacity-0",
      )}
    >
      <button
        type="button"
        onClick={onClick}
        tabIndex={visible ? 0 : -1}
        aria-hidden={!visible}
        aria-label={side === "left" ? "Show previous tabs" : "Show more tabs"}
        className={cn(
          "flex size-8 items-center justify-center rounded-full border border-primary/20 bg-background text-primary shadow-md shadow-primary/10 transition-transform active:scale-90",
          visible && "pointer-events-auto",
        )}
      >
        <Icon className="size-4" />
      </button>
    </div>
  );
}

export function SidebarLink({
  href,
  label,
  icon: Icon,
  exact,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex shrink-0 snap-start items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors md:rounded-lg md:px-3",
        active
          ? "bg-primary text-primary-foreground md:bg-primary/10 md:text-primary"
          : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground md:bg-transparent",
      )}
    >
      <Icon className="size-4" /> {label}
    </Link>
  );
}

export function AdminSidebarLink() {
  return <SidebarLink href="/admin-dashboard" label="Admin" icon={ShieldCheck} />;
}
