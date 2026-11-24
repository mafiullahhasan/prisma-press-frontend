import { Suspense } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BlockSkeleton, PageHeader } from "@/components/shared/feedback";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { requireUser } from "@/lib/data";
import { formatDate, initials } from "@/lib/format";

export default function UserProfilePage() {
  return (
    <>
      <PageHeader title="Profile" description="Manage how you appear on Prisma Press." />
      <Suspense fallback={<BlockSkeleton rows={5} />}>
        <Profile />
      </Suspense>
    </>
  );
}

async function Profile() {
  const user = await requireUser();

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <Card>
        <CardContent className="flex flex-col items-center gap-3 text-center">
          <Avatar className="size-24 border">
            <AvatarImage src={user.profile?.profilePhoto || ""} alt={user.name} />
            <AvatarFallback className="text-xl">{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">{user.role}</Badge>
            <Badge variant={user.activeStatus === "ACTIVE" ? "outline" : "destructive"}>
              {user.activeStatus}
            </Badge>
          </div>
          {user.profile?.bio && <p className="text-sm text-muted-foreground">{user.profile.bio}</p>}
          <p className="text-xs text-muted-foreground">Joined {formatDate(user.createdAt)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit profile</CardTitle>
          <CardDescription>Changes are saved to your account immediately.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={user} />
        </CardContent>
      </Card>
    </div>
  );
}
