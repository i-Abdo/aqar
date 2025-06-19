
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
      <div className="container flex h-16 items-center justify-between"> {/* Parent Flex Container */}
        
        {/* Group 1: Logo (md:order-1 visually) */}
        <div className="md:order-1"> {/* Adjusted to not be flex itself, just a container for logo */}
          <AppLogo />
        </div>

        {/* Group 2: Desktop Search (md:order-2 visually) */}
        {/* This group will have flex-1 to take up available space */}
        <div className="hidden md:flex flex-1 items-center justify-center md:order-2 mx-2"> 
          {/* Increased max-widths significantly. w-full makes the input take the width of this div. */}
          <div className="w-full max-w-xl lg:max-w-2xl xl:max-w-3xl"> 
            <GlobalSearchInput />
          </div>
        </div>
        
        {/* Group 3: MainNav for Desktop (md:order-3 visually) */}
        {/* MainNav should not have flex-1 so it doesn't push the search bar. Added mx-2 for spacing. */}
        <div className="hidden md:flex items-center justify-center md:order-3 mx-2"> 
          <MainNav />
        </div>

        {/* Group 4: Toggles & User Nav (md:order-4 visually) */}
        <div className="flex items-center gap-x-1 md:order-4">
          {/* Mobile Only Items */}
          <div className="md:hidden flex items-center">
            <ThemeToggleButton />
            <UserAccountNav /> 
          </div>
          {/* Desktop Only Items */}
          <div className="hidden md:flex items-center">
            <ThemeToggleButton />
            <UserAccountNav />
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden container mx-auto px-4 py-2 space-y-2">
        <GlobalSearchInput />
      </div>
    </header>
  );
}
