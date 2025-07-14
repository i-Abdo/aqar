
"use client";

import { useFavorites } from '@/hooks/use-favorites';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { PropertyCardSkeleton } from '@/components/properties/PropertyCardSkeleton';
import { HeartCrack, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function FavoritesPage() {
  const { favoriteProperties, isLoading } = useFavorites();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold font-headline mb-8 text-center">قائمة المفضلة</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4 text-primary">
          قائمة المفضلة
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          هنا تجد جميع العقارات التي قمت بحفظها للرجوع إليها لاحقًا.
        </p>
      </div>

      {favoriteProperties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteProperties.map(prop => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 border-2 border-dashed rounded-lg">
          <HeartCrack className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">قائمة المفضلة فارغة</h2>
          <p className="text-muted-foreground mb-6">
            لم تقم بإضافة أي عقارات إلى قائمتك بعد. ابدأ بتصفح العقارات وأضف ما يعجبك!
          </p>
          <Button asChild size="lg" className="transition-smooth hover:shadow-md">
            <Link href="/properties">
              <Search className="ml-2 rtl:mr-2 rtl:ml-0 h-5 w-5" />
              تصفح العقارات الآن
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
