import { Suspense } from "react";
import Link from "next/link";
import { Check, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BlockSkeleton, PageHeader } from "@/components/shared/feedback";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { SubscribeButton } from "@/components/subscription/subscribe-button";
import { cancelSubscriptionAction } from "@/actions/subscriptionActions";
import { api } from "@/lib/api";
import { requireUser } from "@/lib/data";
import { formatDate } from "@/lib/format";
import type { SubscriptionInfo } from "@/lib/types";

const perks = ["Unlimited premium articles", "Publish premium posts", "Cancel anytime"];

export default function SubscriptionPage() {
  return (
    <>
      <PageHeader title="Subscription" description="Manage your Prisma Press Premium plan." />
      <Suspense fallback={<BlockSkeleton rows={3} />}>
        <Subscription />
      </Suspense>
    </>
  );
}

async function Subscription() {
  await requireUser();
  // GET /api/subscription/status — 404 means the user never subscribed.
  const res = await api<SubscriptionInfo>("/api/subscription/status");
  const sub = res.success ? res.data : null;
  const neverSubscribed = res.statusCode === 404;

  if (!res.success && !neverSubscribed) {
    return <p className="text-sm text-destructive">{res.message}</p>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Current plan
            {sub?.isSubscribed ? <Badge>Premium</Badge> : <Badge variant="outline">Free</Badge>}
          </CardTitle>
          <CardDescription>
            {neverSubscribed && "You don't have a subscription yet."}
            {sub?.isSubscribed && `Your premium access is active until ${formatDate(sub.currentPeriodEnd)}.`}
            {sub && !sub.isSubscribed && `Your subscription is ${sub.status.toLowerCase()}.`}
          </CardDescription>
        </CardHeader>
        {sub && (
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className="font-medium">{sub.status}</p>
            </div>
            <div>
              <p className="text-muted-foreground">
                {sub.status === "ACTIVE" ? "Renews / ends" : "Period ended"}
              </p>
              <p className="font-medium">{formatDate(sub.currentPeriodEnd)}</p>
            </div>
          </CardContent>
        )}
        <CardFooter className="flex flex-wrap gap-2">
          {sub?.isSubscribed ? (
            <>
              <Link href="/premium" className={buttonVariants()}>
                <Crown /> Read premium
              </Link>
              <ConfirmAction
                trigger={<Button variant="destructive">Cancel subscription</Button>}
                title="Cancel your subscription?"
                description={`You'll keep premium access until ${formatDate(sub.currentPeriodEnd)}, then it won't renew.`}
                confirmLabel="Cancel at period end"
                action={cancelSubscriptionAction}
              />
            </>
          ) : (
            <SubscribeButton size="default" />
          )}
        </CardFooter>
      </Card>

      <Card className="border-primary/40 bg-linear-to-b from-primary/10 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="size-5 text-primary" /> Prisma Press Premium
          </CardTitle>
          <CardDescription>Secure payment via Stripe.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-2">
                <Check className="size-4 text-primary" /> {perk}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
