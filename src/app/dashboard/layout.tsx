"use client";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Loader2 } from "lucide-react";
import { SidebarProvider, Sidebar, SidebarInset, useSidebar } from "@/components/ui/sidebar"; // Removed SidebarHeader
// Button, cn, Badge, useIsMobile are not directly used here anymore for header construction

function DashboardInternalLayout({ children }: { children: React.ReactNode }) {
  const { hydrated } = useSidebar(); // Use hydrated from useSidebar if needed, or manage locally
  
  // This local hydrated state is to prevent flash of unstyled content for the layout itself.
  const [layoutHydrated, setLayoutHydrated] = React.useState(false);
  React.useEffect(() => {
    setLayoutHydrated(true);
  }, []);

  if (!layoutHydrated || hydrated === undefined) { // Check both hydration states
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
        // notificationCount is passed directly to SidebarHeaderInternal via Sidebar props
        // The actual navigation menu is passed as children
      >
        <DashboardNav />
      </Sidebar>
      <SidebarInset> 
        <div className="flex flex-col h-full bg-background">
          <div className="flex-1 p-4 md:p-6 overflow-y-auto">
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
  const { user, loading, userDashboardNotificationCount } = useAuth(); // Get notification count
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
  
  const headerHeightValue = '4rem'; 
  const mobileSearchHeightValue = '3.25rem'; 
  const totalMobileHeaderHeightValue = `calc(${headerHeightValue} + ${mobileSearchHeightValue})`;

  return (
    <SidebarProvider
        defaultOpen={true} 
        style={{
          '--sidebar-width': '16rem',
          '--sidebar-width-mobile': '16rem', 
          '--sidebar-width-icon': '4.5rem',
          '--header-height': headerHeightValue, 
          '--mobile-search-height': mobileSearchHeightValue, 
          '--total-mobile-header-height': totalMobileHeaderHeightValue, 
          '--sidebar-side': 'right', 
          '--sidebar-collapsible': 'icon',
        } as React.CSSProperties}
    >
      {/* Pass notification count to Sidebar via DashboardInternalLayout if Sidebar takes it as a prop */}
      <DashboardInternalLayout>{children}</DashboardInternalLayout>
    </SidebarProvider>
  );
}
