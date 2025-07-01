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
        {/* Left Group */}
        <div className="flex items-center justify-start flex-1">
          <AppLogo />
        </div>

        {/* Center Group (Nav) */}
        <div className="flex items-center justify-center">
          <MainNav />
        </div>

        {/* Right Group */}
        <div className="flex items-center justify-end flex-1 gap-x-1">
          <ThemeToggleButton />
          <UserAccountNav />
        </div>
      </div>
    </header>
  );
}
