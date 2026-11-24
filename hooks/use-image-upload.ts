"use client";

import { useEffect, useRef, useState } from "react";
import { getUploadTicket } from "@/actions/uploadActions";

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type Options = {
  kind: "thumbnail" | "profile";
  initialUrl?: string | null;
  maxSizeMB: number;
};

/**
 * Keeps the chosen file locally (preview only) and uploads it to Cloudinary
 * when the form is submitted — so cancelling a form never leaves orphan files.
 */
export function useImageUpload({ kind, initialUrl, maxSizeMB }: Options) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [removed, setRemoved] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const objectUrl = useRef<string | null>(null);
  // URL of a file already uploaded in this session (avoids re-uploading on a retry/second save)
  const uploadedUrl = useRef<string | null>(null);
  const [uploaded, setUploaded] = useState(false);

  // Free the local preview URL when it is replaced or the component unmounts.
  useEffect(() => () => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
  }, []);

  function select(next: File | null | undefined) {
    if (!next) return;
    if (!ACCEPTED_TYPES.includes(next.type)) {
      setError("Only JPG, PNG or WebP images are allowed");
      return;
    }
    if (next.size > maxSizeMB * 1024 * 1024) {
      setError(`Image must be ${maxSizeMB} MB or smaller`);
      return;
    }
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = URL.createObjectURL(next);
    setError(null);
    setFile(next);
    setPreview(objectUrl.current);
    setRemoved(false);
    uploadedUrl.current = null;
    setUploaded(false);
  }

  function remove() {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = null;
    setFile(null);
    setPreview(null);
    setRemoved(true);
    uploadedUrl.current = null;
    setUploaded(false);
    setError(null);
  }

  /**
   * Final value for the form field:
   * removed → "" · already uploaded → that URL · new file → upload it · untouched → initial URL
   */
  async function resolveUrl(): Promise<string> {
    if (removed) return "";
    if (uploadedUrl.current) return uploadedUrl.current;
    if (!file) return initialUrl ?? "";

    const res = await getUploadTicket(kind);
    if (!res.ok) throw new Error(res.message);

    const url = await uploadWithProgress(file, res.ticket, setProgress);
    uploadedUrl.current = url;
    setUploaded(true);
    return url;
  }

  return {
    preview,
    progress,
    error,
    hasNewFile: !!file && !uploaded,
    select,
    remove,
    resolveUrl,
    /** Call after the save finished. On failure the server may have deleted the
     *  uploaded file, so forget it and re-upload the kept file on the next try. */
    finish: (success: boolean) => {
      setProgress(null);
      if (!success) {
        uploadedUrl.current = null;
        setUploaded(false);
      }
    },
  };
}

function uploadWithProgress(
  file: File,
  ticket: { uploadUrl: string; fields: Record<string, string> },
  onProgress: (percent: number | null) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const body = new FormData();
    for (const [key, value] of Object.entries(ticket.fields)) body.append(key, value);
    body.append("file", file);

    // XHR (not fetch) because only XHR reports upload progress.
    const xhr = new XMLHttpRequest();
    xhr.open("POST", ticket.uploadUrl);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.min(99, Math.round((e.loaded / e.total) * 100)));
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) {
          onProgress(100);
          resolve(data.secure_url as string);
        } else {
          onProgress(null);
          reject(new Error(data?.error?.message ?? "Image upload failed"));
        }
      } catch {
        onProgress(null);
        reject(new Error("Image upload failed"));
      }
    };
    xhr.onerror = () => {
      onProgress(null);
      reject(new Error("Network error while uploading image"));
    };

    onProgress(0);
    xhr.send(body);
  });
}
