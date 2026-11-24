"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { deletePostAction } from "@/actions/postActions";

/** Edit + Delete buttons for a post owner or an admin. */
export function PostOwnerActions({
  postId,
  postTitle,
  editHref,
  redirectAfterDelete,
  size = "sm",
}: {
  postId: string;
  postTitle: string;
  editHref: string;
  redirectAfterDelete?: string;
  size?: "sm" | "xs";
}) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <Link href={editHref} className={buttonVariants({ variant: "outline", size })}>
        <Pencil /> Edit
      </Link>
      <ConfirmAction
        trigger={
          <Button variant="destructive" size={size}>
            <Trash2 /> Delete
          </Button>
        }
        title="Delete this post?"
        description={`“${postTitle}” and all of its comments will be permanently deleted.`}
        confirmLabel="Delete"
        action={() => deletePostAction(postId)}
        onSuccess={redirectAfterDelete ? () => router.replace(redirectAfterDelete) : undefined}
      />
    </div>
  );
}
