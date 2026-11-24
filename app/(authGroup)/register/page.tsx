import Link from "next/link";
import RegisterForm from "../_components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center py-10">
      <div className="w-full max-w-md space-y-6 rounded-2xl border p-6 shadow-lg sm:p-8">
        <div className="space-y-2 text-center">
          <Link href="/" className="font-heading text-sm font-semibold text-primary">
            Prisma Press
          </Link>
          <h1 className="text-2xl font-bold">Create an Account</h1>
          <p className="text-muted-foreground">
            Enter your information below to create your account
          </p>
        </div>

        <RegisterForm />

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
