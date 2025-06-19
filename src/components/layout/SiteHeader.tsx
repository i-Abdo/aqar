
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
      {/* flex-row-reverse for mobile (RTL: last DOM item is rightmost, first is leftmost) */}
      {/* md:flex-row for desktop (RTL: first DOM item is rightmost, last is leftmost, overridden by md:order) */}
      <div className="container flex h-16 items-center justify-between flex-row-reverse md:flex-row">
        
        {/* Group for Mobile Nav/Theme AND Desktop Search/User/Theme */}
        {/* On Mobile (due to flex-row-reverse): This is DOM Group 1, appears visually LAST (Left in RTL) */}
        {/* On Desktop: md:order-3, appears visually LAST (Left in RTL) */}
        <div className="flex items-center gap-2 md:gap-4 md:order-3">
          {/* Mobile Items */}
          <div className="md:hidden flex items-center">
            <MobileNav />
            <ThemeToggleButton />
          </div>
          {/* Desktop Items */}
          <div className="hidden md:flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-full max-w-xs lg:max-w-sm xl:max-w-md"> {/* Constrained search bar width */}
              <GlobalSearchInput />
            </div>
            <ThemeToggleButton />
            <UserAccountNav />
          </div>
        </div>
        
        {/* Group for Desktop MainNav */}
        {/* On Mobile: Hidden */}
        {/* On Desktop: md:order-2, appears visually in the CENTER */}
        <div className="hidden md:flex md:order-2 items-center justify-center flex-grow px-4"> {/* flex-grow helps center it between logo and actions */}
            <MainNav />
        </div>

        {/* Group for AppLogo */}
        {/* On Mobile (due to flex-row-reverse): This is DOM Group 3 (if MainNav was visible), appears visually FIRST (Right in RTL) */}
        {/* On Desktop: md:order-1, appears visually FIRST (Right in RTL) */}
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
