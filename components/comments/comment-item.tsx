"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Ban, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { useActionToast } from "@/hooks/use-action-toast";
import {
  deleteCommentAction,
  moderateCommentAction,
  updateCommentAction,
} from "@/actions/commentActions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate, initials } from "@/lib/format";
import type { Comment } from "@/lib/types";

export function CommentItem({
  comment,
  isOwner,
  isAdmin,
  authorLabel,
  showPostLink = false,
}: {
  comment: Comment;
  isOwner: boolean;
  isAdmin: boolean;
  authorLabel: string;
  showPostLink?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const canManage = isOwner || isAdmin;

  return (
    <li className="rounded-xl border p-3 sm:p-4">
      <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          {comment.author && (
            <Avatar className="size-7 border">
              <AvatarImage src={comment.author.profile?.profilePhoto || ""} alt={comment.author.name} />
              <AvatarFallback className="text-[10px]">{initials(comment.author.name)}</AvatarFallback>
            </Avatar>
          )}
          <span className="font-medium">{authorLabel}</span>
          <span className="text-muted-foreground">· {formatDate(comment.createdAt)}</span>
          {comment.updatedAt !== comment.createdAt && (
            <span className="text-xs text-muted-foreground">(edited)</span>
          )}
          {comment.status === "REJECT" && <Badge variant="destructive">Rejected</Badge>}
        </div>

        <div className="-ml-2 flex flex-wrap items-center gap-1 sm:ml-0">
          {showPostLink && (
            <Link
              href={`/dashboard/my-comments/${comment.id}`}
              className={buttonVariants({ variant: "ghost", size: "xs" })}
            >
              <ExternalLink /> Details
            </Link>
          )}
          {isOwner && !editing && (
            <Button variant="ghost" size="xs" onClick={() => setEditing(true)}>
              <Pencil /> Edit
            </Button>
          )}
          {isAdmin && comment.status === "APPROVED" && (
            <ConfirmAction
              trigger={
                <Button variant="ghost" size="xs">
                  <Ban /> Reject
                </Button>
              }
              title="Reject this comment?"
              description="The comment will be hidden from readers (status → REJECT)."
              confirmLabel="Reject"
              action={() => moderateCommentAction(comment.id)}
            />
          )}
          {canManage && (
            <ConfirmAction
              trigger={
                <Button variant="ghost" size="xs" className="text-destructive">
                  <Trash2 /> Delete
                </Button>
              }
              title="Delete this comment?"
              description="This cannot be undone."
              confirmLabel="Delete"
              action={() => deleteCommentAction(comment.id)}
            />
          )}
        </div>
      </div>

      {editing ? (
        <EditCommentForm comment={comment} onDone={() => setEditing(false)} />
      ) : (
        <p className="whitespace-pre-line text-sm">{comment.content}</p>
      )}

      {showPostLink && comment.post && (
        <p className="mt-2 text-xs text-muted-foreground">
          On{" "}
          <Link href={`/news/${comment.post.id}`} className="font-medium text-foreground hover:underline">
            {comment.post.title}
          </Link>
        </p>
      )}
    </li>
  );
}

/** PATCH /api/comments/:id */
export function EditCommentForm({ comment, onDone }: { comment: Comment; onDone?: () => void }) {
  const [state, action, pending] = useActionState(updateCommentAction.bind(null, comment.id), null);
  useActionToast(state, onDone);

  return (
    <form action={action} className="space-y-2">
      <Textarea name="content" defaultValue={comment.content} required maxLength={2000} rows={3} />
      <div className="flex justify-end gap-2">
        {onDone && (
          <Button type="button" variant="ghost" size="sm" onClick={onDone} disabled={pending}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}
