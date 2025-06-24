
"use client";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Loader2, ShieldAlert, Menu } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SidebarProvider, Sidebar, SidebarInset, useSidebar } from "@/components/ui/sidebar"; 
import { collection, query, where, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Badge } from "@/components/ui/badge";

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
  properties?: number; 
}

function AdminSidebarNav({ counts }: { counts: AdminCounts }) {
  const pathname = usePathname();

  const getCountForItem = (itemKey?: string): number => {
    if (!itemKey) return 0;
    return counts[itemKey as keyof AdminCounts] || 0;
  }

  return (
    <SidebarMenu>
      {adminNavItems.map((item, index) => {
        const count = getCountForItem(item.countKey);
        const isSeparatorNext = item.title === "مشاكل المستخدمين"; 
        const IconComponent = item.icon;
        return (
          <React.Fragment key={item.href + index}>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={item.title}
              >
                <Link href={item.href} className="flex items-center w-full overflow-hidden">
                  <div className="flex items-center gap-2 flex-grow">
                    {IconComponent && <IconComponent className="shrink-0" />}
                    <span className="truncate group-data-[state=collapsed]:hidden">
                      {item.title}
                    </span>
                  </div>
                  {item.countKey !== "properties" && count > 0 && (
                    <Badge 
                        variant="destructive" 
                        className="shrink-0 group-data-[state=collapsed]:hidden px-1.5 py-0.5 text-[10px] leading-none h-4 rounded-full"
                    > 
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
  const { toggleSidebar, isMobile } = useSidebar();
  const { adminNotificationCount } = useAuth(); 

  const [layoutHydrated, setLayoutHydrated] = React.useState(false);
  React.useEffect(() => {
    setLayoutHydrated(true);
  }, []);

  if (!layoutHydrated) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }
  return (
    <>
      {isMobile && (
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="fixed top-[calc(var(--header-height)+0.5rem)] right-4 z-30 h-10 w-10 md:hidden bg-background/80 backdrop-blur-sm"
          aria-label="فتح القائمة"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}
      <Sidebar 
        title="لوحة الإدارة" 
        notificationCount={adminNotificationCount}
      >
        <AdminSidebarNav counts={counts} />
      </Sidebar>
      <SidebarInset> 
        <div className="flex flex-col h-full bg-background">
          <div className="flex-1 p-2 md:p-4 overflow-y-auto">
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
  const { user, isAdmin, loading: authLoading, adminNotificationCount: totalAdminNotifications, refreshAdminNotifications } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [counts, setCounts] = useState<AdminCounts>({ pending: 0, reports: 0, issues: 0, appeals: 0 });
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);
  const [authHydrated, setAuthHydrated] = useState(false);

  useEffect(() => {
    setAuthHydrated(true);
  }, []);

  useEffect(() => {
    const fetchAdminCountsForSidebar = async () => {
      if (!isAdmin) {
        setIsLoadingCounts(false);
        return;
      }
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
        setCounts({ pending: 0, reports: 0, issues: 0, appeals: 0 });
      } finally {
        setIsLoadingCounts(false);
      }
    };
    
    if (!authLoading && authHydrated) {
        if (!user) {
            router.push("/login?redirect=/admin");
        } else if (!isAdmin) {
            router.push("/dashboard");
        } else {
            fetchAdminCountsForSidebar(); 
        }
    }
  }, [user, isAdmin, authLoading, router, authHydrated]);
  
  useEffect(() => {
    if (isAdmin) {
        refreshAdminNotifications();
    }
  }, [isAdmin, pathname, totalAdminNotifications, refreshAdminNotifications]);


  if (authLoading || !authHydrated || (isAdmin && isLoadingCounts)) { 
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

  return (
    <SidebarProvider
      defaultOpen={true} 
      style={{
        '--sidebar-width': '18rem', 
        '--sidebar-width-mobile': '16rem', 
        '--sidebar-width-icon': '4rem', 
        '--sidebar-outer-padding': '0rem', // Removed outer padding for desktop
        '--sidebar-header-height': '3rem',
        '--sidebar-inset-top': 'var(--header-height)', 
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
