"use server";

import { refresh } from "next/cache";
import { api } from "@/lib/api";
import { deleteImage, publicIdFromUrl } from "@/lib/cloudinary";
import { getCurrentUser } from "@/lib/data";
import type { ActionState, User } from "@/lib/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** PUT /api/users/my-profile */
export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const bio = String(formData.get("bio") ?? "").trim();
  const profilePhoto = String(formData.get("profilePhoto") ?? "").trim();

  if (name.length < 2) return { success: false, message: "Name must be at least 2 characters" };
  if (!EMAIL_RE.test(email)) return { success: false, message: "Enter a valid email" };
  if (bio.length > 500) return { success: false, message: "Bio must be 500 characters or less" };
  if (profilePhoto && !URL.canParse(profilePhoto))
    return { success: false, message: "Profile photo must be a valid URL" };

  const previousPhoto = (await getCurrentUser())?.profile?.profilePhoto;

  const res = await api<User>("/api/users/my-profile", {
    method: "PUT",
    body: { name, email, bio, profilePhoto },
  });

  if (!res.success) {
    // Drop a freshly uploaded photo so it isn't left orphaned — but never when
    // it overwrote the user's existing photo (same public_id).
    const newId = publicIdFromUrl(profilePhoto);
    if (newId && newId !== publicIdFromUrl(previousPhoto)) await deleteImage(profilePhoto);
    return { success: false, message: res.message || "Update failed" };
  }

  // New uploads overwrite profiles/<userId> in place. Delete only when the photo
  // was removed or now points to a different asset (e.g. an older upload).
  const previousId = publicIdFromUrl(previousPhoto);
  if (previousId && previousId !== publicIdFromUrl(profilePhoto)) await deleteImage(previousPhoto);

  refresh();
  return { success: true, message: res.message || "Profile updated" };
}
