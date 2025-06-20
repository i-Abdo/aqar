
"use client";

import Link from "next/link";
import { LogOut, User, Settings, LayoutDashboard, ShieldCheck } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback, DefaultUserIcon } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import { MobileNav } from "./MobileNav"; // Import MobileNav
import { useIsMobile } from "@/hooks/use-mobile"; // Import useIsMobile
import { ThemeToggleButton } from "./ThemeToggleButton"; // Import ThemeToggleButton


export function UserAccountNav() {
  const { user, signOut, isAdmin, loading: authLoading } = useAuth();
  const [hasMounted, setHasMounted] = React.useState(false);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted || authLoading) {
    // Render null or a consistent placeholder on server and initial client render
    // if not yet mounted or auth is loading, to prevent hydration mismatch.
    return null; 
    // If you prefer skeletons, ensure they are *identical* to any server-rendered equivalent (if any)
    // return (
    //   <div className="flex items-center gap-2">
    //     <Skeleton className="h-10 w-[90px] rounded-md" /> 
    //     <Skeleton className="h-10 w-[100px] rounded-md" />
    //   </div>
    // );
  }
  
  if (isMobile) { // For mobile, show MobileNav trigger and ThemeToggle in its sheet
    return (
      <div className="flex items-center">
        {user && <ThemeToggleButton />} 
        <MobileNav />
      </div>
    );
  }


  if (!user) { // For desktop, if no user, show login/signup buttons
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="outline_primary" className="transition-smooth hover:shadow-md">
          <Link href="/login">تسجيل الدخول</Link>
        </Button>
        <Button asChild className="transition-smooth hover:shadow-md">
          <Link href="/signup">إنشاء حساب</Link>
        </Button>
      </div>
    );
  }
  
  const userInitials = user.displayName ? user.displayName.charAt(0).toUpperCase() : 
                      (user.email ? user.email.charAt(0).toUpperCase() : "");

  // For desktop, if user is logged in, show dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User Avatar"} />
            <AvatarFallback>{userInitials || <DefaultUserIcon />}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName || "المستخدم"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard">
              <LayoutDashboard className="ms-2 h-4 w-4" />
              <span>لوحة التحكم</span>
            </Link>
          </DropdownMenuItem>
          {isAdmin && (
             <DropdownMenuItem asChild>
             <Link href="/admin/properties">
               <ShieldCheck className="ms-2 h-4 w-4" />
               <span>لوحة الإدارة</span>
             </Link>
           </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings">
              <Settings className="ms-2 h-4 w-4" />
              <span>الإعدادات</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={async (event) => {
          event.preventDefault();
          await signOut();
        }}>
          <LogOut className="ms-2 h-4 w-4" />
          <span>تسجيل الخروج</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
