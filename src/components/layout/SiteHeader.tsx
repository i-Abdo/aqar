"use client"; 

import React from "react";
import { AppLogo } from "./AppLogo";
import { MainNav } from "./MainNav";
import { UserAccountNav } from "./UserAccountNav";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { cn } from "@/lib/utils";

export function SiteHeader() {

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/40",
        "bg-header-background/95 backdrop-blur supports-[backdrop-filter]:bg-header-background/80 shadow-sm",
        "h-16" // Use a standard, single-row height
      )}
    >
      <div className="container flex h-full items-center">
        {/* Right-aligned Group (in RTL) */}
        <div className="flex flex-1 justify-start">
            <div className="flex items-center gap-x-1">
                <UserAccountNav />
                <ThemeToggleButton />
            </div>
        </div>

        {/* Center Group */}
        <div className="flex justify-center">
          <MainNav />
        </div>

        {/* Left-aligned Group (in RTL) */}
        <div className="flex flex-1 justify-end">
            <AppLogo />
        </div>
      </div>
    </header>
  );
}
