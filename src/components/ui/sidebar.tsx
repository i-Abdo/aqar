"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { ChevronsRight, ChevronsLeft } from "lucide-react" 

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
// Input, Separator, Skeleton removed as they are not directly part of the core sidebar structure defined here.
// They can be used within the children passed to Sidebar.
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"; // For notification badge

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContextValue = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  isMobile: boolean | undefined;
  toggleSidebar: () => void
  side: "left" | "right";
  collapsible: "icon" | "none";
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile()
    const [hydrated, setHydrated] = React.useState(false);

    React.useEffect(() => {
      setHydrated(true);
    }, []);

    const [_open, _setOpen] = React.useState(defaultOpen);
    
    React.useEffect(() => {
        if (hydrated && openProp === undefined) { 
            if (isMobile) {
                _setOpen(defaultOpen); // Respect defaultOpen on mobile
            } else {
                const cookieValue = document.cookie
                    .split("; ")
                    .find((row) => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`))
                    ?.split("=")[1];
                if (cookieValue) {
                    _setOpen(cookieValue === "true");
                } else {
                     _setOpen(defaultOpen); 
                }
            }
        }
    }, [isMobile, openProp, hydrated, defaultOpen]);


    const open = openProp ?? _open

    const setOpen = React.useCallback(
      (value: boolean | ((currentOpen: boolean) => boolean)) => {
        const newOpenState = typeof value === "function" ? value(open) : value;
        if (setOpenProp) {
          setOpenProp(newOpenState);
        } else {
          _setOpen(newOpenState);
        }
        if (hydrated && !isMobile && openProp === undefined) { 
          document.cookie = `${SIDEBAR_COOKIE_NAME}=${newOpenState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
        }
      },
      [setOpenProp, open, hydrated, isMobile, openProp]
    );
    
    const toggleSidebar = React.useCallback(() => {
      setOpen((prevOpen) => !prevOpen)
    }, [setOpen])

    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault()
          toggleSidebar()
        }
      }
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [toggleSidebar])

    const state = open ? "expanded" : "collapsed"
    const sidebarSide = (style as React.CSSProperties & {'--sidebar-side': 'left' | 'right'})?.['--sidebar-side'] || 'right';
    const collapsible = (style as React.CSSProperties & {'--sidebar-collapsible': 'icon' | 'none'})?.['--sidebar-collapsible'] || 'icon';


    const contextValue = React.useMemo<SidebarContextValue>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        toggleSidebar,
        side: sidebarSide,
        collapsible,
      }),
      [state, open, setOpen, isMobile, toggleSidebar, sidebarSide, collapsible]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={style as React.CSSProperties}
            className={cn(
              "group/sidebar-wrapper flex h-full w-full",
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"


// Internal SidebarHeader for structure and toggle
const SidebarHeaderInternal = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { title?: string; notificationCount?: number }
>(({ className, title, notificationCount, ...props }, ref) => {
  const { open, toggleSidebar, isMobile, side, collapsible } = useSidebar();
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setHydrated(true);
  }, []);


  const ChevronIconToRender = () => {
    if (side === 'right') { 
      return open ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />;
    } else { 
      return open ? <ChevronsLeft className="h-5 w-5" /> : <ChevronsRight className="h-5 w-5" />;
    }
  };

  if (!hydrated) {
    return <div className={cn("h-12 p-2 border-b border-sidebar-border", className)} {...props}><div className="h-8 w-8 animate-pulse bg-muted rounded-md mx-auto"></div></div>;
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center border-b border-sidebar-border p-2 h-12 shrink-0", // Fixed height for header
        (collapsible === "icon" && !open && !isMobile) && "justify-center", // Center toggle when collapsed on desktop
        (open || isMobile) && "justify-between", // Justify between for open desktop or any mobile state
        className
      )}
      {...props}
    >
      {open && title && ( // Show title and badge only when sidebar is open
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold truncate">{title}</span>
          {notificationCount !== undefined && notificationCount > 0 && (
            <Badge variant="destructive">{notificationCount > 9 ? '9+' : notificationCount}</Badge>
          )}
        </div>
      )}
      
      {collapsible === "icon" && ( // Toggle button only if collapsible
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            toggleSidebar();
          }}
          className={cn(
            "h-8 w-8",
            (!open && !isMobile) && "mx-auto" // Ensure centered when collapsed on desktop
          )}
          aria-label={open ? "إغلاق الشريط الجانبي" : "فتح الشريط الجانبي"}
        >
          <ChevronIconToRender />
        </Button>
      )}
    </div>
  );
});
SidebarHeaderInternal.displayName = "SidebarHeaderInternal";


