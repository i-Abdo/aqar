
"use client"; 

import React, { useState, useEffect, useCallback } from "react"; // Added React and hooks
import { AppLogo } from "./AppLogo";
import { MainNav } from "./MainNav";
import { UserAccountNav } from "./UserAccountNav";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { GlobalSearchInput } from "./GlobalSearchInput";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile"; // Added useIsMobile

export function SiteHeader() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isScrolled, setIsScrolled] = useState(false);

  // Values for header height calculation
  const HEADER_HEIGHT_MAIN = "4rem"; // Corresponds to h-16
  const MOBILE_SEARCH_CONTAINER_HEIGHT = "3.25rem"; // pt-1 (0.25) + h-10 input (2.5) + pb-2 (0.5)
  const TOTAL_MOBILE_HEADER_HEIGHT = "7.25rem"; // 4rem + 3.25rem

  // Effect to update --current-sticky-header-height CSS variable
  useEffect(() => {
    const root = document.documentElement;
    if (isMobile === undefined) return; // Wait for isMobile to be determined

    if (isMobile) {
      if (isScrolled) {
        root.style.setProperty('--current-sticky-header-height', MOBILE_SEARCH_CONTAINER_HEIGHT);
      } else {
        root.style.setProperty('--current-sticky-header-height', TOTAL_MOBILE_HEADER_HEIGHT);
      }
    } else { // Desktop
      root.style.setProperty('--current-sticky-header-height', HEADER_HEIGHT_MAIN);
    }
  }, [isScrolled, isMobile, HEADER_HEIGHT_MAIN, MOBILE_SEARCH_CONTAINER_HEIGHT, TOTAL_MOBILE_HEADER_HEIGHT]);

  // Effect for scroll detection to hide/show main header part
  useEffect(() => {
    let lastScrollTop = 0;
    const scrollThreshold = 10; // Pixels

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > lastScrollTop && scrollTop > scrollThreshold) {
        setIsScrolled(true); // Scrolling Down
      } else if (scrollTop < lastScrollTop || scrollTop <= scrollThreshold) {
        setIsScrolled(false); // Scrolling Up or near top
      }
      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      // Clean up CSS variable on unmount if needed, though it might not be necessary
      // document.documentElement.style.removeProperty('--current-sticky-header-height');
    };
  }, []);


  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/40",
        "bg-header-background/95 backdrop-blur supports-[backdrop-filter]:bg-header-background/80 shadow-lg"
      )}
      data-scrolled={isScrolled} // Attribute to control styles via CSS
    >
      {/* Main Header Bar - This part will hide/show */}
      <div className={cn(
        "container flex h-16 items-center justify-between",
        "main-header-bar" // Class for CSS targeting
        )}
      > 
        <div className="md:order-1"> 
          <AppLogo />
        </div>
        <div className="hidden md:flex flex-1 items-center justify-center md:order-3 mx-2"> 
          <MainNav />
        </div>
        <div className="hidden md:flex flex-1 items-center justify-center md:order-2 mx-2"> 
          <div className="w-full max-w-lg lg:max-w-xl xl:max-w-2xl"> 
            <GlobalSearchInput />
          </div>
        </div>
        <div className="flex items-center gap-x-1 md:order-4">
          <div className="flex items-center">
            {user && <ThemeToggleButton />}
            <UserAccountNav /> 
          </div>
        </div>
      </div>

      {/* Mobile Search Bar - This part might stay or adjust */}
      <div className={cn(
        "md:hidden container mx-auto px-4 pt-1 pb-2",
        "mobile-search-bar-container" // Class for CSS targeting
        )}
      >
        <GlobalSearchInput />
      </div>
    </header>
  );
}
