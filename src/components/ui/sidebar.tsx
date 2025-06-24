
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { ChevronsRight, ChevronsLeft, type LucideIcon, Menu } from "lucide-react"

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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"


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
  collapsible: 'icon' | 'none'
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
    const collapsible = (styleAsProps?.['--sidebar-collapsible'] || "icon");

    React.useEffect(() => {
      if (hydrated && openProp === undefined) {
        if (isMobileHook) {
          _setOpen(false); 
        } else {
          const cookieValue = document.cookie
            .split("; ")
            .find((row) => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`))
            ?.split("=")[1]
          if (cookieValue) {
            _setOpen(cookieValue === "true")
          } else {
             _setOpen(defaultOpen); 
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
        collapsible,
      }),
      [open, setOpen, toggleSidebar, isMobileHook, hydrated, actualSide, collapsible]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={style}
            className={cn(
              "group flex h-full w-full",
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


// Internal component for the sidebar's header content (title, badge, toggle button)
const SidebarHeaderInternal = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { title?: string; notificationCount?: number }
>(({ className, title, notificationCount, ...props }, ref) => {
  const { open, toggleSidebar, isMobile, actualSide, hydrated, collapsible } = useSidebar();

  const ChevronIconToRender = React.useCallback(() => {
    if (actualSide === 'right') { // RTL default
      return open ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />;
    } else { // LTR
      return open ? <ChevronsLeft className="h-5 w-5" /> : <ChevronsRight className="h-5 w-5" />;
    }
  }, [actualSide, open]);
  
  if (!hydrated) { 
    return <div className={cn("p-2 border-b border-sidebar-border flex items-center justify-center shrink-0 h-[var(--sidebar-header-height,3rem)]", className)} {...props}>
             <div className="h-8 w-8 animate-pulse bg-muted rounded-md"></div>
           </div>;
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center border-b border-sidebar-border p-2 h-[var(--sidebar-header-height,3rem)] shrink-0",
        className
      )}
      {...props}
    >
      {open && title && (
        <div className="flex items-center gap-2 overflow-hidden flex-grow">
          <span className="text-lg font-semibold truncate">{title}</span>
          {notificationCount !== undefined && notificationCount > 0 && (
            <Badge variant="destructive">{notificationCount > 9 ? '9+' : notificationCount}</Badge>
          )}
        </div>
      )}
      {collapsible !== "none" && !isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            "h-8 w-8 shrink-0",
             !open && "mx-auto", // Center when collapsed
             (open && actualSide === 'left') && 'ml-auto',
             (open && actualSide === 'right') && 'mr-auto',
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
      children, 
      title,
      notificationCount,
      ...props
    },
    ref
  ) => {
    const { isMobile, open, setOpen, actualSide, collapsible, hydrated } = useSidebar();

    if (!hydrated) {
      return null; 
    }
    
    if (isMobile) {
      return (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "fixed z-50",
                "top-[calc(var(--header-height)/2-1.25rem)]",
                actualSide === 'left' ? "left-4" : "right-4",
                "h-10 w-10 md:hidden" 
              )}
              aria-label="فتح القائمة"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side={actualSide} className="flex flex-col p-0 w-[var(--sidebar-width-mobile,15rem)]">
            <SidebarHeaderInternal title={title} notificationCount={notificationCount} />
            <ScrollArea className="flex-grow">
              {children}
            </ScrollArea>
          </SheetContent>
        </Sheet>
      );
    }
    
    let currentSidebarWidth: string;
    if (open) {
      currentSidebarWidth = isMobile ? 'var(--sidebar-width-mobile, 15rem)' : 'var(--sidebar-width, 16rem)';
    } else {
       currentSidebarWidth = collapsible === 'icon' ? 'var(--sidebar-width-icon, 4.5rem)' : '0px';
    }
    if (collapsible === "none" && !open) {
        currentSidebarWidth = '0px';
    }
    
    const outerContainerPadding = 'var(--sidebar-outer-padding, 0.1rem)'; 
    const sideClasses = actualSide === "left" ? "left-0" : "right-0";

    return (
      <aside 
        ref={ref}
        data-state={open ? "expanded" : "collapsed"}
        data-collapsible={collapsible}
        data-side={actualSide} 
        data-mobile={String(isMobile)}
        className={cn(
          "group fixed z-40 flex", 
          sideClasses
        )}
        style={{
          top: 'var(--header-height)',
          maxHeight: `calc(100svh - var(--header-height) - (${outerContainerPadding} * 2))`, 
          width: currentSidebarWidth, 
          padding: outerContainerPadding, 
          alignItems: 'flex-start', 
          justifyContent: actualSide === "left" ? "flex-start" : (actualSide === "right" ? "flex-end" : "center"),
          transition: 'width 0.2s ease-in-out' 
        }}
        {...props}
      >
        { (collapsible === "none" && !open) ? null : (
            <div 
              className={cn(
                "flex flex-col w-full h-fit overflow-hidden", 
                "bg-sidebar text-sidebar-foreground shadow-xl border border-sidebar-border rounded-lg"
              )}
            >
              <SidebarHeaderInternal title={title} notificationCount={notificationCount} />
              <ScrollArea className="flex-grow">
                {children}
              </ScrollArea>
            </div>
        )}
      </aside>
    );
  }
)
Sidebar.displayName = "Sidebar"


export const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, ...props }, ref) => {
  const { isMobile, actualSide, collapsible, hydrated, open } = useSidebar()

  if (!hydrated) {
    return (
      <div
        ref={ref}
        className={cn("flex-1 flex flex-col overflow-hidden", className)}
        style={style}
        {...props}
      />
    )
  }
  
  if (isMobile) {
    return (
      <div
        ref={ref}
        className={cn("flex-1 flex flex-col overflow-hidden", className)}
        style={{
          paddingTop: 'var(--sidebar-inset-top, 0px)',
          ...style,
        }}
        {...props}
      />
    );
  }

  const paddingProp = actualSide === "left" ? "paddingLeft" : "paddingRight"
  let paddingValue: string;
  
  const collapsedWidth = collapsible === 'icon' ? 'calc(var(--sidebar-width-icon, 4rem) + var(--sidebar-outer-padding, 0.25rem) * 2)' : '0px';
  const expandedWidth = "calc(var(--sidebar-width, 16rem) + var(--sidebar-outer-padding, 0.25rem) * 2)";
  paddingValue = open ? expandedWidth : collapsedWidth;
  
  if (collapsible === 'none' && !open) {
    paddingValue = '0px';
  }

  return (
    <div
      ref={ref}
      className={cn("flex-1 flex flex-col overflow-hidden", className)}
      style={{
        paddingTop: 'var(--sidebar-inset-top, 0px)',
        [paddingProp]: paddingValue,
        transition: `${paddingProp} 0.2s ease-in-out, paddingTop 0.2s ease-in-out`,
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
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-primary data-[active=true]:font-medium data-[active=true]:text-sidebar-primary-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[state=collapsed]:justify-center [&_svg]:size-5 [&_svg]:shrink-0",
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
    asChild?: boolean;
    isActive?: boolean;
    tooltip?: string | React.ComponentProps<typeof TooltipContent>;
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
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const { open, isMobile, collapsible, actualSide } = useSidebar();
    
    if (asChild && !React.isValidElement(children)) {
      return null;
    }

    const buttonElement = (
      <Comp
        ref={ref}
        className={cn(sidebarMenuButtonVariants({ variant, size, className }))}
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        {...props}
      >
        {children}
      </Comp>
    );

    if (!tooltip || isMobile === undefined) {
      return buttonElement;
    }
    
    const tooltipDisabled = open || isMobile || collapsible !== "icon";

    return (
      <Tooltip open={tooltipDisabled ? false : undefined}>
        <TooltipTrigger asChild>{buttonElement}</TooltipTrigger>
        {!tooltipDisabled && (
          <TooltipContent
            side={actualSide === "left" ? "right" : "left"}
            align="center"
            {...(typeof tooltip === 'string' ? { children: tooltip } : tooltip)}
          />
        )}
      </Tooltip>
    );
  }
);
SidebarMenuButton.displayName = "SidebarMenuButton";

export const SidebarSeparator = React.forwardRef<
  HTMLHRElement,
  React.HTMLAttributes<HTMLHRElement>
>(({ className, ...props }, ref) => {
  const { open, collapsible, isMobile } = useSidebar();
  if ( (collapsible === "icon" && !open && !isMobile)) {
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
