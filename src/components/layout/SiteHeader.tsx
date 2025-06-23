
"use client"; 

import React from "react";
import { AppLogo } from "./AppLogo";
import { MainNav } from "./MainNav";
import { UserAccountNav } from "./UserAccountNav";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { GlobalSearchInput } from "./GlobalSearchInput";
import { cn } from "@/lib/utils";
import Link from 'next/link';

export function SiteHeader() {

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/40",
        "bg-header-background/95 backdrop-blur supports-[backdrop-filter]:bg-header-background/80 shadow-sm",
        "h-auto md:h-14" // Auto height for mobile, fixed for desktop
      )}
    >
      <div className="container flex h-full flex-col justify-center gap-2 py-2 md:flex-row md:items-center md:py-0">
        {/* Top row content for mobile, becomes the full row for desktop */}
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-x-6">
            <AppLogo />
            <nav className="hidden md:flex">
              <MainNav />
            </nav>
          </div>

          <div className="hidden flex-1 items-center justify-center px-6 md:flex">
            <div className="w-full max-w-sm lg:max-w-md">
              <GlobalSearchInput />
            </div>
          </div>
          
          <div className="flex items-center gap-x-1 shrink-0">
             <nav className="flex md:hidden items-center gap-x-2 text-sm font-medium mr-2 rtl:ml-2 rtl:mr-0">
                <Link href="/" className="text-foreground/80 hover:text-primary transition-colors p-2 rounded-md">الرئيسية</Link>
                <Link href="/pricing" className="text-foreground/80 hover:text-primary transition-colors p-2 rounded-md">الأسعار</Link>
             </nav>
             <ThemeToggleButton />
            <UserAccountNav />
          </div>
        </div>

        {/* Bottom row content for mobile */}
        <div className="flex w-full items-center gap-4 md:hidden">
          <GlobalSearchInput />
        </div>
      </div>
    </header>
  );
}
