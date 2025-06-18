
"use client";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Property, TransactionType, PropertyTypeEnum } from "@/types";
import { BedDouble, Bath, MapPin, Phone, Flag, Tag, Home, Ruler } from "lucide-react"; 
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ReportPropertyDialog } from "./ReportPropertyDialog"; 
import { formatDisplayPrice } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";

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
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  const canReport = user && !isAdmin && property.userId !== user.uid;

  return (
    <>
      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
        <CardHeader className="p-0 relative">
          <Link href={`/properties/${property.id}`} className="block">
            <Image
              src={property.imageUrls?.[0] || "https://placehold.co/400x250.png"}
              alt={property.title}
              width={400}
              height={250}
              className="object-cover w-full h-48"
              data-ai-hint="house exterior"
            />
          </Link>
           <div className="absolute top-2 right-2 flex gap-1">
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
        <CardContent className="p-4 flex-grow">
          <Link href={`/properties/${property.id}`}>
            <CardTitle className="text-xl font-headline mb-1 truncate hover:text-primary transition-colors" title={property.title}>
              {property.title}
            </CardTitle>
          </Link>
          <p className="text-lg font-semibold text-green-600 mb-2">{formatDisplayPrice(property.price)}</p>
          
          <div className="text-sm text-muted-foreground space-y-1">
            {/* Row 1: Location & Area */}
            <div className="grid grid-cols-2 gap-x-2">
              <div className="flex items-center gap-1 truncate" title={`${property.wilaya}, ${property.city}`}>
                <MapPin size={16} className="text-muted-foreground shrink-0" />
                <span>{property.wilaya}, {property.city}</span>
              </div>
              {property.area ? (
                <div className="flex items-center gap-1">
                  <Ruler size={16} className="text-muted-foreground shrink-0" />
                  <span>المساحة: {property.area} م²</span>
                </div>
              ) : <div className="min-h-[1.25rem]">&nbsp;</div> /* Placeholder to maintain grid structure and height */}
            </div>

            {/* Row 2: Rooms & Dimensions */}
            <div className="grid grid-cols-2 gap-x-2">
              <div className="flex items-center gap-1">
                <BedDouble size={16} className="text-muted-foreground shrink-0" />
                <span>{property.rooms} {property.rooms === 1 ? 'غرفة' : 'غرف'}</span>
              </div>
              {(property.length && property.width) ? (
                <div className="flex items-center gap-1">
                  <Ruler size={16} className="text-muted-foreground shrink-0" />
                  <span>الأبعاد: {property.length}م × {property.width}م</span>
                </div>
              ) : <div className="min-h-[1.25rem]">&nbsp;</div> /* Placeholder */}
            </div>

            {/* Row 3: Bathrooms & Phone */}
            <div className="grid grid-cols-2 gap-x-2">
              <div className="flex items-center gap-1">
                <Bath size={16} className="text-muted-foreground shrink-0" />
                <span>{property.bathrooms} حمامات</span>
              </div>
              {property.phoneNumber ? (
                <div className="flex items-center gap-1">
                  <Phone size={16} className="text-muted-foreground shrink-0" />
                  <span>{property.phoneNumber}</span>
                </div>
              ) : <div className="min-h-[1.25rem]">&nbsp;</div> /* Placeholder */}
            </div>
          </div>

        </CardContent>
        <CardFooter className="p-4 border-t flex gap-2">
          <Button asChild className="flex-1 transition-smooth hover:shadow-md">
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

