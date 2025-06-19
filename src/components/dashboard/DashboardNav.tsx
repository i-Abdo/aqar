
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarSeparator } from "@/components/ui/sidebar" // Added SidebarSeparator
import { LayoutDashboard, ListPlus, DollarSign, UserCircle, Settings, Home } from "lucide-react" 
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth"; 
import React from "react"; // Added React import

const dashboardNavItems = [
  {
    title: "نظرة عامة",
    href: "/dashboard",
    icon: LayoutDashboard,
    countKey: "dashboard_overview_notifications" 
  },
  {
    title: "عقاراتي",
    href: "/dashboard/properties",
    icon: Home, 
  },
  {
    title: "إضافة عقار",
    href: "/dashboard/properties/new",
    icon: ListPlus, 
  },
  // Separator will be added after this item
  {
    title: "الاشتراكات",
    href: "/pricing", 
    icon: DollarSign,
  },
  {
    title: "الملف الشخصي",
    href: "/dashboard/profile", 
    icon: UserCircle,
  },
  {
    title: "الإعدادات",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function DashboardNav() {
  const pathname = usePathname();
  const { userDashboardNotificationCount } = useAuth(); 

  return (
    <SidebarMenu className="p-2">
      {dashboardNavItems.map((item, index) => {
        const showBadge = item.countKey === "dashboard_overview_notifications" && userDashboardNotificationCount > 0;
        const countToDisplay = showBadge ? userDashboardNotificationCount : 0;
        
        return (
          <React.Fragment key={item.href + index}>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
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
                  {showBadge && (
                    <Badge variant="destructive" className="group-[[data-sidebar=sidebar][data-state=collapsed]]/sidebar:hidden group-[[data-sidebar=sidebar][data-collapsible=icon]]/sidebar:hidden">
                      {countToDisplay > 9 ? '9+' : countToDisplay}
                    </Badge>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {item.title === "إضافة عقار" && <SidebarSeparator />}
          </React.Fragment>
        );
      })}
    </SidebarMenu>
  )
}
