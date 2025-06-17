
"use client";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { Loader2, ShieldAlert, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { AppLogo } from "@/components/layout/AppLogo";

const adminNavItems = [ 
  { title: "إدارة العقارات", href: "/admin/properties", icon: LayoutDashboard },
];

function AdminSidebarNav() {
  const pathname = usePathname();
  return (
    <SidebarMenu className="p-2">
      {adminNavItems.map((item, index) => (
        <SidebarMenuItem key={index}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            className="justify-start text-base"
            tooltip={item.title}
          >
            <Link href={item.href} className="flex items-center w-full">
              <item.icon className="h-5 w-5 shrink-0 rtl:ml-2 mr-2 rtl:mr-0 group-[[data-sidebar=sidebar][data-state=collapsed]]/sidebar:mx-auto" />
              <span className="group-[[data-sidebar=sidebar][data-state=collapsed]]/sidebar:hidden group-[[data-sidebar=sidebar][data-collapsible=icon]]/sidebar:hidden">
                {item.title}
              </span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login?redirect=/admin");
      } else if (!isAdmin) {
        router.push("/dashboard"); 
      }
    }
  }, [user, isAdmin, loading, router]);

  if (loading) {
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
    <SidebarProvider defaultOpen={true}>
      <Sidebar side="right" collapsible="icon" className="border-l rtl:border-r-0">
        <SidebarHeader className="p-3 flex items-center justify-center">
          {/* <AppLogo /> */}
           <h2 className="text-xl font-semibold px-3 group-[[data-sidebar=sidebar][data-state=collapsed]]/sidebar:hidden group-[[data-sidebar=sidebar][data-collapsible=icon]]/sidebar:hidden">لوحة الإدارة</h2>
        </SidebarHeader>
        <SidebarContent className="p-0">
             <AdminSidebarNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

