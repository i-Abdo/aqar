
"use client";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation"; 
import React, { useEffect, useState } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Loader2, PanelLeftOpen, ChevronsRight, ChevronsLeft, PanelLeft } from "lucide-react"; 
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// New internal component
function DashboardInternalLayout({ children }: { children: React.ReactNode }) {
  const { isMobile, open, toggleSidebar } = useSidebar();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <>
      <Sidebar 
        side="right" 
        collapsible="icon"
        className="border-l rtl:border-r-0 rtl:border-l" 
      >
        <SidebarHeader className="p-3 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            {/* Title/Logo Area */}
             <div className="flex items-center gap-2">
              {hydrated && isMobile ? (
                <SheetTitle className="text-xl font-semibold">لوحة التحكم</SheetTitle>
              ) : hydrated && !isMobile && open ? (
                <div className="text-xl font-semibold">لوحة التحكم</div>
              ) : hydrated && !isMobile && !open ? (
                <PanelLeftOpen className="h-6 w-6 shrink-0 mx-auto" />
              ) : (
                 <div className="h-6 w-6"></div>
              )}
            </div>

            {/* Desktop Toggle Button */}
            {hydrated && !isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-8 w-8"
                aria-label={open ? "إغلاق الشريط الجانبي" : "فتح الشريط الجانبي"}
              >
                {open ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </SidebarHeader>
        <SidebarContent className="p-0">
          <DashboardNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-full bg-background">
          <header className="md:hidden p-3 border-b flex items-center sticky top-0 bg-header-background z-10" style={{ top: 'var(--header-height, 0px)' }}>
            <SidebarTrigger />
            <h2 className="mr-2 rtl:ml-2 rtl:mr-0 font-semibold text-lg">
              لوحة التحكم
            </h2>
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
          '--sidebar-width-icon': '3.5rem', // Added icon width
          '--header-height': '4rem',      // Added header height
        } as React.CSSProperties}
    >
      <DashboardInternalLayout>{children}</DashboardInternalLayout>
    </SidebarProvider>
  );
}

