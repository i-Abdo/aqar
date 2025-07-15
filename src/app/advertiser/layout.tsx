
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect, useState, useCallback } from 'react';
import { Loader2, List, FileImage, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const advertiserNavItems = [
  { title: 'لوحة التحكم', href: '/advertiser', icon: LayoutDashboard },
  { title: 'إعلانات الخدمات', href: '/advertiser/services', icon: List },
  { title: 'الإعلانات العامة', href: '/advertiser/general-ads', icon: FileImage },
];

export default function AdvertiserLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [authHydrated, setAuthHydrated] = React.useState(false);
  const isAdvertiser = user?.roles?.includes('advertiser');

  useEffect(() => { setAuthHydrated(true); }, []);

  useEffect(() => {
    if (!authLoading && authHydrated) {
      if (!user) {
        router.push('/login?redirect=/advertiser');
      } else if (!isAdvertiser) {
        router.push('/dashboard');
      }
    }
  }, [user, isAdvertiser, authLoading, router, authHydrated]);


  if (authLoading || !authHydrated || !isAdvertiser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
        <header className="mb-8">
            <h1 className="text-4xl font-bold font-headline">لوحة تحكم المعلنين</h1>
            <p className="text-muted-foreground mt-1">إدارة الحملات الإعلانية والوصول إلى أدوات المعلنين.</p>
        </header>

        <nav className="mb-8">
            <Card className="shadow-sm">
                <CardContent className="p-2">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        {advertiserNavItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Button key={item.href} asChild variant={isActive ? "secondary" : "ghost"} className="flex-grow sm:flex-grow-0 transition-all duration-200">
                                    <Link href={item.href} className="flex items-center gap-2">
                                        <item.icon className="h-4 w-4" />
                                        <span>{item.title}</span>
                                    </Link>
                                </Button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </nav>

        <main>
            {children}
        </main>
    </div>
  );
}
