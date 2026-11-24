"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionToast } from "@/hooks/use-action-toast";
import { registerAction } from "../_actions/authActions";

export default function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, null);
  useActionToast(state);

  return (
    <form action={action}>
      <div className="flex flex-col gap-5">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" type="text" autoComplete="name" placeholder="Enter your name" required minLength={2} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="Enter your email" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            required
            minLength={6}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="profilePhoto">
            Profile photo URL <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input id="profilePhoto" name="profilePhoto" type="url" placeholder="https://…" />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creating account..." : "Register"}
        </Button>
      </div>
    </form>
  );
}
