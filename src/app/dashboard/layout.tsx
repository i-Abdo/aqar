
"use client";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react"; 
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Loader2 } from "lucide-react";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInset } from "@/components/ui/sidebar";
import { AppLogo } from "@/components/layout/AppLogo";
// Removed Firestore imports as counts are now fetched in AuthProvider

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, setUserDashboardNotificationCount } = useAuth(); // setUserDashboardNotificationCount might not be needed here anymore
  const router = useRouter();
  // const [isLoadingNotifications, setIsLoadingNotifications] = useState(true); // This state might also be redundant

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Removed useEffect for fetching user notifications count as it's now handled in AuthProvider
  // useEffect(() => {
  //   if (loading || !user) {
  //     // setUserDashboardNotificationCount(0); // This will be handled by AuthProvider on logout
  //     return;
  //   }
  //   // Fetching logic moved to AuthProvider
  // }, [user, loading, setUserDashboardNotificationCount]);


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
      <Sidebar side="right" collapsible="icon" className="border-l rtl:border-r-0">
        <SidebarHeader className="p-3 flex items-center justify-center">
          
          <h2 className="text-xl font-semibold px-3 group-[[data-sidebar=sidebar][data-state=collapsed]]/sidebar:hidden group-[[data-sidebar=sidebar][data-collapsible=icon]]/sidebar:hidden">لوحة التحكم</h2>
        </SidebarHeader>
        <SidebarContent className="p-0">
          <DashboardNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
