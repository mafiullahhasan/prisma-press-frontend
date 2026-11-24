"use server";

import { createUploadTicket, type ImageKind, type UploadTicket } from "@/lib/cloudinary";
import { getCurrentUser } from "@/lib/data";

/** Returns a short-lived signed upload ticket for the logged-in user. */
export async function getUploadTicket(
  kind: ImageKind,
): Promise<{ ok: true; ticket: UploadTicket } | { ok: false; message: string }> {
  if (kind !== "thumbnail" && kind !== "profile") {
    return { ok: false, message: "Invalid upload type" };
  }
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please log in to upload images" };

  return { ok: true, ticket: createUploadTicket(kind, user.id) };
}
