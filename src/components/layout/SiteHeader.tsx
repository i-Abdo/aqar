
import { AppLogo } from "./AppLogo";
import { MainNav } from "./MainNav";
import { UserAccountNav } from "./UserAccountNav";
import { MobileNav } from "./MobileNav";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { GlobalSearchInput } from "./GlobalSearchInput";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Left Group */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile: Hamburger and ThemeToggle */}
          <div className="md:hidden flex items-center">
            <MobileNav />
            <ThemeToggleButton />
          </div>
          {/* Desktop: Logo */}
          <div className="hidden md:block">
            <AppLogo />
          </div>
        </div>

        {/* Center Group (Desktop Only): Search Bar */}
        <div className="hidden md:flex flex-1 justify-center px-4 lg:px-8">
          <div className="w-full max-w-xl"> {/* Constrain search bar width */}
            <GlobalSearchInput />
          </div>
        </div>

        {/* Right Group */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile: Logo */}
          <div className="md:hidden">
            <AppLogo />
          </div>
          {/* Desktop: MainNav, ThemeToggle, UserAccountNav */}
          <div className="hidden md:flex items-center space-x-3 rtl:space-x-reverse">
            <MainNav />
            <ThemeToggleButton />
            <UserAccountNav />
          </div>
        </div>
      </div>
    </header>
  );
}
