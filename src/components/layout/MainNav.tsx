"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { siteConfig, type NavItem } from "@/config/site";
import { useAuth } from "@/hooks/use-auth";

export function MainNav() {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();

  const navItemsToDisplay = siteConfig.mainNav.filter(item => {
    if (item.authRequired && !user) return false;
    if (item.adminRequired && !isAdmin) return false;
    return true;
  });

  return (
    <nav className="hidden md:flex items-center space-x-6 rtl:space-x-reverse text-sm font-medium">
      {navItemsToDisplay.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "transition-colors hover:text-primary",
            pathname === item.href ? "text-primary" : "text-foreground/60"
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
