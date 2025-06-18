
import { AppLogo } from "./AppLogo";
import { MainNav } from "./MainNav";
import { UserAccountNav } from "./UserAccountNav";
import { MobileNav } from "./MobileNav"; // Assuming MobileNav for smaller screens
import { ThemeToggleButton } from "./ThemeToggleButton"; // Added import

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <AppLogo />
        <div className="hidden md:block flex-1">
            <div className="flex justify-center"> 
                <MainNav />
            </div>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2 rtl:space-x-reverse rtl:space-x-0"> {/* Adjusted space-x for RTL compatibility */}
          <ThemeToggleButton /> {/* Added theme toggle button */}
          <div className="hidden md:flex">
            <UserAccountNav />
          </div>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
