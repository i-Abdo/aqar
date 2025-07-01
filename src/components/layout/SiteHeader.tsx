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
        {/* Left side: Logo and main navigation */}
        <div className="flex items-center gap-x-2 md:gap-x-6">
          <AppLogo />
          <MainNav />
        </div>

        {/* Spacer to push right content to the end */}
        <div className="flex-1" />

        {/* Right side: Theme toggle and user menu */}
        <div className="flex items-center gap-x-1 shrink-0">
          <ThemeToggleButton />
          <UserAccountNav />
        </div>
      </div>
    </header>
  );
}
