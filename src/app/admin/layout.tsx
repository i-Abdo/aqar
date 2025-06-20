
"use client";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Loader2, ShieldAlert, Flag, MessageCircleWarning, ListChecks, ShieldQuestion, LayoutDashboard, ChevronsRight, ChevronsLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SidebarProvider, Sidebar, SidebarHeader as LayoutSidebarHeader, SidebarContent, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar, SidebarSeparator } from "@/components/ui/sidebar";
import { collection, query, where, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Badge } from "@/components/ui/badge";

const adminNavItems = [
  { title: "إدارة العقارات", href: "/admin/properties", icon: LayoutDashboard, countKey: "properties" },
  { title: "إدارة البلاغات", href: "/admin/reports", icon: Flag, countKey: "reports" },
  { title: "مشاكل المستخدمين", href: "/admin/issues", icon: MessageCircleWarning, countKey: "issues" },
  // Separator will be added after this item
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
    <SidebarMenu className="p-2">
      {adminNavItems.map((item, index) => {
        const count = getCountForItem(item.countKey);
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
                    <item.icon className="h-5 w-5 shrink-0 rtl:ml-2 mr-2 rtl:mr-0 group-[[data-sidebar=sidebar][data-state=collapsed]]/sidebar:mx-auto" />
                    <span className="truncate group-[[data-sidebar=sidebar][data-state=collapsed]]/sidebar:hidden group-[[data-sidebar=sidebar][data-collapsible=icon]]/sidebar:hidden">
                      {item.title}
                    </span>
                  </div>
                  {item.countKey !== "properties" && count > 0 && (
                    <Badge variant="destructive" className="group-[[data-sidebar=sidebar][data-state=collapsed]]/sidebar:hidden group-[[data-sidebar=sidebar][data-collapsible=icon]]/sidebar:hidden">
                      {count > 9 ? '9+' : count}
                    </Badge>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {item.title === "مشاكل المستخدمين" && <SidebarSeparator />}
          </React.Fragment>
        );
      })}
    </SidebarMenu>
  );
}

function AdminInternalLayout({ children, counts, adminNotificationCount, isLoadingCounts }: { children: React.ReactNode; counts: AdminCounts; adminNotificationCount: number; isLoadingCounts: boolean; }) {
  const { open, toggleSidebar } = useSidebar(); // Removed isMobile as unified behavior for header
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <>
      <Sidebar
        side="right"
        collapsible="icon"
        // Title prop not used for unified behavior
      >
        <LayoutSidebarHeader> 
          {hydrated && (
             <div className={cn(
              "flex items-center h-8 w-full",
              open ? "justify-between" : "justify-center"
            )}>
                {open && ( 
                 <div className="flex items-center gap-2">
                    <span className={cn("text-xl font-semibold")}>لوحة الإدارة</span>
                    {adminNotificationCount > 0 && !isLoadingCounts && (
                        <Badge variant="destructive">{adminNotificationCount > 9 ? '9+' : adminNotificationCount}</Badge>
                    )}
                 </div>
                )}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-8 w-8" // Centering removed, parent div handles it
                aria-label={open ? "إغلاق الشريط الجانبي" : "فتح الشريط الجانبي"}
              >
                {open ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
              </Button>
            </div>
          )}
        </LayoutSidebarHeader>
        <SidebarContent className="p-0">
             <AdminSidebarNav counts={counts} />
        </SidebarContent>
      </Sidebar>
      <SidebarInset> {/* This will now have padding-right for the collapsed icon bar */}
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
  const { user, isAdmin, loading: authLoading, adminNotificationCount } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [counts, setCounts] = useState<AdminCounts>({ pending: 0, reports: 0, issues: 0, appeals: 0 });
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);
  const [authHydrated, setAuthHydrated] = useState(false);

  useEffect(() => {
    setAuthHydrated(true);
  }, []);

  useEffect(() => {
    if (!isAdmin) {
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
        setCounts({ pending: 0, reports: 0, issues: 0, appeals: 0 });
      } finally {
        setIsLoadingCounts(false);
      }
    };

    fetchAdminCountsForSidebar();
  }, [isAdmin, pathname, adminNotificationCount]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login?redirect=/admin");
      } else if (!isAdmin) {
        router.push("/dashboard");
      }
    }
  }, [user, isAdmin, authLoading, router]);

  if (authLoading || !authHydrated) {
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
        '--sidebar-width': '16rem',
        '--sidebar-width-mobile': '16rem', 
        '--sidebar-width-icon': '3.5rem', 
        '--header-height': '4rem', 
        '--mobile-search-height': '3.25rem', 
        '--total-mobile-header-height': 'calc(var(--header-height) + var(--mobile-search-height))', 
        '--sidebar-side': 'right',
      } as React.CSSProperties}
    >
      <AdminInternalLayout counts={counts} adminNotificationCount={adminNotificationCount} isLoadingCounts={isLoadingCounts}>
        {children}
      </AdminInternalLayout>
    </SidebarProvider>
  );
}

