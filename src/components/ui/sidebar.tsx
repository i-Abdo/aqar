
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { ChevronsRight, ChevronsLeft } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge";

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContextValue = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  toggleSidebar: () => void
  isMobile: boolean | undefined
  hydrated: boolean
  actualSide: 'left' | 'right'
  collapsibleType: 'icon' | 'none'
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}

export const SidebarProvider = React.forwardRef<
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
    const isMobileHook = useIsMobile()
    const [hydrated, setHydrated] = React.useState(false)
    const [_open, _setOpen] = React.useState(defaultOpen)

    React.useEffect(() => {
      setHydrated(true)
    }, [])
    
    const styleAsProps = style as React.CSSProperties & {
        '--sidebar-side': 'left' | 'right';
        '--sidebar-collapsible': 'icon' | 'none';
    };

    const actualSide = (styleAsProps?.['--sidebar-side'] || "right");
    const collapsibleType = (styleAsProps?.['--sidebar-collapsible'] || "icon");

    React.useEffect(() => {
      if (hydrated && openProp === undefined) {
        if (isMobileHook) {
          _setOpen(true); // Always open by default on mobile after hydration
        } else {
          const cookieValue = document.cookie
            .split("; ")
            .find((row) => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`))
            ?.split("=")[1]
          if (cookieValue) {
            _setOpen(cookieValue === "true")
          } else {
            _setOpen(defaultOpen) 
          }
        }
      }
    }, [isMobileHook, openProp, hydrated, defaultOpen])

    const open = openProp ?? _open

    const setOpen = React.useCallback(
      (value: boolean | ((currentOpen: boolean) => boolean)) => {
        const newOpenState = typeof value === "function" ? value(open) : value
        if (setOpenProp) {
          setOpenProp(newOpenState)
        } else {
          _setOpen(newOpenState)
        }
        if (hydrated && !isMobileHook && openProp === undefined) {
          document.cookie = `${SIDEBAR_COOKIE_NAME}=${newOpenState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
        }
      },
      [setOpenProp, open, hydrated, isMobileHook, openProp]
    )

    const toggleSidebar = React.useCallback(() => {
      setOpen((prevOpen) => !prevOpen);
    }, [setOpen]);

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


    const contextValue = React.useMemo<SidebarContextValue>(
      () => ({
        open,
        setOpen,
        toggleSidebar,
        isMobile: isMobileHook,
        hydrated,
        actualSide,
        collapsibleType,
      }),
      [open, setOpen, toggleSidebar, isMobileHook, hydrated, actualSide, collapsibleType]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={style}
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


// Internal component for the sidebar header
const SidebarHeaderInternal = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { title?: string; notificationCount?: number }
>(({ className, title, notificationCount, ...props }, ref) => {
  const { open, toggleSidebar, isMobile, actualSide, hydrated, collapsibleType } = useSidebar();

  const ChevronIconToRender = () => {
    if (actualSide === 'right') {
      return open ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />;
    } else {
      return open ? <ChevronsLeft className="h-5 w-5" /> : <ChevronsRight className="h-5 w-5" />;
    }
  };

  if (!hydrated) {
    return (
      <div className={cn("h-[var(--sidebar-header-height,3rem)] p-2 border-b border-sidebar-border flex items-center justify-center shrink-0", className)} {...props}>
        <div className="h-8 w-8 animate-pulse bg-muted rounded-md"></div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center border-b border-sidebar-border p-2 h-[var(--sidebar-header-height,3rem)] shrink-0",
        open ? "justify-between" : "justify-center",
        className
      )}
      {...props}
    >
      {open && title && (
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-lg font-semibold truncate">{title}</span>
          {notificationCount !== undefined && notificationCount > 0 && (
            <Badge variant="destructive">{notificationCount > 9 ? '9+' : notificationCount}</Badge>
          )}
        </div>
      )}
      
      {collapsibleType !== "none" && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn("h-8 w-8 shrink-0", !open && "mx-auto")}
          aria-label={open ? "إغلاق الشريط الجانبي" : "فتح الشريط الجانبي"}
        >
          <ChevronIconToRender />
        </Button>
      )}
    </div>
  );
});
SidebarHeaderInternal.displayName = "SidebarHeaderInternal";


// Internal component for the sidebar content (navigation menu)
const SidebarContentInternal = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex-grow overflow-y-auto overflow-x-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SidebarContentInternal.displayName = "SidebarContentInternal";


export const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    title?: string;
    notificationCount?: number;
  }
