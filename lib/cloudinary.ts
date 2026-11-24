import "server-only";
import { randomUUID } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const ROOT = "prisma-press";

export type ImageKind = "thumbnail" | "profile";

export const FOLDERS: Record<ImageKind, string> = {
  thumbnail: `${ROOT}/thumbnails`,
  profile: `${ROOT}/profiles`,
};

/** Everything the browser needs to upload straight to Cloudinary. */
export type UploadTicket = {
  uploadUrl: string;
  fields: Record<string, string>; // send all of these + `file` as multipart/form-data
};

/**
 * Builds a signed upload ticket. The API secret never leaves the server;
 * Cloudinary rejects the upload if any signed field is changed by the client.
 *
 * - profile:   fixed id per user  → re-upload overwrites, never duplicates
 * - thumbnail: `<userId>-<uuid>`  → owner prefix lets us safely clean up later
 */
export function createUploadTicket(kind: ImageKind, userId: string): UploadTicket {
  const params: Record<string, string> = {
    timestamp: String(Math.floor(Date.now() / 1000)),
    folder: FOLDERS[kind],
    public_id: kind === "profile" ? userId : `${userId}-${randomUUID()}`,
    allowed_formats: "jpg,jpeg,png,webp",
    // Incoming transformation: cap stored size so huge photos don't bloat storage
    transformation: kind === "profile" ? "c_limit,h_800,w_800" : "c_limit,h_1600,w_1600",
  };
  if (kind === "profile") {
    params.overwrite = "true";
    params.invalidate = "true"; // purge CDN cache for the replaced image
  }

  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!);

  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    fields: { ...params, signature, api_key: process.env.CLOUDINARY_API_KEY! },
  };
}

/**
 * Extracts the public_id from one of OUR delivery URLs, or null for anything
 * else (other hosts, other clouds, or assets outside the prisma-press folder).
 * e.g. https://res.cloudinary.com/<cloud>/image/upload/v123/prisma-press/thumbnails/abc.jpg
 *      → prisma-press/thumbnails/abc
 */
export function publicIdFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.hostname !== "res.cloudinary.com") return null;

  const prefix = `/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/`;
  if (!parsed.pathname.startsWith(prefix)) return null;

  const rest = decodeURIComponent(parsed.pathname.slice(prefix.length))
    .replace(/^v\d+\//, "") // version segment
    .replace(/\.[a-z0-9]+$/i, ""); // extension

  return rest.startsWith(`${ROOT}/`) ? rest : null;
}

/** True when the URL is a thumbnail this user uploaded (owner-prefixed id). */
export function isOwnThumbnail(url: string | null | undefined, userId: string) {
  const id = publicIdFromUrl(url);
  return !!id && id.startsWith(`${FOLDERS.thumbnail}/${userId}-`);
}

/** Deletes one of our images. Never throws — cleanup must not break the user's action. */
export async function deleteImage(url: string | null | undefined) {
  const publicId = publicIdFromUrl(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { invalidate: true });
  } catch (error) {
    console.error("Cloudinary delete failed:", publicId, error);
  }
}
