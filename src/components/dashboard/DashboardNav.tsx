"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { LayoutDashboard, ListPlus, DollarSign, UserCircle, Settings } from "lucide-react"

const dashboardNavItems = [
  {
    title: "نظرة عامة",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "عقاراتي",
    href: "/dashboard/properties",
    icon: ListPlus,
  },
  {
    title: "إضافة عقار",
    href: "/dashboard/properties/new",
    icon: ListPlus, // Could be HomePlus or similar
  },
  {
    title: "الاشتراكات",
    href: "/pricing", // Or a dedicated dashboard billing page
    icon: DollarSign,
  },
  {
    title: "الملف الشخصي",
    href: "/dashboard/profile", // Placeholder for profile page
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
    <nav className="grid items-start gap-2">
      {dashboardNavItems.map((item, index) => (
        <Link
          key={index}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "justify-start text-base p-3 transition-smooth",
            pathname === item.href
              ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
              : "hover:bg-accent hover:text-accent-foreground",
            
          )}
        >
          <item.icon className="mr-2 h-5 w-5 rtl:mr-0 rtl:ml-2" />
          {item.title}
        </Link>
      ))}
    </nav>
  )
}
