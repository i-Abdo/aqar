
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { ChevronsRight, ChevronsLeft, type LucideIcon, X } from "lucide-react"

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
import { Sheet, SheetContent } from "@/components/ui/sheet";


const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContextValue = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  toggleSidebar: () => void
  isMobile: boolean
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
    const isMobile = useIsMobile()
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
        if (isMobile) {
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
    }, [isMobile, openProp, hydrated, defaultOpen])

    const open = openProp ?? _open

    const setOpen = React.useCallback(
      (value: boolean | ((currentOpen: boolean) => boolean)) => {
        const newOpenState = typeof value === "function" ? value(open) : value
        if (setOpenProp) {
          setOpenProp(newOpenState)
        } else {
          _setOpen(newOpenState)
        }
        if (hydrated && !isMobile && openProp === undefined) {
          document.cookie = `${SIDEBAR_COOKIE_NAME}=${newOpenState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
        }
      },
      [setOpenProp, open, hydrated, isMobile, openProp]
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
        isMobile: isMobile,
        hydrated,
        actualSide,
        collapsible,
      }),
      [open, setOpen, toggleSidebar, isMobile, hydrated, actualSide, collapsible]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={style}
            className={cn(
              "group flex h-full w-full relative",
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

const SidebarHeaderInternal = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { title?: string; notificationCount?: number }
>(({ className, title, notificationCount, ...props }, ref) => {
  const { open, toggleSidebar, isMobile, actualSide, collapsible } = useSidebar();
  
  const ChevronIcon = actualSide === 'right' 
    ? (open ? ChevronsRight : ChevronsLeft) 
    : (open ? ChevronsLeft : ChevronsRight);
    
  return (
    <div
      ref={ref}
      className={cn("flex h-[var(--sidebar-header-height,3rem)] items-center border-b border-sidebar-border p-2 shrink-0", className)}
      {...props}
    >
      {open && title && (
        <div className="flex-grow overflow-hidden flex items-center gap-2">
          <span className="font-semibold truncate">{title}</span>
           {notificationCount !== undefined && notificationCount > 0 && (
            <Badge variant="destructive">{notificationCount > 9 ? '9+' : notificationCount}</Badge>
          )}
        </div>
      )}
      
      {!isMobile && collapsible !== 'none' && (
         <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn("h-8 w-8", !open && "mx-auto", open && "ml-auto rtl:mr-auto rtl:ml-0")}
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
        >
          <ChevronIcon />
        </Button>
      )}

      {/* The mobile close button is now handled by the Sheet component */}
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
    const { isMobile, open, setOpen, actualSide, hydrated } = useSidebar();

    if (!hydrated) {
      return null; 
    }
    
    if (isMobile) {
      return (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent 
            side={actualSide} 
            className="w-[var(--sidebar-width-mobile,15rem)] p-0 flex flex-col"
            {...props}
            ref={ref}
          >
            <SidebarHeaderInternal title={title} notificationCount={notificationCount} />
            <ScrollArea className="flex-grow">{children}</ScrollArea>
          </SheetContent>
        </Sheet>
      );
    }
    
    // Desktop view
    return (
       <aside 
        ref={ref as React.Ref<HTMLDivElement>}
        data-state={open ? "expanded" : "collapsed"}
        className={cn(
          "group absolute z-20 flex-col overflow-x-hidden transition-[width] duration-300 ease-in-out",
          "top-0 bottom-0",
          actualSide === 'right' ? 'right-0' : 'left-0',
          className
        )}
        style={{ width: `var(${open ? '--sidebar-width' : '--sidebar-width-icon'})`}}
        {...props}
      >
        <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground shadow-lg border-y-0 border-sidebar-border">
          <SidebarHeaderInternal title={title} notificationCount={notificationCount} />
          <ScrollArea className="flex-grow">{children}</ScrollArea>
        </div>
      </aside>
    );
  }
)
Sidebar.displayName = "Sidebar"


export const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, ...props }, ref) => {
  const { isMobile, actualSide, hydrated, open } = useSidebar()

  if (!hydrated) {
    return (
      <main
        ref={ref}
        className={cn("flex-1", className)}
        style={style}
        {...props}
      />
    )
  }
  
  if (isMobile) {
    return (
      <main
        ref={ref}
        className={cn("flex-1", className)}
        style={{
          paddingTop: 'var(--sidebar-inset-top, 0px)',
          ...style,
        }}
        {...props}
      />
    );
  }

  const paddingProp = actualSide === "left" ? "paddingLeft" : "paddingRight"
  const paddingValue = `var(${open ? '--sidebar-width' : '--sidebar-width-icon'})`

  return (
    <main
      ref={ref}
      className={cn("flex-1 transition-[padding] duration-300 ease-in-out", className)}
      style={{
        paddingTop: 'var(--sidebar-inset-top, 0px)',
        [paddingProp]: paddingValue,
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
    const { open, isMobile, actualSide } = useSidebar();
    
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

    if (!tooltip || isMobile) {
      return buttonElement;
    }
    
    const tooltipDisabled = open;

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
  const { open, isMobile } = useSidebar();
  if (!open && !isMobile) {
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
