
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
      <div className="container flex h-full items-center">
        {/* Right Side (in RTL) */}
        <div className="flex items-center gap-4">
          <AppLogo />
        </div>

        {/* Center: Main Navigation */}
        <div className="flex flex-1 justify-center">
          <div className="hidden md:flex">
            <MainNav />
          </div>
        </div>

        {/* Left Side (in RTL) */}
        <div className="flex items-center gap-1">
          <UserAccountNav />
          <ThemeToggleButton />
        </div>
      </div>
    </header>
  );
}
