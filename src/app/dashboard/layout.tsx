
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
import { useIsMobile } from "@/hooks/use-mobile";

function DashboardInternalLayout({ children }: { children: React.ReactNode }) {
  const { open, toggleSidebar, isMobile, side } = useSidebar();
  const [hydrated, setHydrated] = React.useState(false);
  const { userDashboardNotificationCount, user } = useAuth(); // Added user
  
  React.useEffect(() => {
    setHydrated(true);
  }, []);

  const ChevronIconToRender = () => {
    if (side === 'right') { // RTL default
      return open ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />;
    } else { // LTR
      return open ? <ChevronsLeft className="h-5 w-5" /> : <ChevronsRight className="h-5 w-5" />;
    }
  };

  if (!hydrated) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <>
      <Sidebar
        side="right"
        collapsible="icon" 
      >
        {/* Sidebar Header (Title/Badge + Toggle Button) */}
        <LayoutSidebarHeader> 
            <div className={cn(
                "flex items-center h-8 w-full", // Ensure height matches button
                open ? "justify-between" : "justify-center" // Center button when collapsed
            )}>
                {open && ( // Show title and badge only when open
                <div className="flex items-center gap-2">
                    <span className={cn("text-xl font-semibold")}>لوحة التحكم</span>
                    {userDashboardNotificationCount > 0 && (
                    <Badge variant="destructive">{userDashboardNotificationCount > 9 ? '9+' : userDashboardNotificationCount}</Badge>
                    )}
                </div>
                )}
                {/* Toggle button is always rendered */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                        console.log('Dashboard Layout Toggle clicked. Current open state:', open); 
                        e.stopPropagation();
                        toggleSidebar();
                    }}
                    className={cn("h-8 w-8")} 
                    aria-label={open ? "إغلاق الشريط الجانبي" : "فتح الشريط الجانبي"}
                >
                    <ChevronIconToRender />
                </Button>
            </div>
        </LayoutSidebarHeader>
        <SidebarContent className="p-0">
          <DashboardNav />
        </SidebarContent>
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
    return null; // Or a redirect component if preferred, but useEffect handles redirect
  }
  
  // CSS Variables for sidebar and header dimensions
  // These are now primarily used by SiteHeader and Sidebar for positioning
  const headerHeightValue = '4rem'; 
  const mobileSearchHeightValue = '3.25rem'; // Height of the mobile search bar area
  const totalMobileHeaderHeightValue = `calc(${headerHeightValue} + ${mobileSearchHeightValue})`;


  return (
    <SidebarProvider
        defaultOpen={true} // Sidebar open by default on mobile
        style={{
          '--sidebar-width': '16rem',
          '--sidebar-width-mobile': '16rem', 
          '--sidebar-width-icon': '3.5rem', 
          '--header-height': headerHeightValue, // Main header part height
          '--mobile-search-height': mobileSearchHeightValue, // Mobile search bar container height
          '--total-mobile-header-height': totalMobileHeaderHeightValue, // Full header height on mobile when not scrolled
          '--sidebar-side': 'right', // Sidebar on the right for RTL
           // --current-sticky-header-height is set dynamically by SiteHeader
        } as React.CSSProperties}
    >
      <DashboardInternalLayout>{children}</DashboardInternalLayout>
    </SidebarProvider>
  );
}
