
"use client";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation"; // Added usePathname
import React, { useEffect } from "react"; 
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Loader2 } from "lucide-react";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"; // Added SidebarTrigger
import { AppLogo } from "@/components/layout/AppLogo";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth(); 
  const router = useRouter();
  const pathname = usePathname(); // For dynamic header title

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
    <SidebarProvider defaultOpen={true}>
      <Sidebar 
        side="right" 
        collapsible="icon" // Changed from "none" to "icon"
        className="border-l rtl:border-r-0"
      >
        <SidebarHeader className="p-3 flex items-center justify-center">
          <h2 className="text-xl font-semibold px-3 group-[[data-sidebar=sidebar][data-state=collapsed]]/sidebar:hidden group-[[data-sidebar=sidebar][data-collapsible=icon]]/sidebar:hidden">لوحة التحكم</h2>
        </SidebarHeader>
        <SidebarContent className="p-0">
          <DashboardNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-full bg-background">
          {/* Mobile Header for trigger */}
          <header className="md:hidden p-3 border-b flex items-center sticky top-0 bg-header-background z-10">
            <SidebarTrigger />
            <h2 className="mr-2 rtl:ml-2 rtl:mr-0 font-semibold text-lg">
              لوحة التحكم
            </h2>
          </header>
          {/* Main Content Area */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
