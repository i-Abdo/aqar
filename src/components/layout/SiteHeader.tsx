"use client"; 

import React, { useState, useEffect } from "react";
import { AppLogo } from "./AppLogo";
import { MainNav } from "./MainNav";
import { UserAccountNav } from "./UserAccountNav";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { GlobalSearchInput } from "./GlobalSearchInput";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile"; 
import { MobileNav } from "./MobileNav";

export function SiteHeader() {
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
  }, [isMobile, isScrolled, hasMounted]); 

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
    
  }, [isScrolled, isMobile, hasMounted]);

  if (!hasMounted) {
    return (
       <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-header-background/95 backdrop-blur supports-[backdrop-filter]:bg-header-background/80 shadow-lg">
        <div className="container flex h-16 items-center justify-between">
            <AppLogo />
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
        <div className="flex items-center gap-x-2">
            <MobileNav />
            <AppLogo />
        </div>

        <div className="hidden md:flex flex-1 items-center justify-center gap-x-6 mx-4">
          <div className="flex-shrink-0">
            <MainNav />
          </div>
          <div className="w-full max-w-sm lg:max-w-md">
            <GlobalSearchInput />
          </div>
        </div>
        
        <div className="flex items-center gap-x-1 shrink-0">
            <div className="hidden md:block">
                <ThemeToggleButton />
            </div>
            <UserAccountNav />
        </div>
      </div>

      {isMobile && (
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
