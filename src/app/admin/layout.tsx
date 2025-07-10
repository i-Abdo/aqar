
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect, useState, useCallback } from 'react';
import { Loader2, Flag, MessageCircleWarning, ListChecks, ShieldQuestion } from 'lucide-react';
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
];

interface AdminCounts {
  pending: number;
  reports: number;
  issues: number;
  appeals: number;
}


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading: authLoading, refreshAdminNotifications, adminNotificationCount } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [authHydrated, setAuthHydrated] = React.useState(false);
  const [isLoadingCounts, setIsLoadingCounts] = React.useState(true);
  
  const counts: AdminCounts = {
    pending: adminNotificationCount.pending,
    reports: adminNotificationCount.reports,
    issues: adminNotificationCount.issues,
    appeals: adminNotificationCount.appeals,
  };

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

  useEffect(() => {
    if (isAdmin) {
      refreshAdminNotifications().finally(() => setIsLoadingCounts(false));
    }
  }, [isAdmin, pathname, refreshAdminNotifications]);


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
                                        {count > 0 && (
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
