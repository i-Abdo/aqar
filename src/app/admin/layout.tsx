
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect, useState, useCallback } from 'react';
import { Loader2, Flag, MessageCircleWarning, ListChecks, ShieldQuestion, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const adminNavItems = [
  { title: 'إدارة البلاغات', href: '/admin/reports', icon: Flag, countKey: 'reports' },
  { title: 'مشاكل المستخدمين', href: '/admin/issues', icon: MessageCircleWarning, countKey: 'issues' },
  { title: 'عقارات قيد المراجعة', href: '/admin/pending', icon: ListChecks, countKey: 'pending' },
  { title: 'إدارة الطعون', href: '/admin/appeals', icon: ShieldQuestion, countKey: 'appeals' },
  { title: 'إدارة الرتب', href: '/admin/roles', icon: Users, countKey: 'roles' }, // Added roles
];

interface AdminCounts {
  pending: number;
  reports: number;
  issues: number;
  appeals: number;
  roles: number; // Not used for count, just for consistency
}


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading: authLoading, refreshAdminNotifications } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [authHydrated, setAuthHydrated] = React.useState(false);
  const [isLoadingCounts, setIsLoadingCounts] = React.useState(true);
  const [counts, setCounts] = useState<AdminCounts>({
    pending: 0,
    reports: 0,
    issues: 0,
    appeals: 0,
    roles: 0,
  });

  const fetchCounts = useCallback(async () => {
    if (!isAdmin) return;
    setIsLoadingCounts(true);
    try {
      const pendingPropsQuery = query(collection(db, "properties"), where("status", "==", "pending"));
      const newReportsQuery = query(collection(db, "reports"), where("status", "==", "new"));
      const newUserIssuesQuery = query(collection(db, "user_issues"), where("status", "==", "new"));
      const newAppealsQuery = query(collection(db, "property_appeals"), where("appealStatus", "==", "new"));
      
      const [pendingSnapshot, reportsSnapshot, issuesSnapshot, appealsSnapshot] = await Promise.all([
        getCountFromServer(pendingPropsQuery),
        getCountFromServer(newReportsQuery),
        getCountFromServer(newUserIssuesQuery),
        getCountFromServer(newAppealsQuery),
      ]);
      
      setCounts({
        pending: pendingSnapshot.data().count,
        reports: reportsSnapshot.data().count,
        issues: issuesSnapshot.data().count,
        appeals: appealsSnapshot.data().count,
        roles: 0, // No count for roles
      });
    } catch (error) {
      console.error("Error fetching admin counts:", error);
    } finally {
      setIsLoadingCounts(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);
  
  useEffect(() => {
    if (isAdmin) {
      refreshAdminNotifications();
    }
  }, [isAdmin, refreshAdminNotifications, pathname]);


  useEffect(() => { setAuthHydrated(true); }, []);

  useEffect(() => {
    if (!authLoading && authHydrated) {
      if (!user) {
        router.push('/login?redirect=/admin/reports');
      } else if (!isAdmin) {
        router.push('/dashboard');
      }
    }
  }, [user, isAdmin, authLoading, router, authHydrated]);


  if (authLoading || !authHydrated || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
        <header className="mb-8">
            <h1 className="text-4xl font-bold font-headline">لوحة الإدارة</h1>
            <p className="text-muted-foreground mt-1">إدارة محتوى وتفاعلات المستخدمين في المنصة.</p>
        </header>

        <nav className="mb-8">
            <Card className="shadow-sm">
                <CardContent className="p-2">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        {adminNavItems.map((item) => {
                            const count = counts[item.countKey as keyof AdminCounts] || 0;
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Button key={item.href} asChild variant={isActive ? "secondary" : "ghost"} className="flex-grow sm:flex-grow-0 transition-all duration-200">
                                    <Link href={item.href} className="flex items-center gap-2">
                                        <item.icon className="h-4 w-4" />
                                        <span>{item.title}</span>
                                        {item.countKey !== 'roles' && count > 0 && (
                                            <Badge variant={isActive ? "default" : "destructive"} className="h-5 px-1.5">{count > 9 ? '9+' : count}</Badge>
                                        )}
                                    </Link>
                                </Button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </nav>

        <main>
            {isLoadingCounts ? (
                <div className="flex items-center justify-center p-12">
                     <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : children}
        </main>
    </div>
  );
}
