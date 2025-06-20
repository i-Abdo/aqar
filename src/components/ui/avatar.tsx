
"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

// DefaultUserIcon component
const DefaultUserIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={cn("h-full w-full", className)} xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="7" r="4" />
    <path d="M12 14C8.13 14 5 15.5 5 17.5V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V17.5C19 15.5 15.87 14 12 14Z" />
  </svg>
);
DefaultUserIcon.displayName = "DefaultUserIcon";


const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, children, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground", // Default to blue background
      className
    )}
    {...props}
  >
    {/* If children (initials) are explicitly passed and not empty, use them. Otherwise, use DefaultUserIcon. */}
    {(typeof children === 'string' && children.trim().length > 0) || (typeof children === 'number') ? (
      children
    ) : (
      <DefaultUserIcon className="h-3/5 w-3/5" /> // Render the SVG icon if no meaningful children
    )}
  </AvatarPrimitive.Fallback>
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback, DefaultUserIcon }
