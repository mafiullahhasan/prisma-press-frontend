"use server";

import { getCurrentUser } from "@/lib/data";
import type { User } from "@/lib/types";

// Called from the client Navbar. Never cached: the response is per-user.
export const getUserProfile = async (): Promise<User | null> => {
  return getCurrentUser();
};
