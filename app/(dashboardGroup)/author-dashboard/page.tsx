import { redirect } from "next/navigation";

// Authors use the shared user dashboard (posts, comments, profile, subscription).
export default function AuthorDashboardPage() {
  redirect("/dashboard");
}