const SidebarContentInternal = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { open, collapsible, isMobile } = useSidebar();
  return (
    <div
      ref={ref}
      className={cn(
        "flex-grow overflow-y-auto overflow-x-hidden",
        // When collapsed on desktop, hide text overflow if menu items don't handle it well
        collapsible === "icon" && !open && !isMobile && "overflow-x-hidden", 
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SidebarContentInternal.displayName = "SidebarContentInternal";


const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    // Props passed from layout (e.g., dashboard/layout.tsx)
    title?: string; 
    notificationCount?: number;
    children: React.ReactNode; // This will be the navigation menu (e.g., DashboardNav)
  }
>(
  (
    {
      className,
      children,
      title,
      notificationCount,
      ...props
    },
    ref
  ) => {
    const { isMobile, open, state, side, collapsible, hydrated } = useSidebar();

    if (hydrated === undefined) { // Or !hydrated
        const skeletonSideClass = side === "left" ? "left-0" : "right-0";
        const skeletonWidth = collapsible === "icon" ? 'var(--sidebar-width-icon, 4.5rem)' : 'var(--sidebar-width, 16rem)';
        return <div ref={ref} className={cn("fixed z-40 top-[var(--header-height)] h-[calc(100svh-var(--header-height))] p-2 sm:p-4 pointer-events-none", skeletonSideClass, className)} {...props}>
                    <div className="h-full animate-pulse bg-muted rounded-lg" style={{width: skeletonWidth}}></div>
                </div>;
    }
    
    let currentSidebarWidth: string;
    if (open) {
      currentSidebarWidth = isMobile ? 'var(--sidebar-width-mobile, 16rem)' : 'var(--sidebar-width, 16rem)';
    } else {
      currentSidebarWidth = (collapsible === "icon") ? 'var(--sidebar-width-icon, 4.5rem)' : '0px';
    }
    if (collapsible === "none" && !open) {
        currentSidebarWidth = '0px'; // Fully hide if not collapsible and closed
    }
    
    const initialTopValue = isMobile ? 'var(--total-mobile-header-height)' : 'var(--header-height)';
    const topPosition = `var(--current-sticky-header-height, ${initialTopValue})`;
    const outerContainerPadding = "p-2 sm:p-4"; 
    const sideClasses = side === "left" ? "left-0 justify-start" : "right-0 justify-end";


    return (
      // Outermost container: fixed, defines the zone, handles centering of the panel
      <div 
        ref={ref}
        data-sidebar="sidebar-outer-container" 
        data-state={state}
        data-collapsible={collapsible}
        data-side={side} 
        data-mobile={String(isMobile)}
        className={cn(
          "group/sidebar fixed z-30 flex", // z-30 to be below header (z-50)
          sideClasses,
          outerContainerPadding,
          "pointer-events-none", // Allows clicks through empty areas
          className
        )}
        style={{
          top: topPosition,
          height: `calc(100svh - ${topPosition} - ${outerContainerPadding.split(" ")[1] || '1rem'})`, // Full height below header minus padding
          width: currentSidebarWidth, 
        }}
        {...props}
      >
        { (collapsible === "none" && !open) ? null : (
            // Inner visual panel
            <div 
            data-sidebar-panel="true"
            className={cn(
                "flex flex-col h-full w-full overflow-hidden transition-all duration-200 ease-linear",
                "bg-sidebar text-sidebar-foreground shadow-xl border border-sidebar-border rounded-lg",
                "pointer-events-auto" // Enable pointer events for the panel itself
            )}
            >
              <SidebarHeaderInternal title={title} notificationCount={notificationCount} />
              <SidebarContentInternal>{children}</SidebarContentInternal>
            </div>
        )}
      </div>
    );
  }
)
Sidebar.displayName = "Sidebar"


const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, ...props }, ref) => {
  const { isMobile, side, collapsible, hydrated } = useSidebar(); 
  
  const paddingProp = side === "left" ? "paddingLeft" : "paddingRight";
  
  // Gutter is only applied if collapsible is 'icon'
  // On mobile, the sidebar is a true overlay, so no gutter.
  const paddingValue = (!isMobile && collapsible === "icon") ? 'var(--sidebar-width-icon)' : '0px';

  const initialTopValue = isMobile ? 'var(--total-mobile-header-height)' : 'var(--header-height)';

  if (!hydrated) {
      // Render a basic div during SSR or before hydration for consistent layout structure
      return <div ref={ref} className={cn("flex-1 flex flex-col overflow-hidden", className)} style={{paddingTop: initialTopValue, [paddingProp]: 'var(--sidebar-width-icon)', ...style}} {...props} />;
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex-1 flex flex-col overflow-hidden transition-all duration-200 ease-linear", 
        className
      )}
      style={{
        paddingTop: `var(--current-sticky-header-height, ${initialTopValue})`, 
        [paddingProp]: paddingValue, 
        ...style,
      }}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"


