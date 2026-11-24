"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import type { ActionState } from "@/lib/types";

/** POST /api/subscription/checkout → redirects the browser to Stripe Checkout */
export async function checkoutAction(): Promise<ActionState> {
  const res = await api<{ paymentUrl: string | null }>("/api/subscription/checkout", {
    method: "POST",
  });

  if (res.statusCode === 401) redirect("/login?next=/dashboard/subscription");

  const url = res.data?.paymentUrl;
  if (!res.success || !url) {
    return { success: false, message: res.message || "Could not start checkout" };
  }

  // Only follow Stripe-hosted checkout URLs.
  if (!url.startsWith("https://checkout.stripe.com/")) {
    return { success: false, message: "Unexpected payment URL from server" };
  }

  redirect(url);
}

/** POST /api/subscription/cancel — cancels at period end */
export async function cancelSubscriptionAction(): Promise<ActionState> {
  const res = await api<{ cancelAtPeriodEnd: boolean; currentPeriodEnd: string }>(
    "/api/subscription/cancel",
    { method: "POST" },
  );
  if (!res.success) return { success: false, message: res.message || "Could not cancel" };

  refresh();
  return { success: true, message: res.message || "Cancellation scheduled" };
}
