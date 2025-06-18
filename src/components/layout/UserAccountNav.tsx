
"use client";

import Link from "next/link";
import { LogOut, User, Settings, LayoutDashboard, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import React, { useState, useEffect } from "react";
import { db } from '@/lib/firebase/client';
import { collection, query, where, getCountFromServer } from "firebase/firestore";

export function UserAccountNav() {
  const { user, signOut, isAdmin, loading: authLoading } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  useEffect(() => {
    if (authLoading || !user) {
      setNotificationCount(0);
      return;
    }

    const fetchNotifications = async () => {
      setIsLoadingNotifications(true);
      let totalCount = 0;
      try {
        if (isAdmin) {
          const countsPromises = [
            getCountFromServer(query(collection(db, "properties"), where("status", "==", "pending"))),
            getCountFromServer(query(collection(db, "reports"), where("status", "==", "new"))),
            getCountFromServer(query(collection(db, "user_issues"), where("status", "==", "new"))),
            getCountFromServer(query(collection(db, "property_appeals"), where("appealStatus", "==", "new"))),
          ];
          const snapshots = await Promise.all(countsPromises);
          totalCount = snapshots.reduce((sum, snapshot) => sum + snapshot.data().count, 0);
        } else {
          // Fetch counts for regular user dashboard notifications
          const appealsQuery = query(
            collection(db, "property_appeals"),
            where("ownerUserId", "==", user.uid),
            where("appealStatus", "in", ["resolved_deleted", "resolved_kept_archived", "resolved_published"])
          );
          const issuesQuery = query(
            collection(db, "user_issues"),
            where("userId", "==", user.uid),
            where("status", "in", ["in_progress", "resolved"])
          );
          const [appealsSnapshot, issuesSnapshot] = await Promise.all([
            getCountFromServer(appealsQuery),
            getCountFromServer(issuesQuery),
          ]);
          totalCount = appealsSnapshot.data().count + issuesSnapshot.data().count;
        }
        setNotificationCount(totalCount);
      } catch (error) {
        console.error("Error fetching notification counts:", error);
        setNotificationCount(0); // Reset on error
      } finally {
        setIsLoadingNotifications(false);
      }
    };

    fetchNotifications();
  }, [user, isAdmin, authLoading]);


  if (authLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-[90px]" /> {/* Approx width for "تسجيل الدخول" */}
        <Skeleton className="h-10 w-[100px]" /> {/* Approx width for "إنشاء حساب" */}
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
  
  const userInitials = user.displayName ? user.displayName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : "U");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative"> {/* Wrapper for badge positioning */}
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User Avatar"} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            {/* Notification Badge */}
            {user && notificationCount > 0 && !isLoadingNotifications && (
              <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center 
                               rounded-full bg-destructive text-xs font-bold text-destructive-foreground 
                               ring-2 ring-background pointer-events-none
                               transform translate-x-1/3 -translate-y-1/3">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </Button>
        </div>
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
          // router.push('/') or handle redirection as needed
        }}>
          <LogOut className="ms-2 h-4 w-4" />
          <span>تسجيل الخروج</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
