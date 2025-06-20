
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
  
  const headerHeightValue = '4rem'; 
  const mobileSearchHeightValue = '3.25rem'; 
  const totalMobileHeaderHeightValue = `calc(${headerHeightValue} + ${mobileSearchHeightValue})`;

  return (
    <SidebarProvider
        defaultOpen={true} 
        style={{
          '--sidebar-width': '16rem',
          '--sidebar-width-mobile': '16rem', 
          '--sidebar-width-icon': '4.5rem', // Updated width for collapsed icon sidebar
          '--sidebar-outer-padding': '0.5rem', // Added padding for the outer fixed container
          '--sidebar-header-height': '3rem', // Height of the sidebar's own header
          '--header-height': headerHeightValue, 
          '--mobile-search-height': mobileSearchHeightValue, 
          '--total-mobile-header-height': totalMobileHeaderHeightValue, 
          '--sidebar-side': 'right', 
          '--sidebar-collapsible': 'icon',
        } as React.CSSProperties}
    >
      <DashboardInternalLayout>{children}</DashboardInternalLayout>
    </SidebarProvider>
  );
}
