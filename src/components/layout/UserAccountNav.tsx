
"use client";

import Link from "next/link";
import { LogOut, User, Settings, LayoutDashboard, ShieldCheck } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"; // DefaultUserIcon removed from direct import
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


export function UserAccountNav() {
  const { user, signOut, isAdmin, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-[90px]" /> 
        <Skeleton className="h-10 w-[100px]" /> 
      </div>
    );
  }

  if (!user) {
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
  
  // User initials or default fallback logic for text if needed, otherwise SVG will render
  const userInitials = user.displayName ? user.displayName.charAt(0).toUpperCase() : 
                      (user.email ? user.email.charAt(0).toUpperCase() : ""); // Empty string if no good initials, so SVG shows

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10"> {/* bg-primary will be applied by AvatarFallback if it renders */}
            <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User Avatar"} />
            <AvatarFallback>{userInitials}</AvatarFallback> {/* Pass initials, SVG will show if initials are empty */}
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
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings">
              <Settings className="ms-2 h-4 w-4" />
              <span>الإعدادات</span>
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
