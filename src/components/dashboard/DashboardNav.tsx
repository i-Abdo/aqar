
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import { LayoutDashboard, ListPlus, DollarSign, UserCircle, Settings, Home } from "lucide-react" // Added Home

const dashboardNavItems = [
  {
    title: "نظرة عامة",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "عقاراتي",
    href: "/dashboard/properties",
    icon: Home, // Changed from ListPlus to Home for "My Properties"
  },
  {
    title: "إضافة عقار",
    href: "/dashboard/properties/new",
    icon: ListPlus, 
  },
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
  const pathname = usePathname()

  return (
    <SidebarMenu className="p-2">
      {dashboardNavItems.map((item, index) => (
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
  )
}

