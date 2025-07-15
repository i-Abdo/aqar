
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
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export function MainNav() {
  const { user, isAdmin, isAdvertiser, userDashboardNotificationCount } = useAuth();
  const pathname = usePathname();

  const renderNavItem = (item: NavItem | NavItemGroup, index: number) => {
    if ("items" in item) { // It's a NavItemGroup
      const visibleItems = item.items.filter(subItem => {
        if (subItem.adminRequired && !isAdmin) return false;
        if (subItem.advertiserRequired && !isAdvertiser) return false;
        if (item.title === "لوحات التحكم" && !user) return false; // Hide entire Dashboards menu if not logged in
        if (subItem.authRequired && !user) return false; // This check is mostly for sub-items if needed
        return true;
      });

      if (visibleItems.length === 0) {
        return null;
      }
      
      // Check if any sub-item is active to highlight the main trigger
      const isGroupActive = visibleItems.some(subItem => pathname === subItem.href);

      return (
        <DropdownMenu key={index}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "transition-colors hover:text-primary px-2 py-2 flex items-center gap-1",
                isGroupActive ? "text-primary" : "text-foreground/60"
              )}
            >
              <span>{item.title}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="start">
            {visibleItems.map((subItem, subIndex) => (
              <DropdownMenuItem key={subIndex} asChild>
                <Link href={subItem.href} className="w-full flex flex-col items-start p-2">
                  <div className="font-medium text-foreground">{subItem.title}</div>
                  {subItem.description && (
                    <p className="text-xs text-muted-foreground">{subItem.description}</p>
                  )}
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
