
"use client"; 

import React from "react";
import { AppLogo } from "./AppLogo";
import { MainNav } from "./MainNav";
import { UserAccountNav } from "./UserAccountNav";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { GlobalSearchInput } from "./GlobalSearchInput";
import { cn } from "@/lib/utils";

export function SiteHeader() {

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/40",
        "bg-header-background/95 backdrop-blur supports-[backdrop-filter]:bg-header-background/80 shadow-sm"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-x-2 md:gap-x-6">
          <AppLogo />
          <nav className="hidden md:flex">
            <MainNav />
          </nav>
        </div>

        <div className="hidden md:flex flex-1 items-center justify-center max-w-sm lg:max-w-md mx-4">
          <GlobalSearchInput />
        </div>
        
        <div className="flex items-center gap-x-1 shrink-0">
           <nav className="flex md:hidden items-center gap-x-4 text-sm font-medium mr-2 rtl:ml-2 rtl:mr-0">
              {/* Mobile navigation links can be added here if needed */}
           </nav>
           <div className="hidden md:block">
              <ThemeToggleButton />
           </div>
          <UserAccountNav />
        </div>
      </div>

      <div className="md:hidden container mx-auto px-4 pt-1 pb-2 flex items-center gap-4">
        <GlobalSearchInput />
        <ThemeToggleButton />
      </div>
    </header>
  );
}
