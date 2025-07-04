
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const { user, isAdmin } = useAuth();
  const isMobile = useIsMobile();

  // Don't render anything on desktop. This is checked by the hook
  // but also by the className `md:hidden` on the button for good measure.
  if (!isMobile) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          aria-label="Toggle Menu"
          className="fixed top-16 right-4 z-50 h-12 w-12 rounded-full shadow-lg md:hidden"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] p-0 flex flex-col">
        <SheetHeader className="p-4 border-b shrink-0">
          <SheetTitle className="font-headline text-lg font-semibold">
            القائمة
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-grow">
          <nav className="flex flex-col space-y-2 p-4">
            {siteConfig.mainNav.map((item) => {
              if (item.adminRequired && (!user || !isAdmin)) {
                return null;
              }
              if (item.authRequired && !user) {
                return null;
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md p-3 text-lg font-medium text-foreground/80 hover:bg-accent"
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
