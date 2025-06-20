
"use client";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Loader2, ChevronsRight, ChevronsLeft } from "lucide-react";
import { SidebarProvider, Sidebar, SidebarHeader as LayoutSidebarHeader, SidebarContent, SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
        title="لوحة التحكم" // Used by Sheet on mobile
      >
        {/* This SidebarHeader is for layout-specific content like title, badge, toggle */}
        <LayoutSidebarHeader>
          {hydrated && (
            <div className={cn("flex items-center justify-between h-8 w-full")}>
              {/* Title and Badge: only shown if !isMobile and open */}
              {open && !isMobile && (
                <div className="flex items-center gap-2">
                  <span className={cn("text-xl font-semibold")}>لوحة التحكم</span>
                  {userDashboardNotificationCount > 0 && (
                    <Badge variant="destructive">{userDashboardNotificationCount > 9 ? '9+' : userDashboardNotificationCount}</Badge>
                  )}
                </div>
              )}
              {/* Toggle Button: always shown for desktop, or on mobile when sidebar is open */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className={cn(
                  "h-8 w-8",
                  open ? "" : (isMobile ? "" : "mx-auto w-full justify-center") // Center only if collapsed on desktop
                )}
                aria-label={open ? "إغلاق الشريط الجانبي" : "فتح الشريط الجانبي"}
              >
                {open ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
              </Button>
            </div>
          )}
        </LayoutSidebarHeader>
        <SidebarContent className="p-0">
          <DashboardNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-full bg-background">
          {/* Mobile-only top bar inside content area - REMOVED */}
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
          '--sidebar-width-icon': '3.5rem', // Width when collapsed as icon
          '--header-height': '4rem', // Main site header height
          '--mobile-search-height': '3.25rem', // Mobile search bar container height
          '--total-mobile-header-height': 'calc(var(--header-height) + var(--mobile-search-height))', // Total header height on mobile when fully visible
          // --current-sticky-header-height is set by SiteHeader.tsx
          '--sidebar-side': 'right',
        } as React.CSSProperties}
    >
      <DashboardInternalLayout>{children}</DashboardInternalLayout>
    </SidebarProvider>
  );
}
