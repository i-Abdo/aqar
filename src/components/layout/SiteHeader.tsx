
import { AppLogo } from "./AppLogo";
import { MainNav } from "./MainNav";
import { UserAccountNav } from "./UserAccountNav";
// MobileNav is no longer used directly here for main navigation
// import { MobileNav } from "./MobileNav"; 
import { ThemeToggleButton } from "./ThemeToggleButton";
import { GlobalSearchInput } from "./GlobalSearchInput";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Left section (Visual Right in RTL) */}
        <div className="flex items-center">
          <AppLogo />
        </div>

        {/* Center section (MainNav for all, GlobalSearchInput for desktop) */}
        {/* On mobile, MainNav will take available space and scroll if needed */}
        {/* On desktop, MainNav and GlobalSearchInput will share space */}
        <div className="flex-1 flex items-center justify-center md:justify-start px-4 md:px-2">
          <div className="hidden md:block md:mr-4 rtl:md:ml-4 rtl:md:mr-0 lg:w-full lg:max-w-sm xl:max-w-md">
             <GlobalSearchInput />
          </div>
           <div className="flex-1 md:flex-none md:mx-auto"> {/* Allow MainNav to take space on mobile and center on desktop */}
            <MainNav />
          </div>
        </div>

        {/* Right section (Visual Left in RTL) */}
        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          <UserAccountNav /> {/* Replaces MobileNav trigger */}
        </div>
      </div>

      {/* Mobile Search Bar (positioned below the top bar on mobile) */}
      <div className="container mx-auto px-4 py-2 md:hidden">
        <GlobalSearchInput />
      </div>
    </header>
  );
}
