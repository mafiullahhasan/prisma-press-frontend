"use client";

import { useActionState } from "react";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { checkoutAction } from "@/actions/subscriptionActions";

/** POST /api/subscription/checkout → Stripe Checkout */
export function SubscribeButton({ label = "Subscribe to Premium", size = "lg" }: { label?: string; size?: "default" | "lg" }) {
  const [state, action, pending] = useActionState(checkoutAction, null);
  useActionToast(state);

  return (
    <form action={action}>
      <Button type="submit" size={size} disabled={pending}>
        <Crown /> {pending ? "Redirecting to checkout…" : label}
      </Button>
    </form>
  );
}
