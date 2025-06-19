
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
      <div className="container flex h-16 items-center justify-between flex-row-reverse md:flex-row">
        
        {/* GROUP 1: Logo (Right on LTR, Right on RTL) & Desktop Search (Center) */}
        {/* On mobile, due to parent flex-row-reverse, AppLogo (order-1 within this group) is visually on the RIGHT */}
        {/* On desktop, this entire group is md:order-1 (overall right for LTR, becomes tricky with internal orders for RTL) */}
        {/* Let's simplify: Logo is order-1, Search is order-2, Navs are order-3 for desktop */}

        <div className="flex items-center gap-x-1 md:order-1"> {/* Logo Group */}
          <AppLogo />
        </div>
        
        {/* Search Group - Center on Desktop */}
        <div className="hidden md:flex flex-1 items-center justify-center md:order-2 mx-2"> {/* Reduced mx-4 to mx-2 */}
          <div className="w-full max-w-sm lg:max-w-md xl:max-w-lg">
            <GlobalSearchInput />
          </div>
        </div>

        {/* GROUP 3: Navs & Toggles (Left on LTR, Left on RTL) */}
        {/* On mobile, due to parent flex-row-reverse, this group is visually on the LEFT */}
        {/* On desktop, this entire group is md:order-3 */}
        <div className="flex items-center gap-x-2 md:order-3">
          {/* MainNav for Desktop - always visible */}
          <div className="hidden md:flex">
             <MainNav />
          </div>
          {/* UserAccountNav and ThemeToggle for All sizes */}
          <div className="flex items-center gap-x-1"> {/* Reduced gap here if needed */}
            <ThemeToggleButton />
            <UserAccountNav /> {/* This handles mobile (avatar/menu) & desktop */}
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

