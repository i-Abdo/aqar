"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarSeparator } from "@/components/ui/sidebar" 
import { LayoutDashboard, ListPlus, DollarSign, UserCircle, Settings, Home } from "lucide-react" 
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth"; 
import React from "react"; 

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
    <SidebarMenu>
      {dashboardNavItems.map((item, index) => {
        const showBadge = item.countKey === "dashboard_overview_notifications" && userDashboardNotificationCount > 0;
        const countToDisplay = showBadge ? userDashboardNotificationCount : 0;
        
        return (
          <React.Fragment key={item.href + index}>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.title}
                icon={item.icon} // Pass the icon component
              >
                <Link href={item.href} className="flex items-center justify-between w-full">
                  {/* Text part of the link - children of SidebarMenuButton handle display */}
                  {item.title}
                  {showBadge && (
                    <Badge variant="destructive" className="group-data-[sidebar~=sidebar-outer-container][data-state=collapsed]:hidden">
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
