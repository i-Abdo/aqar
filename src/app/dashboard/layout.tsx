
"use client";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation"; 
import React, { useEffect } from "react"; 
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Loader2 } from "lucide-react";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"; // Added useSidebar
import { SheetTitle } from "@/components/ui/sheet";
import { AppLogo } from "@/components/layout/AppLogo";
import { cn } from "@/lib/utils"; // Added cn

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth(); 
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile, open } = useSidebar(); // Get sidebar state

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);


  if (loading) {
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
        style={{ '--sidebar-width': '16rem', '--sidebar-width-mobile': '16rem' } as React.CSSProperties}
    >
      <Sidebar 
        side="right" 
        collapsible="icon"
        className="border-l rtl:border-r-0 rtl:border-l" 
      >
        <SidebarHeader className="p-3 flex items-center justify-center">
          {isMobile ? (
            <SheetTitle className="text-xl font-semibold px-3">لوحة التحكم</SheetTitle>
          ) : (
            <>
              <div className={cn("text-xl font-semibold px-3", !open && "hidden")}>لوحة التحكم</div>
              <div className={cn("hidden", !open && "block")}>
                <AppLogo />
              </div>
            </>
          )}
        </SidebarHeader>
        <SidebarContent className="p-0">
          <DashboardNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-full bg-background">
          <header className="md:hidden p-3 border-b flex items-center sticky top-0 bg-header-background z-10">
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
    </SidebarProvider>
  );
}
