import { getUserProfile } from "@/service/getUserProfile";
import React from "react";
import { Navbar } from '@/components/shared/navbar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserProfile();
  return ( <div>
    <Navbar user={user}/>
    {children}
    </div>
  )
}
