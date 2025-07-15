
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { siteConfig, type NavItem } from "@/config/site";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";

export function MainNav() {
  const { user, isAdmin, userDashboardNotificationCount } = useAuth();
  const pathname = usePathname();
  const isAdvertiser = user?.roles?.includes('advertiser');

  return (
    <nav className={cn(
      "flex items-center space-x-6 rtl:space-x-reverse text-sm font-medium"
    )}>
      {siteConfig.mainNav.map((item) => {
        if (item.adminRequired && (!user || !isAdmin)) {
          return null;
        }
        if (item.advertiserRequired && (!user || !isAdvertiser)) {
          return null;
        }
        if (item.authRequired && !user) {
            return null;
        }

        let showBadge = false;
        let countToShow = 0;

        if (item.href === "/dashboard" && user && userDashboardNotificationCount > 0) {
          showBadge = true;
          countToShow = userDashboardNotificationCount;
        }
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "transition-colors hover:text-primary relative flex items-center gap-1.5 px-1 py-2 rounded-md",
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
