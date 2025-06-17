
"use client";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Loader2 } from "lucide-react";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInset } from "@/components/ui/sidebar";
import { AppLogo } from "@/components/layout/AppLogo";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

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
    return null; // Or a redirect component, handled by useEffect
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar side="right" collapsible="icon" className="border-l rtl:border-r-0">
        <SidebarHeader className="p-3 flex items-center justify-center">
          {/* <AppLogo /> */}
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

