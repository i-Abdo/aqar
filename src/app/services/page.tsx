
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect, useCallback } from "react";
import dynamic from 'next/dynamic';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Loader2, ServerCrash, Briefcase, Phone, Facebook, Instagram } from "lucide-react";
import { collection, query, where, getDocs, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { ServiceAd } from "@/types";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

const ContactDialog = dynamic(() =>
  import('@/components/layout/ContactDialog').then((mod) => mod.ContactDialog)
);

const WhatsAppIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="lucide lucide-whatsapp h-5 w-5 fill-current"><title>WhatsApp</title><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
);


const ServiceAdCard = ({ ad }: { ad: ServiceAd }) => {
    const handleLinkClick = async (url?: string) => {
        if (!url) return;
        const adRef = doc(db, "service_ads", ad.id);
        await updateDoc(adRef, {
            clicks: increment(1)
        });
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <Card className="text-center h-full flex flex-col group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <CardHeader className="p-0 relative">
                <div className="aspect-[4/3] relative">
                    <Image
                        src={ad.imageUrl}
                        alt={ad.title}
                        fill
                        style={{ objectFit: "cover" }}
                        className="rounded-t-lg"
                        data-ai-hint="service advertisement"
                    />
                </div>
            </CardHeader>
            <CardContent className="p-4 flex flex-col flex-grow">
                <p className="text-xs text-muted-foreground">{ad.serviceType}</p>
                <CardTitle className="text-md font-headline group-hover:text-primary transition-colors my-1" title={ad.title}>{ad.title}</CardTitle>
                <p className="text-sm text-muted-foreground flex-grow">{ad.description}</p>
            </CardContent>
            <CardFooter className="p-2 border-t flex flex-wrap justify-center gap-2">
                {ad.phoneNumber && <Button size="sm" variant="outline" onClick={() => handleLinkClick(`tel:${ad.phoneNumber}`)}><Phone className="h-4 w-4 ml-1" />اتصال</Button>}
                {ad.whatsappNumber && <Button size="sm" variant="outline" onClick={() => handleLinkClick(`https://wa.me/213${ad.whatsappNumber.substring(1)}`)}><WhatsAppIcon/>واتساب</Button>}
                {ad.facebookUrl && <Button size="sm" variant="outline" onClick={() => handleLinkClick(ad.facebookUrl)}><Facebook className="h-4 w-4 ml-1" />فيسبوك</Button>}
                {ad.instagramUrl && <Button size="sm" variant="outline" onClick={() => handleLinkClick(ad.instagramUrl)}><Instagram className="h-4 w-4 ml-1" />انستقرام</Button>}
            </CardFooter>
        </Card>
    );
};

const ServiceAdSkeleton = () => (
    <Card className="text-center h-full flex flex-col">
        <Skeleton className="h-48 w-full rounded-t-lg" />
        <CardContent className="p-4 flex flex-col flex-grow">
            <Skeleton className="h-4 w-20 mx-auto mb-2" />
            <Skeleton className="h-6 w-40 mx-auto mb-2" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-5/6 mt-1" />
        </CardContent>
        <CardFooter className="p-2 border-t flex flex-wrap justify-center gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
        </CardFooter>
    </Card>
);

const wilayas = [
  "أدرار", "الشلف", "الأغواط", "أم البواقي", "باتنة", "بجاية", "بسكرة", "بشار",
  "البليدة", "البويرة", "تمنراست", "تبسة", "تلمسان", "تيارت", "تيزي وزو", "الجزائر",
  "الجلفة", "جيجل", "سطيف", "سعيدة", "سكيكدة", "سيدي بلعباس", "عنابة", "قالمة",
  "قسنطينة", "المدية", "مستغانم", "المسيلة", "معسكر", "ورقلة", "وهران", "البيض",
  "إليزي", "برج بوعريريج", "بومرداس", "الطارف", "تندوف", "تيسمسيلت", "الوادي", "خنشلة",
  "سوق أهراس", "تيبازة", "ميلة", "عين الدفلى", "النعامة", "عين تموشنت", "غرداية", "غليزان"
];

const ALL_WILAYAS_VALUE = "_all_wilayas_";

export default function ServicesPage() {
  const [isContactDialogOpen, setIsContactDialogOpen] = React.useState(false);
  const [selectedWilaya, setSelectedWilaya] = React.useState<string | undefined>(undefined);
  const [ads, setAds] = useState<ServiceAd[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAds = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
        let q = query(collection(db, "service_ads"), where("status", "==", "active"));
        if (selectedWilaya && selectedWilaya !== ALL_WILAYAS_VALUE) {
            q = query(q, where("wilaya", "==", selectedWilaya));
        }
        
        const querySnapshot = await getDocs(q);
        const adsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceAd));

        // Increment views for all fetched ads
        const viewPromises = querySnapshot.docs.map(docSnap => {
            const adRef = doc(db, "service_ads", docSnap.id);
            return updateDoc(adRef, { views: increment(1) });
        });
        await Promise.all(viewPromises);

        setAds(adsData);

    } catch (err) {
        console.error("Error fetching service ads:", err);
        setError("فشل تحميل إعلانات الخدمات. يرجى المحاولة مرة أخرى.");
    } finally {
        setIsLoading(false);
    }
  }, [selectedWilaya]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-6xl mx-auto shadow-xl">
          <CardHeader className="text-center">
            <Briefcase className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-4xl font-headline text-primary">
              دليل الخدمات العقارية
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
              كل ما تحتاجه في مكان واحد. اكتشف قائمة من المهنيين الموثوقين لمساعدتك في كل مراحل عمليتك العقارية.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="w-full max-w-sm mx-auto mb-6 p-4 rounded-md bg-secondary/50 text-center">
                <p className="text-sm text-muted-foreground mb-2">لإضافة خدمتكم هنا يرجى التواصل معنا</p>
                <Button onClick={() => setIsContactDialogOpen(true)} variant="outline_primary" size="sm">
                    <Phone className="ml-2 rtl:mr-2 rtl:ml-0 h-4 w-4" />
                    تواصل معنا
                </Button>
            </div>
            <div className="flex justify-center mb-10">
                <div className="w-full max-w-sm">
                    <Select value={selectedWilaya} onValueChange={setSelectedWilaya}>
                        <SelectTrigger className="text-base h-12">
                            <MapPin className="mr-2 ml-2 h-5 w-5 text-muted-foreground"/>
                            <SelectValue placeholder="اختر ولايتك لعرض الخدمات..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL_WILAYAS_VALUE}>جميع الولايات</SelectItem>
                            {wilayas.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-8">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => <ServiceAdSkeleton key={i} />)
              ) : error ? (
                <div className="col-span-full text-center py-10">
                  <ServerCrash className="mx-auto h-12 w-12 text-destructive mb-4" />
                  <p className="text-destructive">{error}</p>
                </div>
              ) : ads.length > 0 ? (
                ads.map((ad) => <ServiceAdCard key={ad.id} ad={ad} />)
              ) : (
                <div className="col-span-full text-center py-10">
                  <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">لا توجد إعلانات خدمات متاحة حاليًا في هذه الولاية.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      {isContactDialogOpen && <ContactDialog isOpen={isContactDialogOpen} onOpenChange={setIsContactDialogOpen} />}
    </>
  );
}
