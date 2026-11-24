"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useActionToast } from "@/hooks/use-action-toast";
import { useImageUpload } from "@/hooks/use-image-upload";
import { ImageUploadField } from "@/components/shared/image-upload-field";
import { TagInput } from "@/components/shared/tag-input";
import { createPostAction, updatePostAction } from "@/actions/postActions";
import type { ActionState, Post } from "@/lib/types";

const STATUS_OPTIONS = [
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT", label: "Draft" },
  { value: "ARCHIVE", label: "Archive" },
];

/**
 * Create: POST /api/posts
 * Edit:   PATCH /api/posts/:id (isPremium is not editable per backend contract)
 */
export function PostForm({
  post,
  canCreatePremium = false,
  redirectTo = "/dashboard/my-posts",
}: {
  post?: Post;
  canCreatePremium?: boolean;
  redirectTo?: string;
}) {
  const isEdit = !!post;
  const serverAction = isEdit ? updatePostAction.bind(null, post.id, redirectTo) : createPostAction;
  const thumbnail = useImageUpload({ kind: "thumbnail", initialUrl: post?.thumbnail, maxSizeMB: 5 });

  // Upload the image first (with progress), then hand its URL to the Server Action.
  const [state, action, pending] = useActionState(
    async (prev: ActionState, formData: FormData): Promise<ActionState> => {
      try {
        formData.set("thumbnail", await thumbnail.resolveUrl());
      } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : "Image upload failed" };
      }
      const result = await serverAction(prev, formData);
      thumbnail.finish(!!result?.success);
      return result;
    },
    null,
  );
  useActionToast(state);

  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={post?.title} required minLength={3} maxLength={255} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="content">Content</Label>
        <Textarea id="content" name="content" defaultValue={post?.content} required minLength={10} rows={12} className="min-h-48 sm:min-h-64" />
      </div>

      <ImageUploadField
        label="Thumbnail"
        hint="JPG, PNG or WebP · up to 5 MB · 16:9 looks best"
        upload={thumbnail}
        disabled={pending}
      />

      <TagInput name="tags" label="Tags" defaultValue={post?.tags} placeholder="e.g. typescript" disabled={pending} />

      <div className="grid items-start gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" items={STATUS_OPTIONS} defaultValue={post?.status ?? "PUBLISHED"}>
            <SelectTrigger id="status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <fieldset className="grid gap-2">
          {/* Same look as <Label> so both columns line up */}
          <legend className="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 mb-2">Options</legend>
          <div className="flex flex-col gap-3 rounded-2xl border p-4">
          <label className="flex items-center gap-3 text-sm">
            <Checkbox name="isFeatured" defaultChecked={post?.isFeatured} />
            <span>
              <span className="font-medium">Featured</span>
              <span className="block text-xs text-muted-foreground">Highlight this post.</span>
            </span>
          </label>

          {!isEdit && (
            <label className="flex items-center gap-3 text-sm">
              <Checkbox name="isPremium" disabled={!canCreatePremium} />
              <span>
                <span className="font-medium">Premium</span>
                <span className="block text-xs text-muted-foreground">
                  {canCreatePremium ? (
                    "Only subscribers can read it."
                  ) : (
                    <>
                      Requires an active subscription.{" "}
                      <Link href="/dashboard/subscription" className="text-primary hover:underline">
                        Subscribe
                      </Link>
                    </>
                  )}
                </span>
              </span>
            </label>
          )}
          </div>
        </fieldset>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link href={redirectTo} className={buttonVariants({ variant: "ghost", className: "w-full sm:w-auto" })}>
          Cancel
        </Link>
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {thumbnail.progress !== null && thumbnail.progress < 100
            ? `Uploading ${thumbnail.progress}%`
            : pending
              ? "Saving…"
              : isEdit
                ? "Update post"
                : "Publish post"}
        </Button>
      </div>
    </form>
  );
}
