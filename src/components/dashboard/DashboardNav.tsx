
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
                className="text-base" 
                tooltip={item.title}
              >
                <Link href={item.href} className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 flex-grow overflow-hidden"> {/* Ensure this div is flex-grow */}
                    <item.icon className="h-5 w-5 shrink-0" /> {/* Icon styling is now primarily handled by SidebarMenuButton's variant CSS */}
                    <span className="truncate"> {/* Text span, its visibility is handled by SidebarMenuButton's variant CSS */}
                      {item.title}
                    </span>
                  </div>
                  {showBadge && (
                    <Badge variant="destructive" className="group-[[data-sidebar=sidebar][data-state=collapsed][data-collapsible=icon]]/sidebar:hidden">
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
