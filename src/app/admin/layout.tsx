"use client";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SidebarProvider, Sidebar, SidebarInset, useSidebar } from "@/components/ui/sidebar"; // Removed SidebarHeader
import { collection, query, where, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Badge } from "@/components/ui/badge";
// useIsMobile, ChevronsRight, ChevronsLeft, cn not directly used here for header construction

// AdminSidebarNav is defined below for clarity
import { LayoutDashboard, Flag, MessageCircleWarning, ListChecks, ShieldQuestion } from "lucide-react";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarSeparator as UiSidebarSeparator } from "@/components/ui/sidebar";


const adminNavItems = [
  { title: "إدارة العقارات", href: "/admin/properties", icon: LayoutDashboard, countKey: "properties" },
  { title: "إدارة البلاغات", href: "/admin/reports", icon: Flag, countKey: "reports" },
  { title: "مشاكل المستخدمين", href: "/admin/issues", icon: MessageCircleWarning, countKey: "issues" },
  { title: "عقارات قيد المراجعة", href: "/admin/pending", icon: ListChecks, countKey: "pending" },
  { title: "إدارة الطعون", href: "/admin/appeals", icon: ShieldQuestion, countKey: "appeals" },
];

interface AdminCounts {
  pending: number;
  reports: number;
  issues: number;
  appeals: number;
  properties?: number; // This count is not displayed as a badge
}

function AdminSidebarNav({ counts }: { counts: AdminCounts }) {
  const pathname = usePathname();

  const getCountForItem = (itemKey?: string): number => {
    if (!itemKey) return 0;
    return counts[itemKey as keyof AdminCounts] || 0;
  }

  return (
    <SidebarMenu className="p-2">
      {adminNavItems.map((item, index) => {
        const count = getCountForItem(item.countKey);
        const isSeparatorNext = item.title === "مشاكل المستخدمين"; // Place separator after this item
        return (
          <React.Fragment key={item.href + index}>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                className="justify-start text-base"
                tooltip={item.title}
              >
                <Link href={item.href} className="flex items-center justify-between w-full">
                  <div className="flex items-center flex-1 min-w-0">
                    <item.icon className="h-5 w-5 shrink-0 rtl:ml-2 mr-2 rtl:mr-0" />
                    <span className="truncate"> {/* Text span, will be hidden when collapsed by SidebarMenuButton style */}
                      {item.title}
                    </span>
                  </div>
                  {item.countKey !== "properties" && count > 0 && (
                    <Badge variant="destructive" className="rtl:mr-auto"> {/* Badge, will be hidden when collapsed by SidebarMenuButton style */}
                      {count > 9 ? '9+' : count}
                    </Badge>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {isSeparatorNext && <UiSidebarSeparator />}
          </React.Fragment>
        );
      })}
    </SidebarMenu>
  );
}


function AdminInternalLayout({ children, counts }: { children: React.ReactNode; counts: AdminCounts; }) {
  const { hydrated } = useSidebar();
  const { adminNotificationCount } = useAuth(); // Get overall admin notification count for the title

  const [layoutHydrated, setLayoutHydrated] = React.useState(false);
  React.useEffect(() => {
    setLayoutHydrated(true);
  }, []);

  if (!layoutHydrated || hydrated === undefined) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }
  return (
    <>
      <Sidebar 
        title="لوحة الإدارة" 
        notificationCount={adminNotificationCount}
      >
        <AdminSidebarNav counts={counts} />
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, loading: authLoading, adminNotificationCount: totalAdminNotifications } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [counts, setCounts] = useState<AdminCounts>({ pending: 0, reports: 0, issues: 0, appeals: 0 });
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);
  const [authHydrated, setAuthHydrated] = useState(false);

  useEffect(() => {
    setAuthHydrated(true);
  }, []);

  useEffect(() => {
    if (!isAdmin && !authLoading) { // If not admin and auth check is complete
        router.push("/dashboard"); // Redirect non-admins
        return;
    };

    const fetchAdminCountsForSidebar = async () => {
      setIsLoadingCounts(true);
      try {
        const pendingPropsQuery = query(collection(db, "properties"), where("status", "==", "pending"));
        const newReportsQuery = query(collection(db, "reports"), where("status", "==", "new"));
        const newUserIssuesQuery = query(collection(db, "user_issues"), where("status", "==", "new"));
        const newAppealsQuery = query(collection(db, "property_appeals"), where("appealStatus", "==", "new"));

        const [pendingSnapshot, reportsSnapshot, issuesSnapshot, appealsSnapshot] = await Promise.all([
          getCountFromServer(pendingPropsQuery),
          getCountFromServer(newReportsQuery),
          getCountFromServer(newUserIssuesQuery),
          getCountFromServer(newAppealsQuery),
        ]);

        const currentCountsData = {
          pending: pendingSnapshot.data().count,
          reports: reportsSnapshot.data().count,
          issues: issuesSnapshot.data().count,
          appeals: appealsSnapshot.data().count,
        };
        setCounts(currentCountsData);
      } catch (error) {
        console.error("Error fetching admin counts for sidebar:", error);
        // Set to zero on error to prevent stale counts
        setCounts({ pending: 0, reports: 0, issues: 0, appeals: 0 });
      } finally {
        setIsLoadingCounts(false);
      }
    };

    if (isAdmin) { // Fetch counts only if user is admin
      fetchAdminCountsForSidebar();
    } else {
      setIsLoadingCounts(false); // Not loading counts if not admin
    }
  }, [isAdmin, pathname, totalAdminNotifications, authLoading, router]); // Added authLoading and router

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login?redirect=/admin");
      } else if (!isAdmin) {
        // Already handled by the effect above, but good for clarity or if order changes
        router.push("/dashboard"); 
      }
    }
  }, [user, isAdmin, authLoading, router]);

  if (authLoading || !authHydrated || (isAdmin && isLoadingCounts)) { // Show loader if admin and counts are loading
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
       <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive mb-2">وصول غير مصرح به</h1>
        <p className="text-muted-foreground mb-6">ليس لديك الصلاحيات اللازمة للوصول إلى هذه الصفحة.</p>
        <Button asChild>
          <Link href="/dashboard">العودة إلى لوحة التحكم</Link>
        </Button>
      </div>
    );
  }

  const headerHeightValue = '4rem'; 
  const mobileSearchHeightValue = '3.25rem';
  const totalMobileHeaderHeightValue = `calc(${headerHeightValue} + ${mobileSearchHeightValue})`;

  return (
    <SidebarProvider
      defaultOpen={true} 
      style={{
        '--sidebar-width': '18rem', 
        '--sidebar-width-mobile': '16rem', 
        '--sidebar-width-icon': '4.5rem',
        '--header-height': headerHeightValue, 
        '--mobile-search-height': mobileSearchHeightValue, 
        '--total-mobile-header-height': totalMobileHeaderHeightValue, 
        '--sidebar-side': 'right',
        '--sidebar-collapsible': 'icon',
      } as React.CSSProperties}
    >
      <AdminInternalLayout counts={counts}>
        {children}
      </AdminInternalLayout>
    </SidebarProvider>
  );
}
