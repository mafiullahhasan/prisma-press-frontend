"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
import { useImageUpload } from "@/hooks/use-image-upload";
import { ImageUploadField } from "@/components/shared/image-upload-field";
import { updateProfileAction } from "@/actions/userActions";
import type { ActionState, User } from "@/lib/types";

/** PUT /api/users/my-profile */
export function ProfileForm({ user }: { user: User }) {
  const photo = useImageUpload({ kind: "profile", initialUrl: user.profile?.profilePhoto, maxSizeMB: 2 });

  const [state, action, pending] = useActionState(
    async (prev: ActionState, formData: FormData): Promise<ActionState> => {
      try {
        formData.set("profilePhoto", await photo.resolveUrl());
      } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : "Image upload failed" };
      }
      const result = await updateProfileAction(prev, formData);
      photo.finish(!!result?.success);
      return result;
    },
    null,
  );
  useActionToast(state);

  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={user.name} required minLength={2} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={user.email} required />
      </div>
      <ImageUploadField
        label="Profile photo"
        hint="JPG, PNG or WebP · up to 2 MB · square looks best"
        upload={photo}
        shape="circle"
        disabled={pending}
      />
      <div className="grid gap-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          rows={4}
          maxLength={500}
          placeholder="Tell readers about yourself"
          defaultValue={user.profile?.bio ?? ""}
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {photo.progress !== null && photo.progress < 100
            ? `Uploading ${photo.progress}%`
            : pending
              ? "Saving…"
              : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
