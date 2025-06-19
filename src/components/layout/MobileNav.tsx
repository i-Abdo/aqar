
"use client";

import * as React from "react";
import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";

import { siteConfig, type NavItem } from "@/config/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"; // Added SheetHeader, SheetTitle
import { useAuth } from "@/hooks/use-auth";
import { AppLogo } from "./AppLogo";
import { Separator } from "@/components/ui/separator";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const { user, isAdmin } = useAuth();

  const baseNavItems = siteConfig.mainNav.filter(item => {
    if (item.authRequired && !user) return false;
    if (item.adminRequired && !isAdmin) return false;
    return true;
  });

  const allLinks: (NavItem & { specialClass?: string })[] = [...baseNavItems];

  if (!user) {
    allLinks.push({ title: "تسجيل الدخول", href: "/login", specialClass: "text-primary" });
    allLinks.push({ title: "إنشاء حساب", href: "/signup", specialClass: "text-primary" });
  }

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
      <SheetContent side="left" className="flex flex-col p-0"> {/* Changed padding to p-0, added flex flex-col */}
        <SheetHeader className="px-6 pt-6 pb-2 border-b"> {/* Added SheetHeader with padding and border */}
          <AppLogo />
          <SheetTitle className="sr-only">القائمة الرئيسية</SheetTitle> {/* Added sr-only SheetTitle */}
        </SheetHeader>
        
        <ScrollArea className="flex-1 px-6 py-4"> {/* Adjusted padding and added flex-1 for scroll area */}
          <div className="flex flex-col">
            {allLinks.map((item, index) => (
              item.href && (
                <React.Fragment key={item.href + index}>
                  <MobileLink
                    href={item.href}
                    onOpenChange={setOpen}
                    className={cn("py-3 text-sm", item.specialClass)}
                  >
                    {item.title}
                  </MobileLink>
                  {index < allLinks.length - 1 && <Separator className="my-0 bg-border/70" />}
                </React.Fragment>
              )
            ))}
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
      className={cn("block text-foreground/80 hover:text-foreground transition-colors", className)}
      {...props}
    >
      {children}
    </Link>
  );
}
