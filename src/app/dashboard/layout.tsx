
"use client";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Loader2, Menu } from "lucide-react";
import { SidebarProvider, Sidebar, SidebarInset, useSidebar } from "@/components/ui/sidebar"; 
import { Button } from "@/components/ui/button";


function DashboardInternalLayout({ children }: { children: React.ReactNode }) {
  const { isMobile, toggleSidebar } = useSidebar(); 
  const { userDashboardNotificationCount } = useAuth(); 
  
  const [layoutHydrated, setLayoutHydrated] = React.useState(false);
  React.useEffect(() => {
    setLayoutHydrated(true);
  }, []);

  if (!layoutHydrated) { 
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <>
       {isMobile && (
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="fixed top-[calc(var(--header-height)+0.5rem)] right-4 z-30 h-10 w-10 md:hidden bg-background/80 backdrop-blur-sm"
          aria-label="فتح القائمة"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}
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
