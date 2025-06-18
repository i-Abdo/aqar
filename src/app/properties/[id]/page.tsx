
"use client";
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Image as ImageIcon, MapPin, BedDouble, Bath, DollarSign, CheckCircle, Phone, MessageSquare, Flag } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Property } from '@/types';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useAuth } from '@/hooks/use-auth';
import { ReportPropertyDialog } from '@/components/properties/ReportPropertyDialog';


export default function PropertyDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin } = useAuth();
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchProperty = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const propRef = doc(db, "properties", id as string);
          const docSnap = await getDoc(propRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as Omit<Property, 'id' | 'createdAt' | 'updatedAt'> & { createdAt: any, updatedAt: any };
            // Ensure property is active for viewing unless user is admin OR it's their own property (for preview perhaps, though this page is public facing)
            // For public facing, strict check: must be 'active' unless admin.
            if (data.status !== 'active' && !(user && isAdmin)) {
              setError("هذا العقار غير متاح للعرض حاليًا.");
            } else {
              setProperty({
                id: docSnap.id,
                ...data,
                createdAt: (data.createdAt as Timestamp)?.toDate ? (data.createdAt as Timestamp).toDate() : new Date(data.createdAt),
                updatedAt: (data.updatedAt as Timestamp)?.toDate ? (data.updatedAt as Timestamp).toDate() : new Date(data.updatedAt),
              } as Property);
            }
          } else {
            setError("لم يتم العثور على العقار.");
          }
        } catch (err) {
          console.error("Error fetching property details:", err);
          setError("حدث خطأ أثناء تحميل تفاصيل العقار.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchProperty();
    } else {
      setIsLoading(false);
      setError("معرف العقار غير موجود.");
    }
  }, [id, user, isAdmin]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">جاري تحميل تفاصيل العقار...</p>
      </div>
    );
  }

  if (error) {
     return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center p-4">
        <MapPin size={64} className="text-destructive mb-4" /> {}
        <h2 className="text-2xl font-bold text-destructive mb-2">خطأ في تحميل العقار</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => router.back()} variant="outline">العودة للخلف</Button> {}
      </div>
    );
  }

  if (!property) {
    return (
         <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center p-4">
            <MapPin size={64} className="text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">العقار غير متوفر</h2>
            <p className="text-muted-foreground mb-6">لم نتمكن من العثور على تفاصيل هذا العقار. قد يكون تم حذفه أو أن الرابط غير صحيح.</p>
            <Button onClick={() => router.back()} variant="outline">العودة للخلف</Button> {}
        </div>
    );
  }

  const { title, description, price, wilaya, city, neighborhood, address, rooms, bathrooms, filters, imageUrls, createdAt, phoneNumber } = property;
  const featureLabels: Record<keyof Property['filters'], string> = {
    water: "ماء متوفر",
    electricity: "كهرباء متوفرة",
    internet: "إنترنت متوفر",
    gas: "غاز متوفر",
    contract: "بعقد موثق",
  };


  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-2xl overflow-hidden">
        <CardHeader className="p-0">
            {imageUrls && imageUrls.length > 0 ? (
                 <Carousel className="w-full" opts={{ loop: imageUrls.length > 1, direction: "rtl" }}>
                    <CarouselContent>
                        {imageUrls.map((url, index) => (
                        <CarouselItem key={index}>
                            <div className="relative aspect-[16/9] md:aspect-[2/1] w-full">
                            <Image 
                                src={url || "https://placehold.co/1200x600.png"} 
                                alt={`${title} - صورة ${index + 1}`} 
                                fill 
                                objectFit="cover"
                                className="rounded-t-lg"
                                data-ai-hint="property interior room"
                                priority={index === 0} 
                            />
                            </div>
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                    {imageUrls.length > 1 && (
                        <>
                            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rtl:left-auto rtl:right-4" />
                            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rtl:right-auto rtl:left-4" />
                        </>
                    )}
                </Carousel>
            ) : (
                <div className="relative aspect-[16/9] md:aspect-[2/1] w-full bg-muted flex items-center justify-center rounded-t-lg">
                    <ImageIcon size={64} className="text-muted-foreground" />
                </div>
            )}
        </CardHeader>
        
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start mb-4">
            <CardTitle className="font-headline text-3xl md:text-4xl text-primary mb-2 md:mb-0">
              {title}
            </CardTitle>
            <div className="text-2xl md:text-3xl font-bold text-accent flex items-center gap-2 whitespace-nowrap">
               <DollarSign size={28} /> {price.toLocaleString()} د.ج
            </div>
          </div>

          <CardDescription className="text-sm text-muted-foreground mb-6">
            نشر بتاريخ: {new Date(createdAt).toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' })}
          </CardDescription>

          <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
            <div>
              <h3 className="text-xl font-semibold mb-3 font-headline border-b pb-2">الموقع</h3>
              <div className="space-y-2 text-muted-foreground">
                <p className="flex items-center gap-2"><MapPin size={18} /> <strong>الولاية:</strong> {wilaya}</p>
                <p className="flex items-center gap-2"><MapPin size={18} /> <strong>المدينة/البلدية:</strong> {city}</p>
                {neighborhood && <p className="flex items-center gap-2"><MapPin size={18} /> <strong>الحي:</strong> {neighborhood}</p>}
                {address && <p className="flex items-center gap-2"><MapPin size={18} /> <strong>العنوان:</strong> {address}</p>}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3 font-headline border-b pb-2">المواصفات</h3>
              <div className="space-y-2 text-muted-foreground">
                <p className="flex items-center gap-2"><BedDouble size={18} /> <strong>عدد الغرف:</strong> {rooms}</p>
                <p className="flex items-center gap-2"><Bath size={18} /> <strong>عدد الحمامات:</strong> {bathrooms}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-3 font-headline border-b pb-2">الوصف التفصيلي</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {description || "لا يوجد وصف تفصيلي لهذا العقار."}
            </p>
          </div>

          {filters && Object.values(filters).some(val => val === true) && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-3 font-headline border-b pb-2">الميزات والخدمات</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                {Object.entries(filters).map(([key, value]) => 
                  value && (
                    <li key={key} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle size={18} className="text-green-500" />
                      {featureLabels[key as keyof Property['filters']]}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-6 md:p-8 border-t bg-secondary/30">
            <div className="w-full">
                <h3 className="text-xl font-semibold mb-4 font-headline text-center">تواصل مع المالك أو قم بالإبلاغ</h3>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {phoneNumber ? (
                        <Button 
                            size="lg" 
                            className="flex-1 transition-smooth hover:shadow-md"
                            asChild
                        >
                            <a href={`tel:${phoneNumber}`}>
                                <Phone size={20} className="ml-2 rtl:mr-2 rtl:ml-0" />
                                اتصل بالمالك
                            </a>
                        </Button>
                    ) : (
                        <Button 
                            size="lg" 
                            className="flex-1 transition-smooth hover:shadow-md"
                            disabled
                        >
                            <Phone size={20} className="ml-2 rtl:mr-2 rtl:ml-0" />
                            اتصال (غير متاح)
                        </Button>
                    )}
                     <Button size="lg" variant="outline_secondary" className="flex-1 transition-smooth hover:shadow-md" disabled>
                        <MessageSquare size={20} className="ml-2 rtl:mr-2 rtl:ml-0" /> مراسلة (سيتم تنفيذها لاحقاً)
                    </Button>
                   {user && !isAdmin && property.userId !== user.uid && (
                     <Button 
                        size="lg" 
                        variant="destructive_outline" 
                        className="flex-1 transition-smooth hover:shadow-md"
                        onClick={() => setIsReportDialogOpen(true)}
                     >
                        <Flag size={20} className="ml-2 rtl:mr-2 rtl:ml-0" /> إبلاغ عن العقار
                    </Button>
                   )}
                </div>
            </div>
        </CardFooter>
      </Card>
      {user && !isAdmin && property.userId !== user.uid && (
        <ReportPropertyDialog
            isOpen={isReportDialogOpen}
            onOpenChange={setIsReportDialogOpen}
            propertyId={property.id}
            propertyTitle={property.title}
        />
      )}
    </div>
  );
}
