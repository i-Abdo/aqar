
"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const HomePageClient = dynamic(
  () => import('@/components/home/HomePageClient'),
  { 
    ssr: false,
    loading: () => (
       <div className="flex flex-col items-center justify-center min-h-screen">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">جاري تحميل الصفحة الرئيسية...</p>
        </div>
    )
  }
);

export default function HomePage() {
  return <HomePageClient />;
}
