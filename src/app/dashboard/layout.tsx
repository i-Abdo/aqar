
"use client";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Loader2, Menu } from "lucide-react";
import { SidebarProvider, Sidebar, SidebarInset, useSidebar } from "@/components/ui/sidebar"; 
import { Button } from "@/components/ui/button";


function DashboardInternalLayout({ children }: { children: React.ReactNode }) {
  const { toggleSidebar } = useSidebar(); 
  const { userDashboardNotificationCount } = useAuth(); 
  
  return (
    <>
      <Sidebar 
        title="لوحة التحكم" 
        notificationCount={userDashboardNotificationCount}
      >
        <DashboardNav />
      </Sidebar>
      <SidebarInset> 
        <div className="relative flex flex-col h-full bg-background">
           <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="absolute top-2 right-2 z-20 h-10 w-10 md:hidden"
            aria-label="فتح القائمة"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1 p-2 pt-14 md:pt-4 md:p-4 overflow-y-auto">
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
        defaultOpen={false} 
        style={{
          '--sidebar-width': '16rem',
          '--sidebar-width-mobile': '15rem', 
          '--sidebar-width-icon': '4rem', 
          '--sidebar-outer-padding': '0rem', // Removed outer padding for desktop
          '--sidebar-header-height': '3rem',
          '--sidebar-inset-top': 'var(--header-height)', 
          '--sidebar-side': 'right', 
          '--sidebar-collapsible': 'icon',
        } as React.CSSProperties}
    >
      <DashboardInternalLayout>{children}</DashboardInternalLayout>
    </SidebarProvider>
  );
}
