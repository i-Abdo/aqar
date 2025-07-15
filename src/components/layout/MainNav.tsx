
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { siteConfig, type NavItem, type NavItemGroup } from "@/config/site";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import React from "react";

export function MainNav() {
  const { user, isAdmin, isAdvertiser, userDashboardNotificationCount } = useAuth();
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>({});

  const handleOpenChange = (title: string, open: boolean) => {
    setOpenMenus(prev => ({ ...prev, [title]: open }));
  };

  const renderNavItem = (item: NavItem | NavItemGroup, index: number) => {
    if ("items" in item) { // It's a NavItemGroup
      const visibleItems = item.items.filter(subItem => {
        if (subItem.adminRequired && !isAdmin) return false;
        if (subItem.advertiserRequired && !isAdvertiser) return false;
        if (item.title === "لوحات التحكم" && !user) return false;
        if (subItem.authRequired && !user) return false;
        return true;
      });

      if (visibleItems.length === 0) {
        return null;
      }
      
      const isGroupActive = visibleItems.some(subItem => pathname.startsWith(subItem.href));
      const isOpen = openMenus[item.title] || false;

      return (
        <DropdownMenu key={index} open={isOpen} onOpenChange={(open) => handleOpenChange(item.title, open)}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              onMouseEnter={() => handleOpenChange(item.title, true)}
              className={cn(
                "transition-colors hover:text-primary px-2 py-2 flex items-center gap-1",
                isGroupActive ? "text-primary" : "text-foreground/60"
              )}
            >
              <span>{item.title}</span>
              <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-56" 
            align="start" 
            onMouseLeave={() => handleOpenChange(item.title, false)}
          >
            {visibleItems.map((subItem, subIndex) => (
              <DropdownMenuItem key={subIndex} asChild>
                <Link href={subItem.href} className="w-full flex flex-col items-start p-2">
                  <div className="font-medium text-foreground">{subItem.title}</div>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );

    } else { // It's a NavItem
      if (item.adminRequired && !isAdmin) return null;
      if (item.advertiserRequired && !isAdvertiser) return null;
      if (item.authRequired && !user) return null;

      const showBadge = item.href === "/dashboard" && user && userDashboardNotificationCount > 0;

      return (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "transition-colors hover:text-primary relative flex items-center gap-1.5 px-3 py-2 rounded-md",
            pathname === item.href ? "text-primary font-medium" : "text-foreground/60"
          )}
        >
          <span>{item.title}</span>
          {showBadge && (
            <Badge variant="destructive" className="px-1.5 py-0.5 text-[10px] leading-none h-4 rounded-full">
              {userDashboardNotificationCount > 9 ? '9+' : userDashboardNotificationCount}
            </Badge>
          )}
        </Link>
      );
    }
  };

  return (
    <nav className="flex items-center space-x-1 rtl:space-x-reverse text-sm">
      {siteConfig.mainNav.map((item, index) => renderNavItem(item, index))}
    </nav>
  );
}
