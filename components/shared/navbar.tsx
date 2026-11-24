"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Command,
  User as UserIcon,
  CreditCard,
  LogOut,
  LayoutDashboard,
  FileText,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { logoutUser } from "@/service/logoutUser";
import { getUserProfile } from "@/service/getUserProfile";
import { initials } from "@/lib/format";
import type { User } from "@/lib/types";

export type { User };

const publicNav = [
  { title: "Home", href: "/" },
  { title: "News", href: "/news" },
  { title: "Premium", href: "/premium" },
];

const userMenuItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Profile", href: "/dashboard/profile", icon: UserIcon },
  { title: "My Posts", href: "/dashboard/my-posts", icon: FileText },
  { title: "My Comments", href: "/dashboard/my-comments", icon: MessageSquare },
  { title: "Subscription", href: "/dashboard/subscription", icon: CreditCard },
];

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [user, setUser] = useState<User | null>(null);

  // Layouts persist across navigations, so re-check the session whenever the
  // route changes (e.g. right after login/logout redirects).
  useEffect(() => {
    let isMounted = true;
    getUserProfile()
      .then((profile) => {
        if (isMounted) setUser(profile ?? null);
      })
      .catch(() => {
        if (isMounted) setUser(null);
      });
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const navItems = [
    ...publicNav,
    ...(user ? [{ title: "Dashboard", href: "/dashboard" }] : []),
    ...(user?.role === "ADMIN" ? [{ title: "Admin", href: "/admin-dashboard" }] : []),
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname?.startsWith(`${href}/`);

  const handleLogout = () => {
    startTransition(async () => {
      setUser(null);
      await logoutUser();
    });
  };

  const linkClass = (href: string) =>
    cn(
      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
      isActive(href)
        ? "bg-accent text-accent-foreground"
        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
    );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold tracking-tight transition-opacity hover:opacity-90"
        >
          <span className="font-heading text-lg font-bold text-primary sm:text-2xl">Prisma Press</span>
        </Link>

        <nav aria-label="Main Navigation" className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={linkClass(item.href)}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    className="flex h-10 w-10 items-center gap-2 rounded-full hover:bg-accent"
                    aria-label="Open user menu"
                  >
                    <Avatar className="h-8 w-8 border">
                      <AvatarImage src={user.profile?.profilePhoto || ""} alt={user.name} />
                      <AvatarFallback className="text-xs">{initials(user.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                }
              />

              <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {userMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem
                        key={item.href}
                        render={
                          <Link href={item.href} className="flex w-full cursor-pointer items-center">
                            <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{item.title}</span>
                          </Link>
                        }
                      />
                    );
                  })}
                  {user.role === "ADMIN" && (
                    <DropdownMenuItem
                      render={
                        <Link href="/admin-dashboard" className="flex w-full cursor-pointer items-center">
                          <ShieldCheck className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>Admin Dashboard</span>
                        </Link>
                      }
                    />
                  )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={isPending}
                  className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{isPending ? "Logging out..." : "Log out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/register" className={buttonVariants({ variant: "ghost" })}>
                Register
              </Link>
              <Link href="/login" className={buttonVariants()}>
                Login
              </Link>
            </div>
          )}

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Toggle navigation menu">
                  <Menu className="h-5 w-5" />
                </Button>
              }
            />

            <SheetContent side="right" className="flex w-72 flex-col justify-between sm:w-80">
              <div>
                <SheetHeader className="border-b pb-4 text-left">
                  <SheetTitle className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                      <Command className="h-4 w-4" />
                    </div>
                    <span>Prisma Press</span>
                  </SheetTitle>
                </SheetHeader>

                <nav aria-label="Mobile Navigation" className="mt-4 flex flex-col gap-1 px-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={linkClass(item.href)}
                    >
                      {item.title}
                    </Link>
                  ))}
                </nav>
              </div>

              {!user && (
                <div className="flex flex-col gap-2 p-4">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={buttonVariants({ className: "w-full" })}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={buttonVariants({ variant: "outline", className: "w-full" })}
                  >
                    Register
                  </Link>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
