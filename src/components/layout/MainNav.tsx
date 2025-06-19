
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { siteConfig, type NavItem } from "@/config/site";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";

export function MainNav() {
  const pathname = usePathname();
  const { user, isAdmin, userDashboardNotificationCount, adminNotificationCount } = useAuth();

  const navItemsToDisplay = siteConfig.mainNav.filter(item => {
    if (item.authRequired && !user) return false;
    if (item.adminRequired && !isAdmin) return false;
    return true;
  });

  return (
    <nav className={cn(
      "flex items-center space-x-4 rtl:space-x-reverse text-sm font-medium",
      "overflow-x-auto whitespace-nowrap py-2 md:py-0", // For mobile: scrollable, some padding
      "md:overflow-visible md:whitespace-normal md:space-x-6" // For desktop: normal flow
    )}>
      {navItemsToDisplay.map((item) => {
        let showBadge = false;
        let countToShow = 0;

        if (item.href === "/dashboard" && user && userDashboardNotificationCount > 0) {
          showBadge = true;
          countToShow = userDashboardNotificationCount;
        } else if (item.href === "/admin/properties" && user && isAdmin && adminNotificationCount > 0) {
          showBadge = true;
          countToShow = adminNotificationCount;
        }
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "transition-colors hover:text-primary relative flex items-center gap-1.5 px-1 md:px-0", // Added some padding for mobile scroll items
              pathname === item.href ? "text-primary" : "text-foreground/60"
            )}
          >
            <span>{item.title}</span>
            {showBadge && (
              <Badge 
                variant="destructive" 
                className="px-1.5 py-0.5 text-[10px] leading-none h-4 rounded-full"
              >
                {countToShow > 9 ? '9+' : countToShow}
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
