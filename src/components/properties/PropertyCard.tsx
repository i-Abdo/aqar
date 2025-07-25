
"use client";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Property, TransactionType, PropertyTypeEnum } from "@/types";
import { BedDouble, Bath, MapPin, Phone, Flag, Tag, Home, Ruler, Share2, Check, Heart } from "lucide-react"; 
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useFavorites } from "@/hooks/use-favorites"; // Import useFavorites
import { formatDisplayPrice } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";
import dynamic from 'next/dynamic';
import { cn } from "@/lib/utils";

const ReportPropertyDialog = dynamic(() => 
  import('./ReportPropertyDialog').then((mod) => mod.ReportPropertyDialog)
);

interface PropertyCardProps {
  property: Property;
}

const transactionTypeTranslations: Record<TransactionType, string> = {
  sale: "للبيع",
  rent: "للكراء",
};

const propertyTypeShortTranslations: Record<PropertyTypeEnum, string> = {
  land: "أرض",
  villa: "فيلا",
  house: "بيت",
  apartment: "شقة",
  office: "مكتب",
  warehouse: "مستودع",
  shop: "حانوت",
  other: "آخر",
};

export function PropertyCard({ property }: PropertyCardProps) {
  const { user, isAdmin } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites(); // Use the favorites hook
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  
  const canReport = user && !isAdmin && property.userId !== user.uid;
  const isCurrentlyFavorite = isFavorite(property.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation(); // Stop event bubbling
    toggleFavorite(property);
  };

  return (
    <>
      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
        <CardHeader className="p-0 relative">
          <Link href={`/properties/${property.id}`} className="block h-48 relative group">
            <Image
              src={property.imageUrls?.[0] || "https://placehold.co/400x250.png"}
              alt={property.title}
              fill
              style={{objectFit: "cover"}}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="rounded-t-lg transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="house exterior"
            />
             <Button
              size="icon"
              variant="secondary"
              className="absolute top-2 left-2 z-10 rounded-full h-9 w-9 bg-black/30 hover:bg-black/50 text-white"
              onClick={handleFavoriteClick}
              aria-label={isCurrentlyFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
            >
              <Heart className={cn("h-5 w-5 transition-all", isCurrentlyFavorite ? "text-red-500 fill-current" : "text-white")} />
            </Button>
          </Link>
           <div className="absolute top-2 right-2 flex gap-1 z-10">
            {property.transactionType && (
              <Badge variant="default" className="text-xs">
                {transactionTypeTranslations[property.transactionType]}
              </Badge>
            )}
            {property.propertyType && (
              <Badge variant="secondary" className="text-xs">
                {propertyTypeShortTranslations[property.propertyType]}
                {property.propertyType === 'other' && property.otherPropertyType ? ` (${property.otherPropertyType.substring(0,10)})` : ''}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-3 flex-grow flex flex-col">
          <Link href={`/properties/${property.id}`}>
            <CardTitle className="text-base font-headline mb-1 truncate hover:text-primary transition-colors" title={property.title}>
              {property.title}
            </CardTitle>
          </Link>
          <p className="text-base font-semibold text-green-600 mb-2">{formatDisplayPrice(property.price)}</p>
          
          <ul className="text-xs text-muted-foreground space-y-1 flex-grow">
            <li className="flex items-center gap-1.5 truncate" title={`${property.wilaya}, ${property.city}`}>
              <MapPin size={14} className="text-destructive shrink-0" />
              <span>{property.wilaya}, {property.city}</span>
            </li>
            <li className="flex flex-wrap items-center gap-x-3 gap-y-1">
               <span className="flex items-center gap-1 whitespace-nowrap">
                  <BedDouble size={14} className="text-muted-foreground shrink-0" />
                  {property.rooms} غرف
                </span>
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <Bath size={14} className="text-muted-foreground shrink-0" />
                  {property.bathrooms} حمامات
                </span>
                {property.area && (
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <Ruler size={14} className="text-muted-foreground shrink-0" />
                    {property.area} م²
                  </span>
                )}
            </li>
          </ul>
        </CardContent>
        <CardFooter className="p-3 border-t flex justify-center gap-2">
          <Button asChild size="sm" className="flex-1 transition-smooth hover:shadow-md">
            <Link href={`/properties/${property.id}`}>عرض التفاصيل</Link>
          </Button>
          {canReport && (
            <Button 
              variant="outline_secondary" 
              size="icon" 
              className="transition-smooth hover:shadow-md"
              onClick={() => setIsReportDialogOpen(true)}
              title="إبلاغ عن هذا العقار"
            >
              <Flag size={18} className="text-destructive" />
              <span className="sr-only">إبلاغ</span>
            </Button>
          )}
        </CardFooter>
      </Card>
      {canReport && (
        <ReportPropertyDialog
            isOpen={isReportDialogOpen}
            onOpenChange={setIsReportDialogOpen}
            propertyId={property.id}
            propertyTitle={property.title}
        />
      )}
    </>
  );
}
