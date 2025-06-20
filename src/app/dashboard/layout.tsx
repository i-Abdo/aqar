
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
  const { userDashboardNotificationCount } = useAuth(); 
  
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
        title="لوحة التحكم"
      >
        <LayoutSidebarHeader> 
            <div className={cn(
                "flex items-center h-8 w-full", 
                open ? "justify-between" : "justify-center" 
            )}>
                {open && ( 
                <div className="flex items-center gap-2">
                    <span className={cn("text-xl font-semibold")}>لوحة التحكم</span>
                    {userDashboardNotificationCount > 0 && (
                    <Badge variant="destructive">{userDashboardNotificationCount > 9 ? '9+' : userDashboardNotificationCount}</Badge>
                    )}
                </div>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleSidebar();
                    }}
                    className={cn(
                        "h-8 w-8",
                        !open && !isMobile && "mx-auto" // Center only on desktop when collapsed
                    )} 
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
          '--sidebar-width-icon': '4.5rem', // Updated icon width
          '--header-height': headerHeightValue, 
          '--mobile-search-height': mobileSearchHeightValue, 
          '--total-mobile-header-height': totalMobileHeaderHeightValue, 
          '--sidebar-side': 'right', 
        } as React.CSSProperties}
    >
      <DashboardInternalLayout>{children}</DashboardInternalLayout>
    </SidebarProvider>
  );
}
