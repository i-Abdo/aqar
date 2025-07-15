
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
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
import { siteConfig, NavItem, NavItemGroup } from "@/config/site";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const { user, isAdmin, isAdvertiser } = useAuth();
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null;
  }

  const renderMobileNavItem = (item: NavItem | NavItemGroup, index: number) => {
    if ("items" in item) { // It's a NavItemGroup
      const visibleItems = item.items.filter(subItem => {
        if (subItem.adminRequired && !isAdmin) return false;
        if (subItem.advertiserRequired && !isAdvertiser) return false;
        if (item.title === "لوحات التحكم" && !user) return false;
        if (subItem.authRequired && !user) return false;
        return true;
      });

      if (visibleItems.length === 0) return null;

      return (
        <AccordionItem key={index} value={`item-${index}`} className="border-b-0">
          <AccordionTrigger className="py-3 text-lg font-medium text-foreground/80 hover:bg-accent rounded-md px-3 hover:no-underline">
            {item.title}
          </AccordionTrigger>
          <AccordionContent className="pb-0">
            <div className="flex flex-col space-y-1 pl-6">
              {visibleItems.map((subItem, subIndex) => (
                <Link
                  key={subIndex}
                  href={subItem.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md p-3 text-base font-medium text-foreground/70 hover:bg-accent"
                >
                  {subItem.title}
                </Link>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      );
    } else { // It's a NavItem
      if (item.adminRequired && !isAdmin) return null;
      if (item.authRequired && !user) return null;
      if (item.advertiserRequired && !isAdvertiser) return null;

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
    }
  };

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
          <Accordion type="multiple" className="w-full p-4">
            {siteConfig.mainNav.map((item, index) => renderMobileNavItem(item, index))}
          </Accordion>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
