"use client";

import * as React from "react";
import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Building2 } from "lucide-react";

import { siteConfig, type NavItem } from "@/config/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { AppLogo } from "./AppLogo";


export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const { user, isAdmin } = useAuth();

  const navItemsToDisplay = siteConfig.mainNav.filter(item => {
    if (item.authRequired && !user) return false;
    if (item.adminRequired && !isAdmin) return false;
    return true;
  });


  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="px-2 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="pr-0">
        <div className="px-4">
          <AppLogo />
        </div>
        
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-3">
            {navItemsToDisplay.map(
              (item) =>
                item.href && (
                  <MobileLink
                    key={item.href}
                    href={item.href}
                    onOpenChange={setOpen}
                  >
                    {item.title}
                  </MobileLink>
                )
            )}
          </div>
          <div className="mt-6 flex flex-col space-y-2">
            {!user ? (
              <>
                <MobileLink href="/login" onOpenChange={setOpen} className="text-primary">
                  تسجيل الدخول
                </MobileLink>
                <MobileLink href="/signup" onOpenChange={setOpen} className="text-primary">
                  إنشاء حساب
                </MobileLink>
              </>
            ) : (
              <>
                <MobileLink href="/dashboard" onOpenChange={setOpen}>لوحة التحكم</MobileLink>
                {isAdmin && <MobileLink href="/admin/properties" onOpenChange={setOpen}>الإدارة</MobileLink>}
                {/* Add sign out button here if desired, or rely on UserAccountNav for desktop */}
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

interface MobileLinkProps extends LinkProps {
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

function MobileLink({
  href,
  onOpenChange,
  className,
  children,
  ...props
}: MobileLinkProps) {
  const router = useRouter();
  return (
    <Link
      href={href}
      onClick={() => {
        router.push(href.toString());
        onOpenChange?.(false);
      }}
      className={cn("text-foreground/70 hover:text-foreground", className)}
      {...props}
    >
      {children}
    </Link>
  );
}
