
import { AppLogo } from "./AppLogo";
import { MainNav } from "./MainNav";
import { UserAccountNav } from "./UserAccountNav";
import { MobileNav } from "./MobileNav";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { GlobalSearchInput } from "./GlobalSearchInput";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Bar */}
      {/* Base is flex-row-reverse for mobile RTL (last DOM item is rightmost visually) */}
      {/* md:flex-row ensures normal LTR-like DOM order for desktop logic (first DOM item is rightmost visually in RTL) */}
      <div className="container flex h-16 items-center justify-between flex-row-reverse md:flex-row">
        
        {/* Group 1 (Mobile: Appears Left due to flex-row-reverse | Desktop: Order 3, Appears Left) */}
        {/* Contains: Mobile Nav/Theme, Desktop Search/User/Theme */}
        <div className="flex items-center gap-2 md:gap-4 md:order-3">
          {/* Mobile Only Items */}
          <div className="md:hidden flex items-center">
            <MobileNav />
            <ThemeToggleButton />
          </div>
          {/* Desktop Only Items */}
          <div className="hidden md:flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-full max-w-sm lg:max-w-md xl:max-w-lg"> {/* Increased max-width */}
              <GlobalSearchInput />
            </div>
            <ThemeToggleButton />
            <UserAccountNav />
          </div>
        </div>
        
        {/* Group 2 (Mobile: Hidden | Desktop: Order 2, Appears Center) */}
        {/* Contains: Desktop MainNav */}
        <div className="hidden md:flex md:order-2 items-center justify-center flex-grow px-4">
            <MainNav />
        </div>

        {/* Group 3 (Mobile: Appears Right due to flex-row-reverse | Desktop: Order 1, Appears Right) */}
        {/* Contains: AppLogo */}
        <div className="flex items-center md:order-1">
          <AppLogo />
        </div>

      </div>

      {/* Mobile Search Bar (positioned below the top bar on mobile) */}
      <div className="container mx-auto px-4 py-2 md:hidden">
        <GlobalSearchInput />
      </div>
    </header>
  );
}
