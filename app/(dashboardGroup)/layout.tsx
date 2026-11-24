import React, { Suspense } from "react";
import { Navbar } from "@/components/shared/navbar";
import { AdminSidebarLink, DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { getCurrentUser } from "@/lib/data";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar />
      <div className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)] gap-4 px-4 pb-10 sm:px-6 md:grid-cols-[200px_minmax(0,1fr)] md:gap-6 md:py-8 lg:px-8">
        {/* Mobile: sticky tab bar under the navbar · Desktop: sticky sidebar */}
        <aside className="sticky top-16 z-30 min-w-0 md:top-24 md:self-start">
          <DashboardSidebar
            adminSlot={
              <Suspense fallback={null}>
                <AdminLinkIfAdmin />
              </Suspense>
            }
          />
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}

// Reads the session, so it streams in behind its own Suspense boundary.
async function AdminLinkIfAdmin() {
  const user = await getCurrentUser();
  return user?.role === "ADMIN" ? <AdminSidebarLink /> : null;
}
