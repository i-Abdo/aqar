
"use client"; 

import React from "react";
import { AppLogo } from "./AppLogo";
import { MainNav } from "./MainNav";
import { UserAccountNav } from "./UserAccountNav";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/hooks/use-auth";

export function SiteHeader() {
  const [open, setOpen] = React.useState(false);
  const { user, isAdmin } = useAuth();
  
  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/40",
        "bg-header-background/95 backdrop-blur supports-[backdrop-filter]:bg-header-background/80 shadow-sm",
        "h-16"
      )}
    >
      <div className="container flex h-full items-center justify-between">
        {/* Right Side (in RTL): On Desktop, show Logo & Nav. On Mobile, show Menu Icon. */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            <AppLogo />
            <MainNav />
          </div>
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Toggle Menu"
                  className="h-12 w-12"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-0 flex flex-col">
                 <SheetTitle className="sr-only">القائمة</SheetTitle>
                 <SheetDescription className="sr-only">روابط التنقل في الموقع</SheetDescription>
                 
                 <div className="flex items-center justify-between p-4 border-b shrink-0">
                    <span className="font-headline text-lg font-semibold">القائمة</span>
                    <SheetClose asChild>
                       <Button variant="ghost" size="icon" aria-label="Close menu">
                          <X className="h-5 w-5" />
                       </Button>
                    </SheetClose>
                 </div>
                 <ScrollArea className="flex-grow">
                   <div className="flex flex-col space-y-2 p-4">
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
                   </div>
                 </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Left Side (in RTL): On Desktop, show UserNav & Theme. On Mobile, show Logo, UserNav, & Theme */}
        <div className="flex items-center gap-1">
          <div className="md:hidden">
            <AppLogo />
          </div>
          <UserAccountNav />
          <ThemeToggleButton />
        </div>
      </div>
    </header>
  );
}
