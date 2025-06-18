
"use client";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react"; // Added useState
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Loader2 } from "lucide-react";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInset } from "@/components/ui/sidebar";
import { AppLogo } from "@/components/layout/AppLogo";
import { collection, query, where, getCountFromServer, Timestamp } from "firebase/firestore"; // Added Timestamp
import { db } from "@/lib/firebase/client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userNotificationCount, setUserNotificationCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (loading || !user) {
      setUserNotificationCount(0);
      return;
    }

    const fetchUserNotificationsCount = async () => {
      setIsLoadingNotifications(true);
      let totalCount = 0;
      try {
        const appealsQuery = query(
          collection(db, "property_appeals"),
          where("ownerUserId", "==", user.uid),
          where("appealStatus", "in", ["resolved_deleted", "resolved_kept_archived", "resolved_published"])
        );
        const issuesQuery = query(
          collection(db, "user_issues"),
          where("userId", "==", user.uid),
          where("status", "in", ["in_progress", "resolved"])
        );
        const [appealsSnapshot, issuesSnapshot] = await Promise.all([
          getCountFromServer(appealsQuery),
          getCountFromServer(issuesQuery),
        ]);
        totalCount = appealsSnapshot.data().count + issuesSnapshot.data().count;
        setUserNotificationCount(totalCount);
      } catch (error) {
        console.error("Error fetching user notification counts for dashboard layout:", error);
        setUserNotificationCount(0);
      } finally {
        setIsLoadingNotifications(false);
      }
    };

    fetchUserNotificationsCount();
  }, [user, loading]);


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
          <DashboardNav notificationCount={userNotificationCount} />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
