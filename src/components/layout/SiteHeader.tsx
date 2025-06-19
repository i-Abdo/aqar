
import { AppLogo } from "./AppLogo";
import { MainNav } from "./MainNav";
import { UserAccountNav } from "./UserAccountNav";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { GlobalSearchInput } from "./GlobalSearchInput";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className={cn(
        "sticky top-0 z-50 w-full border-b border-border/40",
        "bg-header-background/95 backdrop-blur supports-[backdrop-filter]:bg-header-background/80 shadow-lg" 
      )}
    >
      <div className="container flex h-16 items-center justify-between md:flex-row flex-row-reverse">
        {/* Section 1: Logo (Right on LTR, also Right on RTL due to parent flex-row-reverse for mobile) */}
        {/* For Desktop (md and up), order-1 makes it first (visually right in RTL) */}
        <div className="flex items-center md:order-1">
          <AppLogo />
        </div>

        {/* Section 2: MainNav (Center-ish on LTR) */}
        {/* For Desktop (md and up), order-2 places it after Logo (visually center/left of logo in RTL) */}
        <div className="hidden md:flex flex-1 items-center justify-center md:order-2 mx-4">
          <MainNav />
        </div>
        
        {/* Section 3: Search, Theme, UserNav (Left on LTR) */}
        {/* For Desktop (md and up), order-3 places it last (visually left in RTL) */}
        <div className={cn(
            "flex items-center gap-2",
            "md:order-3 md:ml-auto rtl:md:mr-auto" // ml-auto for LTR, mr-auto for RTL on desktop
          )}
        >
          {/* Desktop Search - integrated here */}
          <div className="hidden md:block w-full max-w-xs lg:max-w-md xl:max-w-lg">
            <GlobalSearchInput />
          </div>
          <ThemeToggleButton />
          <UserAccountNav /> {/* This handles user avatar/login/signup & mobile menu trigger */}
        </div>
      </div>

      {/* Mobile Search Bar & MainNav (visible only on mobile) */}
      <div className="md:hidden container mx-auto px-4 py-2 space-y-2">
        <GlobalSearchInput />
        <div className="flex-1 flex items-center justify-center overflow-x-auto">
           <MainNav /> {/* MainNav is now visible and scrollable on mobile */}
        </div>
      </div>
    </header>
  );
}
