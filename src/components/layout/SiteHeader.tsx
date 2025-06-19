
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
      {/* Main Header Bar */}
      <div className="container flex h-16 items-center justify-between">
        {/* Group 1: Logo & Desktop Search (md:order-1) */}
        <div className="flex items-center gap-x-1 md:order-1">
          <AppLogo />
          {/* Desktop Search - Part of Group 1 visually on desktop */}
          <div className="hidden md:flex items-center ml-2">
            <div className="w-full max-w-sm lg:max-w-md xl:max-w-lg">
              <GlobalSearchInput />
            </div>
          </div>
        </div>

        {/* Group 2: MainNav for Desktop (md:order-2) */}
        {/* Changed mx-2 to mx-0 to make space "very small" */}
        <div className="hidden md:flex flex-1 items-center justify-center md:order-2 mx-0">
          <MainNav />
        </div>

        {/* Group 3: Toggles & User Nav (md:order-3) */}
        <div className="flex items-center gap-x-1 md:order-3">
          {/* Mobile Nav Trigger (Avatar/Menu) + Theme */}
          <div className="md:hidden flex items-center gap-x-1"> {/* Reordered for mobile: Avatar then ThemeToggle */}
            <UserAccountNav /> {/* Handles Avatar or Login/Signup */}
            <ThemeToggleButton />
          </div>
          {/* Desktop ThemeToggle + UserAccountNav */}
          <div className="hidden md:flex items-center gap-x-1">
            <ThemeToggleButton />
            <UserAccountNav />
          </div>
        </div>
      </div>

      {/* Mobile Search Bar (Below Header) */}
      <div className="md:hidden container mx-auto px-4 py-2 space-y-2">
        <GlobalSearchInput />
      </div>
    </header>
  );
}
