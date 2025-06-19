
import { AppLogo } from "./AppLogo";
import { MainNav } from "./MainNav";
import { UserAccountNav } from "./UserAccountNav";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { GlobalSearchInput } from "./GlobalSearchInput";
import { cn } from "@/lib/utils";
import { MobileNav } from "./MobileNav";

export function SiteHeader() {
  return (
    <header className={cn(
        "sticky top-0 z-50 w-full border-b border-border/40",
        "bg-header-background/95 backdrop-blur supports-[backdrop-filter]:bg-header-background/80 shadow-lg" 
      )}
    >
      {/* Main Header Bar */}
      <div className="container flex h-16 items-center justify-between flex-row-reverse md:flex-row">
        
        {/* GROUP FOR DESKTOP ORDER 3 (Navs, Toggles) & MOBILE LEFT ITEMS (Theme, MobileNav Trigger) */}
        {/* On mobile (due to parent flex-row-reverse), this group is visually on the LEFT */}
        {/* On desktop, this group is md:order-3, visually on the LEFT */}
        <div className="flex items-center gap-2 md:order-3">
          {/* Desktop MainNav - Hidden on mobile */}
          <div className="hidden md:flex">
            <MainNav />
          </div>
          {/* Mobile Theme Toggle & Nav Trigger - Mobile only */}
          <div className="md:hidden flex items-center">
            <ThemeToggleButton /> {/* Theme toggle first */}
            <MobileNav /> {/* Then MobileNav trigger */}
          </div>
          {/* Desktop Theme Toggle & User Account Nav - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggleButton />
            <UserAccountNav />
          </div>
        </div>

        {/* GROUP FOR DESKTOP ORDER 2 (Search) */}
        {/* Hidden on Mobile. On desktop, md:order-2 makes it visually center */}
        <div className="hidden md:flex flex-1 items-center justify-center md:order-2 mx-4">
          <div className="w-full max-w-sm lg:max-w-md xl:max-w-lg"> {/* Increased max-width for desktop search */}
            <GlobalSearchInput />
          </div>
        </div>
        
        {/* GROUP FOR DESKTOP ORDER 1 (Logo) & MOBILE RIGHT ITEM (Logo) */}
        {/* On mobile (due to parent flex-row-reverse), this group is visually on the RIGHT */}
        {/* On desktop, this group is md:order-1, visually on the RIGHT */}
        <div className="flex items-center md:order-1">
          <AppLogo />
        </div>
      </div>

      {/* Mobile Search Bar (Below Header) - Unchanged from previous state */}
      <div className="md:hidden container mx-auto px-4 py-2 space-y-2">
        <GlobalSearchInput />
      </div>
    </header>
  );
}
