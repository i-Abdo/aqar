"use client";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Loader2, ShieldAlert, ChevronsLeft } from "lucide-react";
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
                <Link href={item.href} className="flex items-center justify-center w-full overflow-hidden">
                  <div className="flex items-center gap-2">
                    {IconComponent && <IconComponent className="shrink-0" />}
                    <span className="truncate group-data-[state=collapsed]:hidden">
                      {item.title}
                    </span>
                    {item.countKey !== "properties" && count > 0 && (
                      <Badge 
                          variant="destructive" 
                          className="shrink-0 group-data-[state=collapsed]:hidden px-1.5 py-0.5 text-[10px] leading-none h-4 rounded-full"
                      > 
                        {count > 9 ? '9+' : count}
                      </Badge>
                    )}
                  </div>
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
  const { toggleSidebar } = useSidebar();
  const { adminNotificationCount } = useAuth(); 

  return (
    <>
      <Sidebar 
        title="لوحة الإدارة" 
        notificationCount={adminNotificationCount}
      >
        <AdminSidebarNav counts={counts} />
      </Sidebar>
      <SidebarInset>
        <div className="relative flex flex-col h-full bg-background">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="absolute top-2 right-2 z-50 h-12 w-12 rounded-full shadow-lg md:hidden"
            aria-label="فتح القائمة"
          >
            <ChevronsLeft className="h-6 w-6" />
          </Button>
          <div className="flex-1 p-2 pt-14 md:p-4 md:pt-4 overflow-y-auto">
            {children}
          </div>
        </div>
      </SidebarInset>
    </>
  );
}

// This component only renders if the user is a confirmed admin.
// It handles fetching admin-specific data.
function AdminLayoutContent({ children }: { children: React.ReactNode; }) {
    const { adminNotificationCount, refreshAdminNotifications } = useAuth();
    const pathname = usePathname();

    const [counts, setCounts] = useState<AdminCounts>({ pending: 0, reports: 0, issues: 0, appeals: 0 });
    const [isLoadingCounts, setIsLoadingCounts] = useState(true);

    useEffect(() => {
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
                setCounts({ pending: 0, reports: 0, issues: 0, appeals: 0 });
            } finally {
                setIsLoadingCounts(false);
            }
        };
        fetchAdminCountsForSidebar();
    }, []);

    useEffect(() => {
        refreshAdminNotifications();
    }, [pathname, adminNotificationCount, refreshAdminNotifications]);

    if (isLoadingCounts) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
  
    return (
        <SidebarProvider
        defaultOpen={false} 
        style={{
            '--sidebar-width': '18rem', 
            '--sidebar-width-mobile': '16rem', 
            '--sidebar-width-icon': '4rem', 
            '--sidebar-outer-padding': '0rem',
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


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [authHydrated, setAuthHydrated] = useState(false);

  useEffect(() => {
    setAuthHydrated(true);
  }, []);

  // This effect handles the redirection logic for unauthorized users.
  useEffect(() => {
    // We wait until auth is not loading and the component is hydrated on the client.
    if (!authLoading && authHydrated) {
      if (!user) {
        // If there's no user, redirect to login.
        router.push("/login?redirect=/admin/properties");
      } else if (!isAdmin) {
        // If there's a user but they are not an admin, redirect to their dashboard.
        router.push("/dashboard");
      }
    }
  }, [user, isAdmin, authLoading, router, authHydrated]);
  
  // This is the main security guard. 
  // It shows a loader until we are certain the user is an authenticated admin.
  // This prevents any "flash" of the admin UI for unauthorized users.
  if (authLoading || !authHydrated || !isAdmin) { 
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If we reach here, the user is a confirmed admin.
  // We can now safely render the admin content.
  return <AdminLayoutContent>{children}</AdminLayoutContent>;
}
