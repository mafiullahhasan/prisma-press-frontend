import { NextResponse, type NextRequest } from "next/server";

// Optimistic check only (cookie presence). Real authorization happens on the
// backend and in requireUser() on each protected page.
const PROTECTED = ["/dashboard", "/admin-dashboard", "/author-dashboard"];
const AUTH_PAGES = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession =
    request.cookies.has("accessToken") || request.cookies.has("refreshToken");

  if (!hasSession && PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  if (hasSession && request.cookies.has("accessToken") && AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin-dashboard/:path*", "/author-dashboard/:path*", "/login", "/register"],
};
