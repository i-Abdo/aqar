
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
        "bg-header-background/95 backdrop-blur supports-[backdrop-filter]:bg-header-background/80 shadow-sm"
      )}
    >
      <div className="container flex h-14 items-center justify-between">
        {/* START GROUP (Right in RTL) */}
        <div className="flex items-center gap-x-6">
          <AppLogo />
          <nav className="hidden md:flex">
            <MainNav />
          </nav>
        </div>

        {/* MIDDLE GROUP (Desktop only) */}
        <div className="hidden md:flex items-center justify-center">
          <div className="w-full max-w-sm lg:max-w-md">
            <GlobalSearchInput />
          </div>
        </div>
        
        {/* END GROUP (Left in RTL) */}
        <div className="flex items-center gap-x-1 shrink-0">
           <nav className="flex md:hidden items-center gap-x-4 text-sm font-medium mr-2 rtl:ml-2 rtl:mr-0">
              <Link href="/" className="text-foreground/80 hover:text-primary transition-colors">الرئيسية</Link>
              <Link href="/pricing" className="text-foreground/80 hover:text-primary transition-colors">الأسعار</Link>
           </nav>
           <ThemeToggleButton />
          <UserAccountNav />
        </div>
      </div>

      {/* Second row on mobile */}
      <div className="md:hidden container mx-auto px-4 pb-2 flex items-center gap-4">
        <GlobalSearchInput />
      </div>
    </header>
  );
}
