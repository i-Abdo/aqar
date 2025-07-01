"use client";

import Link from "next/link";
import { LogOut, LayoutDashboard, ShieldCheck, Settings } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

export function UserAccountNav() {
  const { user, signOut, isAdmin, loading: authLoading } = useAuth();
  const [hasMounted, setHasMounted] = React.useState(false);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted || authLoading) {
    return <Skeleton className="h-12 w-12 rounded-full" />;
  }

  if (!user) {
    return (
      <div className="hidden md:flex items-center gap-2">
        <Button asChild className="transition-smooth hover:shadow-md">
          <Link href="/signup">إنشاء حساب</Link>
        </Button>
        <Button asChild variant="outline_primary" className="transition-smooth hover:shadow-md">
          <Link href="/login">تسجيل الدخول</Link>
        </Button>
      </div>
    );
  }
  
  const userInitials = user.displayName ? user.displayName.charAt(0).toUpperCase() : 
                      (user.email ? user.email.charAt(0).toUpperCase() : "");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-12 w-12 rounded-full">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User Avatar"} />
            <AvatarFallback>{userInitials}</AvatarFallback>
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
