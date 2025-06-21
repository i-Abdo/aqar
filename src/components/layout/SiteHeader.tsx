
"use client"; 

import React, { useState, useEffect } from "react";
import { AppLogo } from "./AppLogo";
import { MainNav } from "./MainNav";
import { UserAccountNav } from "./UserAccountNav";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { GlobalSearchInput } from "./GlobalSearchInput";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile"; 
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";

export function SiteHeader() {
  const isMobile = useIsMobile();
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  const HEADER_HEIGHT_MAIN_VALUE = "4rem"; 
  const MOBILE_SEARCH_CONTAINER_HEIGHT_VALUE = "3.25rem"; 
  const TOTAL_MOBILE_HEADER_HEIGHT_VALUE = `calc(${HEADER_HEIGHT_MAIN_VALUE} + ${MOBILE_SEARCH_CONTAINER_HEIGHT_VALUE})`; 
  const SCROLL_THRESHOLD = 10; // Increased sensitivity threshold


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
            <Skeleton className="h-10 w-10 rounded-full" />
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
        <div className="flex items-center gap-x-2 md:gap-x-6">
            <AppLogo />
            <div className="hidden md:flex">
                 <MainNav />
            </div>
        </div>

        <div className="hidden md:flex flex-1 items-center justify-center max-w-sm lg:max-w-md mx-4">
             <GlobalSearchInput />
        </div>
        
        <div className="flex items-center gap-x-1 shrink-0">
             <nav className="flex md:hidden items-center gap-x-4 text-sm font-medium mr-2 rtl:ml-2 rtl:mr-0">
                <Link href="/" className="text-foreground/80 hover:text-foreground transition-colors">الرئيسية</Link>
                <Link href="/pricing" className="text-foreground/80 hover:text-foreground transition-colors">الأسعار</Link>
             </nav>
             <div className="hidden md:block">
                <ThemeToggleButton />
             </div>
            <UserAccountNav />
        </div>
      </div>

      {isMobile && (
        <div className={cn(
          "md:hidden container mx-auto px-4 pt-1 pb-2", 
          "mobile-search-bar-container flex items-center gap-4" 
          )}
          style={{height: 'var(--mobile-search-height)' }} 
        >
          <GlobalSearchInput />
          <ThemeToggleButton />
        </div>
      )}
    </header>
  );
}
