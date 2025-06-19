
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
        <div className="md:order-1"> 
          <AppLogo />
        </div>

        {/* Group 2: Desktop Search (md:order-2 visually) */}
        <div className="hidden md:flex flex-1 items-center justify-center md:order-2 mx-2"> 
          <div className="w-full max-w-lg lg:max-w-xl xl:max-w-2xl"> 
            <GlobalSearchInput />
          </div>
        </div>
        
        {/* Group 3: MainNav for Desktop (md:order-3 visually) */}
        <div className="hidden md:flex flex-1 items-center justify-center md:order-3 mx-2"> 
          <MainNav />
        </div>

        {/* Group 4: Toggles & User Nav (md:order-4 visually) */}
        <div className="flex items-center gap-x-1 md:order-4">
          <div className="flex items-center"> {/* Simplified: ThemeToggle and UserAccountNav are now always in this flex container */}
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
