"use client";

import { useActionState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useActionToast } from "@/hooks/use-action-toast";
import { createCommentAction } from "@/actions/commentActions";

/** POST /api/comments */
export function CommentForm({ postId }: { postId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(createCommentAction.bind(null, postId), null);
  useActionToast(state, () => formRef.current?.reset());

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <Textarea
        name="content"
        placeholder="Share your thoughts…"
        required
        maxLength={2000}
        rows={3}
        aria-label="Write a comment"
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Posting…" : "Post comment"}
        </Button>
      </div>
    </form>
  );
}
