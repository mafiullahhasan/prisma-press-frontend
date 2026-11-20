"use server";

import { cookies } from "next/headers";

export const getUserProfile = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  try {
    const res = await fetch(`${process.env.BACKEND_API_URL}/api/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "force-cache",
      next: { 
        revalidate: 60 * 60 * 24 // 1day
       }, 
    });
    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};
