"use client";

import * as React from "react";
import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { AppLogo } from "./AppLogo";
import { Separator } from "@/components/ui/separator";
import { ThemeToggleButton } from "./ThemeToggleButton";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const { user, isAdmin } = useAuth();

  const navItems = siteConfig.mainNav.filter(item => {
    if (item.authRequired && !user) return false;
    if (item.adminRequired && !isAdmin) return false;
    return true;
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon" 
          className="text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-2 border-b">
          <AppLogo />
          <SheetTitle className="sr-only">القائمة الرئيسية</SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="flex-1 px-6 py-4">
          <div className="flex flex-col">
            {navItems.map((item, index) => (
              item.href && (
                <React.Fragment key={item.href + index}>
                  <MobileLink
                    href={item.href}
                    onOpenChange={setOpen}
                    className="py-3 text-sm"
                  >
                    {item.title}
                  </MobileLink>
                  {index < navItems.length - 1 && <Separator className="my-0 bg-border/70" />}
                </React.Fragment>
              )
            ))}

            {!user && (
              <>
                <Separator className="my-0 bg-border/70" />
                <MobileLink href="/login" onOpenChange={setOpen} className="py-3 text-sm text-primary">
                  تسجيل الدخول
                </MobileLink>
                <Separator className="my-0 bg-border/70" />
                <MobileLink href="/signup" onOpenChange={setOpen} className="py-3 text-sm text-primary">
                  إنشاء حساب
                </MobileLink>
              </>
            )}
          </div>
        </ScrollArea>

        <div className="mt-auto p-4 border-t">
          <ThemeToggleButton />
        </div>
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
      className={cn("block text-foreground/80 hover:text-foreground transition-colors", className)}
      {...props}
    >
      {children}
    </Link>
  );
}
