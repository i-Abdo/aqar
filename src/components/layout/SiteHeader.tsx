
"use client"; 

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link"; // Added Link
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
  const [hasMounted, setHasMounted] = useState(false);

  const HEADER_HEIGHT_MAIN_VALUE = "4rem"; 
  const MOBILE_SEARCH_CONTAINER_HEIGHT_VALUE = "3.25rem"; 
  const TOTAL_MOBILE_HEADER_HEIGHT_VALUE = `calc(${HEADER_HEIGHT_MAIN_VALUE} + ${MOBILE_SEARCH_CONTAINER_HEIGHT_VALUE})`; 
  const SCROLL_THRESHOLD = 5; 


  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted || isMobile === undefined) return;

    let lastScrollTop = 0;
    
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      if (isMobile) { 
        if (scrollTop > lastScrollTop && scrollTop > SCROLL_THRESHOLD) {
          if (!isScrolled) setIsScrolled(true);
        } else if (scrollTop < lastScrollTop || scrollTop <= SCROLL_THRESHOLD) {
          if (isScrolled) setIsScrolled(false);
        }
      } else {
        if (isScrolled) setIsScrolled(false); 
      }
      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMobile, isScrolled, hasMounted, SCROLL_THRESHOLD]); 

  useEffect(() => {
    if (!hasMounted || isMobile === undefined) return;

    const root = document.documentElement;
    let currentVisibleStickyHeaderHeight: string;
    let sidebarStableTopAnchorHeight: string;

    if (!isMobile) { 
      currentVisibleStickyHeaderHeight = HEADER_HEIGHT_MAIN_VALUE;
      sidebarStableTopAnchorHeight = HEADER_HEIGHT_MAIN_VALUE;
    } else { 
      if (isScrolled) { 
        currentVisibleStickyHeaderHeight = MOBILE_SEARCH_CONTAINER_HEIGHT_VALUE; 
      } else {
        currentVisibleStickyHeaderHeight = TOTAL_MOBILE_HEADER_HEIGHT_VALUE; 
      }
      sidebarStableTopAnchorHeight = TOTAL_MOBILE_HEADER_HEIGHT_VALUE;
    }
    root.style.setProperty('--current-sticky-header-height', currentVisibleStickyHeaderHeight);
    root.style.setProperty('--sidebar-stable-top-anchor', sidebarStableTopAnchorHeight);
    
  }, [isScrolled, isMobile, hasMounted, HEADER_HEIGHT_MAIN_VALUE, MOBILE_SEARCH_CONTAINER_HEIGHT_VALUE, TOTAL_MOBILE_HEADER_HEIGHT_VALUE]);

  if (!hasMounted) {
    return (
       <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-header-background/95 backdrop-blur supports-[backdrop-filter]:bg-header-background/80 shadow-lg">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center"> {/* Group Logo and potential mobile nav items */}
            <AppLogo />
          </div>
          <div className="hidden md:flex flex-1 items-center justify-center gap-x-6 mx-4">
            <div className="flex-shrink-0"><MainNav /></div>
            <div className="w-full max-w-sm lg:max-w-md"><GlobalSearchInput /></div>
          </div>
          <div className="flex items-center gap-x-1">
            <UserAccountNav />
          </div>
        </div>
      </header>
    );
  }

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
        {/* Left group: Logo and Mobile-only Nav Links */}
        <div className="flex items-center gap-x-2 md:gap-x-4">
          <div className="shrink-0"> {/* Ensure logo doesn't shrink too much */}
            <AppLogo />
          </div>
          {isMobile && ( /* hasMounted is implicitly true here if this part renders */
            <div className="flex items-center gap-x-1 sm:gap-x-2">
              <Link href="/" className="text-xs sm:text-sm font-medium text-foreground/80 hover:text-primary transition-colors px-1 sm:px-2 py-1 rounded-md hover:bg-accent/50">
                الرئيسية
              </Link>
              <Link href="/pricing" className="text-xs sm:text-sm font-medium text-foreground/80 hover:text-primary transition-colors px-1 sm:px-2 py-1 rounded-md hover:bg-accent/50">
                الأسعار
              </Link>
            </div>
          )}
        </div>

        {/* Desktop Centered Content: MainNav and GlobalSearch */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-x-6 mx-4">
          <div className="flex-shrink-0"> {/* MainNav should not grow excessively */}
            <MainNav />
          </div>
          <div className="w-full max-w-sm lg:max-w-md"> {/* Constrain search bar width */}
            <GlobalSearchInput />
          </div>
        </div>
        
        {/* Right group: Theme Toggle and User Account Nav / Mobile Menu Trigger */}
        <div className="flex items-center gap-x-1 shrink-0"> {/* Ensure this group doesn't shrink */}
          {user && !isMobile && <ThemeToggleButton />}
          <UserAccountNav />
        </div>
      </div>

      {isMobile && ( /* hasMounted is implicitly true here */
        <div className={cn(
          "md:hidden container mx-auto px-4 pt-1 pb-2", 
          "mobile-search-bar-container" 
          )}
          style={{height: 'var(--mobile-search-height)' }} 
        >
          <GlobalSearchInput />
        </div>
      )}
    </header>
  );
}
