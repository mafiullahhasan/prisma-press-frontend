"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "../_actions/authActions";
import { useActionState, useEffect } from "react";



export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);

  useEffect(() => {
    if (!state) return;

    if (!state.success) {
      toast.error(state.message || "Logged in failed");
    }
    
  }, [state]);

  return (
    <form action={action}>
      <div className="flex flex-col gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            name="email"
            type="email"
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            name="password"
            type="password"
            placeholder="Enter your password"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Submitting..." : "Login"}
        </Button>
      </div>
    </form>
  );
}
