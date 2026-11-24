"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import type { ActionState } from "@/lib/types";

/** Shows a toast whenever a useActionState result changes. */
export function useActionToast(state: ActionState, onSuccess?: () => void) {
  useEffect(() => {
    if (!state) return;
    if (state.success) {
      toast.success(state.message);
      onSuccess?.();
    } else {
      toast.error(state.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
}