>(
  (
    {
      className,
      children, // This will be the navigation menu (e.g., DashboardNav)
      title,
      notificationCount,
      ...props
    },
    ref
  ) => {
    const { isMobile, open, actualSide, collapsibleType, hydrated } = useSidebar();

    if (!hydrated) {
        const skeletonSideClass = actualSide === "left" ? "left-0" : "right-0";
        const skeletonWidth = collapsibleType === "icon" ? 'var(--sidebar-width-icon, 4.5rem)' : 'var(--sidebar-width, 16rem)';
        return (
            <div
                ref={ref}
                className={cn("fixed z-40", skeletonSideClass, className)}
                style={{
                    top: `var(--header-height)`, 
                    height: `calc(100svh - var(--header-height))`,
                    width: skeletonWidth,
                    padding: 'var(--sidebar-outer-padding, 0.5rem)',
                    display: 'flex',
                    alignItems: 'center', 
                    justifyContent: actualSide === "left" ? "flex-start" : "flex-end",
                    pointerEvents: "none",
                }}
                {...props}
            >
                <div className="h-full animate-pulse bg-muted rounded-lg" style={{ width: '100%' }}></div>
            </div>
        );
    }
    
    let currentSidebarWidth: string;
    if (open) {
      currentSidebarWidth = isMobile ? 'var(--sidebar-width-mobile, 16rem)' : 'var(--sidebar-width, 16rem)';
    } else {
      currentSidebarWidth = (collapsibleType === "icon") ? 'var(--sidebar-width-icon, 4.5rem)' : '0px';
    }
    if (collapsibleType === "none" && !open) {
        currentSidebarWidth = '0px';
    }
    
    const topPosition = `var(--current-sticky-header-height, ${isMobile ? 'var(--total-mobile-header-height)' : 'var(--header-height)'})`;
    const outerContainerPadding = 'var(--sidebar-outer-padding, 0.5rem)'; 
    const sideClasses = actualSide === "left" ? "left-0" : "right-0";


    return (
      // Outermost container: fixed, defines the zone for the panel
      <div 
        ref={ref}
        data-sidebar="sidebar-outer-container" 
        data-state={open ? "expanded" : "collapsed"}
        data-collapsible={collapsibleType}
        data-side={actualSide} 
        data-mobile={String(isMobile)}
        className={cn(
          "group/sidebar fixed z-40 flex", 
          sideClasses,
          "pointer-events-none" 
        )}
        style={{
          top: topPosition,
          height: `calc(100svh - ${topPosition})`, 
          width: currentSidebarWidth, 
          padding: outerContainerPadding, 
          alignItems: 'center', 
          justifyContent: actualSide === "left" ? "flex-start" : (actualSide === "right" ? "flex-end" : "center"),
        }}
        {...props}
      >
        { (collapsibleType === "none" && !open) ? null : (
            // Inner visual panel
            <div 
              data-sidebar-panel="true"
              className={cn(
                "flex flex-col h-auto max-h-full w-full overflow-hidden transition-all duration-200 ease-linear",
                "bg-sidebar text-sidebar-foreground shadow-xl border border-sidebar-border rounded-lg",
                "pointer-events-auto" 
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


export const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, ...props }, ref) => {
  const { isMobile, actualSide, collapsibleType, hydrated } = useSidebar(); 
  
  if (!hydrated) {
      const fallbackTopOffset = `var(${isMobile ? '--total-mobile-header-height' : '--header-height'})`;
      let fallbackSidePadding = '0px';
      if (collapsibleType === "icon") {
        fallbackSidePadding = 'var(--sidebar-width-icon, 4.5rem)';
      }
      
      const paddingProp = actualSide === "left" ? "paddingLeft" : "paddingRight";

      return (
          <div
              ref={ref}
              className={cn("flex-1 flex flex-col overflow-hidden", className)}
              style={{
                  paddingTop: fallbackTopOffset,
                  [paddingProp]: fallbackSidePadding,
                  ...style,
              }}
              {...props}
          />
      );
  }

  const paddingProp = actualSide === "left" ? "paddingLeft" : "paddingRight";
  const gutterPadding = collapsibleType === "icon" ? 'var(--sidebar-width-icon, 4.5rem)' : '0px';


  return (
    <div
      ref={ref}
      className={cn(
        "flex-1 flex flex-col overflow-hidden transition-all duration-200 ease-linear", 
        className
      )}
      style={{
        paddingTop: `var(--current-sticky-header-height, var(${isMobile ? '--total-mobile-header-height' : '--header-height'}))`, 
        [paddingProp]: gutterPadding, 
        ...style,
      }}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"


export const SidebarMenu = React.forwardRef<
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

export const SidebarMenuItem = React.forwardRef<
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

export const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-primary data-[active=true]:font-medium data-[active=true]:text-sidebar-primary-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:group-data-[state=collapsed]:!size-10 group-data-[collapsible=icon]:group-data-[state=collapsed]:!p-0 group-data-[collapsible=icon]:group-data-[state=collapsed]:justify-center [&>a>div>span]:truncate group-data-[collapsible=icon]:group-data-[state=collapsed]:[&>a>div>span]:hidden [&>a>div>svg]:size-5 [&>a>div>svg]:shrink-0 group-data-[collapsible=icon]:group-data-[state=collapsed]:[&>a>div>svg]:mx-auto",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: { 
        default: "h-10 text-sm",
        sm: "h-8 text-xs",
        lg: "h-12 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export const SidebarMenuButton = React.forwardRef<
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
    const { open, isMobile, collapsibleType, actualSide } = useSidebar()

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
    
    const tooltipDisabled = open || isMobile || collapsibleType !== "icon"; 

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side={actualSide === "left" ? "right" : "left"}
          align="center"
          hidden={tooltipDisabled} 
          {...tooltip}
        />
      </Tooltip>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

export const SidebarSeparator = React.forwardRef<
  HTMLHRElement,
  React.HTMLAttributes<HTMLHRElement>
>(({ className, ...props }, ref) => {
  const { open, collapsibleType, isMobile } = useSidebar();
  if ( (collapsibleType === "icon" && !open && !isMobile)) {
    return null;
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
