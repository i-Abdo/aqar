
"use client";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Property } from "@/types";
import { BedDouble, Bath, MapPin } from "lucide-react";

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
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
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Link href={`/properties/${property.id}`}>
          <CardTitle className="text-xl font-headline mb-1 truncate hover:text-primary transition-colors" title={property.title}>
            {property.title}
          </CardTitle>
        </Link>
        <p className="text-lg font-semibold text-primary mb-2">{property.price.toLocaleString()} د.ج</p>
        <div className="text-sm text-muted-foreground space-y-1">
          <div className="flex items-center gap-1 truncate">
            <MapPin size={16} className="text-muted-foreground" />
            <span>{property.wilaya}, {property.city}</span>
          </div>
          <div className="flex items-center gap-1">
            <BedDouble size={16} className="text-muted-foreground" />
            <span>{property.rooms} غرف</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath size={16} className="text-muted-foreground" />
            <span>{property.bathrooms} حمامات</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Button asChild className="w-full transition-smooth hover:shadow-md">
          <Link href={`/properties/${property.id}`}>عرض التفاصيل</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
