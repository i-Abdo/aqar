
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
        "sticky top-0 z-40 w-full border-b border-border/40",
        "bg-header-background/95 backdrop-blur supports-[backdrop-filter]:bg-header-background/80 shadow-sm",
        "h-16"
      )}
    >
      <div className="container flex h-full items-center justify-between">
        {/* Left side (in RTL): Logo */}
        <div className="flex items-center">
          <AppLogo />
        </div>

        {/* Center: Main Nav (Desktop only) */}
        <div className="hidden md:flex flex-1 items-center justify-center">
          <MainNav />
        </div>

        {/* Right Side (in RTL): User Nav & Theme Toggle */}
        <div className="flex items-center gap-1">
          <UserAccountNav />
          <ThemeToggleButton />
        </div>
      </div>
    </header>
  );
}
