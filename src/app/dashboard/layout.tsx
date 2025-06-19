
"use client";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Loader2, ChevronsRight, ChevronsLeft } from "lucide-react";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInset, useSidebar, SidebarSeparator } from "@/components/ui/sidebar";
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
      >
        <SidebarHeader>
          {hydrated && (
            <div className={cn("flex items-center justify-between h-8")}>
              {open && ( 
                 <div className="flex items-center gap-2">
                    <span className={cn("text-xl font-semibold")}>لوحة التحكم</span>
                    {userDashboardNotificationCount > 0 && (
                        <Badge variant="destructive" className={cn((isMobile === false && !open) && "hidden")}>{userDashboardNotificationCount > 9 ? '9+' : userDashboardNotificationCount}</Badge>
                    )}
                 </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className={cn(
                  "h-8 w-8",
                  (!open && !isMobile) && "mx-auto w-full justify-center" 
                )}
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
          {/* Mobile Header inside content area (removed as sidebar is now fixed and pushes content) */}
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
          '--header-height': 'var(--header-height)', // From globals.css
          '--mobile-search-height': 'var(--mobile-search-height)', // From globals.css
          '--total-mobile-header-height': 'var(--total-mobile-header-height)', // From globals.css
          '--main-content-top-offset': 'calc(var(--header-height) + 0rem)' // Removed 2rem as main's py-8 changed to pb-8
        } as React.CSSProperties}
    >
      <DashboardInternalLayout>{children}</DashboardInternalLayout>
    </SidebarProvider>
  );
}
