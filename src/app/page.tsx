
"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Use dynamic import with ssr: false to ensure this component only renders on the client
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
  // This component now simply renders the client-side-only HomePageClient
  return <HomePageClient />;
}