// --- SidebarMenu components (largely unchanged, ensure they respect collapsed state) ---

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn("flex w-full min-w-0 flex-col gap-1 p-2", className)} 
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={cn("group/menu-item relative", className)}
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-primary data-[active=true]:font-medium data-[active=true]:text-sidebar-primary-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:group-data-[state=collapsed]:!size-10 group-data-[collapsible=icon]:group-data-[state=collapsed]:!p-0 group-data-[collapsible=icon]:group-data-[state=collapsed]:justify-center [&>span:last-child]:truncate group-data-[collapsible=icon]:group-data-[state=collapsed]:[&>span:last-child]:hidden [&>svg]:size-5 group-data-[collapsible=icon]:group-data-[state=collapsed]:[&>svg]:size-5 [&>svg]:shrink-0 group-data-[collapsible=icon]:group-data-[state=collapsed]:[&>svg]:mx-auto",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: { // This size variant might be less relevant if collapsed state handles sizing
        default: "h-10 text-sm", // Adjusted to h-10 to match collapsed size-10
        sm: "h-8 text-xs", // Collapsed size-8
        lg: "h-12 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(
  (
    {
      asChild = false,
      isActive = false,
      variant = "default",
      size = "default",
      tooltip,
      className,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const { isMobile, state, collapsible } = useSidebar()

    const button = (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
        {...props}
      />
    )

    if (!tooltip || isMobile === undefined) {
      return button
    }

    if (typeof tooltip === "string") {
      tooltip = {
        children: tooltip,
      }
    }
    
    const tooltipDisabled = state !== "collapsed" || isMobile || collapsible !== "icon"; 

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side={useSidebar().side === "left" ? "right" : "left"} // Adjust tooltip side based on sidebar side
          align="center"
          hidden={tooltipDisabled} 
          {...tooltip}
        />
      </Tooltip>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarSeparator = React.forwardRef<
  HTMLHRElement,
  React.HTMLAttributes<HTMLHRElement>
>(({ className, ...props }, ref) => {
  const { open, collapsible, isMobile } = useSidebar();
  if (collapsible === "icon" && !open && !isMobile) {
    // Optionally render a smaller separator or nothing when collapsed
    return null; // Or a more subtle separator
  }
  return (
    <hr
      ref={ref}
      className={cn("my-1 border-sidebar-border", className)}
      {...props}
    />
  );
});
SidebarSeparator.displayName = "SidebarSeparator";


export {
  // Context related
  SidebarProvider,
  useSidebar,
  // Main structural components
  Sidebar,
  SidebarInset,
  // Menu components
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  // Keep variant exports if they are used externally for styling
  sidebarMenuButtonVariants,
}

// Removed exports for SidebarHeader, SidebarContent, SidebarGroup*, SidebarMenuAction, SidebarMenuBadge,
// SidebarMenuSkeleton, SidebarMenuSub* as these are now primarily internal or less likely to be directly used
// with the new simplified structure. They can be re-added if specific use cases arise.
// SidebarTrigger and SidebarRail are also removed as the toggle is now internal.
