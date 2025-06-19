
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
        {/* Section 1 (Right-most in RTL): Logo (Desktop & Mobile) */}
        <div className="flex items-center">
          <AppLogo />
        </div>

        {/* Section 2 (Center for Desktop): Search Bar (Hidden on Mobile) */}
        <div className="hidden md:flex flex-1 justify-center px-4 lg:px-8">
          <div className="w-full max-w-xl">
            <GlobalSearchInput />
          </div>
        </div>

        {/* Section 3 (Left-most in RTL): Navigations and Toggles */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Desktop: MainNav, ThemeToggle, UserAccountNav */}
          <div className="hidden md:flex items-center space-x-3 rtl:space-x-reverse">
            <MainNav />
            <ThemeToggleButton />
            <UserAccountNav />
          </div>
          {/* Mobile: MobileNav and ThemeToggle */}
          <div className="md:hidden flex items-center">
            <MobileNav />
            <ThemeToggleButton />
          </div>
        </div>
      </div>
    </header>
  );
}
