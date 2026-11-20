"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const logoutUser = async () => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    // Optional: Jodi tomar backend-e kono logout API thake, tahobe token invalidate korar jonno eta call korte paro
    
    await fetch(`${process.env.BACKEND_API_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    

    // Cookies delete kora
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");

  } catch (error) {
    console.error("Error during logout:", error);
  } finally {
    // Logout er por user-ke login page-e redirect kore dewa
    redirect("/login");
  }
};