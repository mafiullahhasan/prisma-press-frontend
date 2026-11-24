import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { param } from "@/lib/format";
import { LoginForm } from "../_components/LoginForm";

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <div className="flex min-h-screen items-center justify-center py-10">
      <div className="w-full max-w-md space-y-6 rounded-2xl border p-6 shadow-lg sm:p-8">
        <div className="space-y-2 text-center">
          <Link href="/" className="font-heading text-sm font-semibold text-primary">
            Prisma Press
          </Link>
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground">Enter your email below to login to your account</p>
        </div>

        <Suspense fallback={<LoginForm />}>
          <LoginWithParams searchParams={searchParams} />
        </Suspense>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

async function LoginWithParams({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const sp = await searchParams;
  const registered = param(sp.registered) === "1";

  return (
    <>
      {registered && (
        <p className="mb-4 flex items-center gap-2 rounded-md bg-primary/10 p-3 text-sm text-primary">
          <CheckCircle2 className="size-4" /> Account created. Please log in.
        </p>
      )}
      <LoginForm next={param(sp.next)} />
    </>
  );
}
