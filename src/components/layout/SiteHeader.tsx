"use client"; 

import React, { useState, useEffect, useCallback } from "react";
import { AppLogo } from "./AppLogo";
import { MainNav } from "./MainNav";
import { UserAccountNav } from "./UserAccountNav";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { GlobalSearchInput } from "./GlobalSearchInput";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile"; 

export function SiteHeader() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isScrolled, setIsScrolled] = useState(false);

  const HEADER_HEIGHT_MAIN_VALUE = "4rem"; 
  const MOBILE_SEARCH_CONTAINER_HEIGHT_VALUE = "3.25rem"; 
  const TOTAL_MOBILE_HEADER_HEIGHT_VALUE = "calc(var(--header-height) + var(--mobile-search-height))"; 


  useEffect(() => {
    let lastScrollTop = 0;
    const scrollThreshold = 5; // Reduced threshold for more sensitivity

    const handleScroll = () => {
      if (isMobile === undefined) return; 

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      if (isMobile) { // Only apply scroll effect on mobile
        if (scrollTop > lastScrollTop && scrollTop > scrollThreshold) {
          if (!isScrolled) setIsScrolled(true);
        } else if (scrollTop < lastScrollTop || scrollTop <= scrollThreshold) {
          if (isScrolled) setIsScrolled(false);
        }
      } else { // On desktop, always ensure header is not considered scrolled
        if (isScrolled) setIsScrolled(false);
      }
      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    };
    
    // Initial check for desktop
    if (isMobile === false && isScrolled) {
        setIsScrolled(false);
    }


    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMobile, isScrolled]); 

  useEffect(() => {
    const root = document.documentElement;
    if (isMobile === undefined) return;

    if (!isMobile) { // Desktop
      root.style.setProperty('--current-sticky-header-height', HEADER_HEIGHT_MAIN_VALUE);
    } else { // Mobile
      if (isScrolled) { 
        root.style.setProperty('--current-sticky-header-height', MOBILE_SEARCH_CONTAINER_HEIGHT_VALUE);
      } else {
        root.style.setProperty('--current-sticky-header-height', TOTAL_MOBILE_HEADER_HEIGHT_VALUE);
      }
    }
  }, [isScrolled, isMobile, HEADER_HEIGHT_MAIN_VALUE, MOBILE_SEARCH_CONTAINER_HEIGHT_VALUE, TOTAL_MOBILE_HEADER_HEIGHT_VALUE]);


  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/40",
        "bg-header-background/95 backdrop-blur supports-[backdrop-filter]:bg-header-background/80 shadow-lg"
      )}
      data-scrolled={isMobile ? isScrolled : false} 
    >
      <div className={cn(
        "container flex h-16 items-center justify-between", 
        "main-header-bar" 
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

      <div className={cn(
        "md:hidden container mx-auto px-4 pt-1 pb-2", 
        "mobile-search-bar-container"
        )}
      >
        <GlobalSearchInput />
      </div>
    </header>
  );
}

