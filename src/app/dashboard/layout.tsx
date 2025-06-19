
"use client";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation"; 
import React, { useEffect, useState } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Loader2, ChevronsRight, ChevronsLeft } from "lucide-react"; 
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInset, SidebarTrigger, useSidebar, SheetTitle } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// New internal component
function DashboardInternalLayout({ children }: { children: React.ReactNode }) {
  const { isMobile, open, toggleSidebar } = useSidebar();
  const [hydrated, setHydrated] = React.useState(false);
  const { userDashboardNotificationCount } = useAuth();

  React.useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <>
      <Sidebar 
        side="right" 
        collapsible="icon"
        className="border-l rtl:border-r-0 rtl:border-l" 
        title="لوحة التحكم"
      >
        <SidebarHeader className="p-3 border-b border-sidebar-border">
          {hydrated && !isMobile && (
            <div className="flex items-center justify-between h-8"> {/* Consistent height */}
              {open && (
                <div className="flex items-center gap-2">
                  <div className="text-xl font-semibold">لوحة التحكم</div>
                  {userDashboardNotificationCount > 0 && (
                    <Badge variant="destructive">{userDashboardNotificationCount > 9 ? '9+' : userDashboardNotificationCount}</Badge>
                  )}
                </div>
              )}
              {!open && <div className="flex-grow"></div>} {/* Spacer */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-8 w-8"
                aria-label={open ? "إغلاق الشريط الجانبي" : "فتح الشريط الجانبي"}
              >
                {open ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
              </Button>
            </div>
          )}
        </SidebarHeader>
        <SidebarContent className="p-0">
          <DashboardNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-full bg-background">
           <header className="md:hidden p-3 border-b flex items-center justify-between sticky top-0 bg-header-background z-10">
            <div className="flex items-center">
                <SidebarTrigger />
                <h2 className="mr-2 rtl:ml-2 rtl:mr-0 font-semibold text-lg">
                لوحة التحكم
                </h2>
            </div>
             {userDashboardNotificationCount > 0 && (
                <Badge variant="destructive" className="h-6 px-2">{userDashboardNotificationCount > 9 ? '9+' : userDashboardNotificationCount}</Badge>
            )}
          </header>
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

  return (
    <SidebarProvider 
        defaultOpen={true}
        style={{ 
          '--sidebar-width': '16rem', 
          '--sidebar-width-mobile': '16rem',
          '--sidebar-width-icon': '3.5rem', 
          '--header-height': '4rem',      
        } as React.CSSProperties}
    >
      <DashboardInternalLayout>{children}</DashboardInternalLayout>
    </SidebarProvider>
  );
}
