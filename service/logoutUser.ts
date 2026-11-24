"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/api";

// The backend has no logout endpoint (tokens are stateless JWTs),
// so logging out = deleting our httpOnly cookies.
export const logoutUser = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
  redirect("/login");
};
