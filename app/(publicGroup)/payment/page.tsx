import Link from "next/link";
import { XCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SubscribeButton } from "@/components/subscription/subscribe-button";

// Stripe cancel_url → /payment?success=false
export default function PaymentPage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <XCircle className="size-7" />
      </div>
      <h1 className="font-heading text-2xl font-bold">Payment not completed</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Your checkout was cancelled and you have not been charged. You can try again any time.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <SubscribeButton label="Try again" size="default" />
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Back to home
        </Link>
      </div>
    </main>
  );
}
