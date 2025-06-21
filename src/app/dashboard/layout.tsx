
"use client";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Loader2 } from "lucide-react";
import { SidebarProvider, Sidebar, SidebarInset, useSidebar } from "@/components/ui/sidebar"; 


function DashboardInternalLayout({ children }: { children: React.ReactNode }) {
  const { hydrated } = useSidebar(); 
  const { userDashboardNotificationCount } = useAuth(); 
  
  const [layoutHydrated, setLayoutHydrated] = React.useState(false);
  React.useEffect(() => {
    setLayoutHydrated(true);
  }, []);

  if (!layoutHydrated || hydrated === undefined) { 
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <>
      <Sidebar 
        title="لوحة التحكم" 
        notificationCount={userDashboardNotificationCount}
      >
        <DashboardNav />
      </Sidebar>
      <SidebarInset> 
        <div className="flex flex-col h-full bg-background">
          <div className="flex-1 p-2 md:p-4 overflow-y-auto">
            {children}
          </div>
        </div>
      </SidebarInset>
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth(); 
  const router = useRouter();

  const [authHydrated, setAuthHydrated] = useState(false);
  useEffect(() => {
    setAuthHydrated(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);


  if (loading || !authHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; 
  }
  
  return (
    <SidebarProvider
        defaultOpen={true} 
        style={{
          '--sidebar-width': '16rem',
          '--sidebar-width-mobile': '15rem', // Slightly reduced for mobile
          '--sidebar-width-icon': '4.5rem', 
          '--sidebar-outer-padding': '0.1rem', 
          '--sidebar-header-height': '3rem',
          '--header-height': '6.5rem', // Static combined height
          '--sidebar-stable-top-anchor': 'var(--header-height)', // Simplified
          '--sidebar-side': 'right', 
          '--sidebar-collapsible': 'icon',
        } as React.CSSProperties}
    >
      <DashboardInternalLayout>{children}</DashboardInternalLayout>
    </SidebarProvider>
  );
}
