
"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Image as ImageIcon, MapPin, BedDouble, Bath, CheckCircle, Flag, MessageSquareWarning, Edit3, Trash2, Ruler, Tag, Building, Home, UserCircle, Mail, MoreVertical, ShieldCheck, RefreshCw, Archive, Check, X, AlertCircle, Map, Phone, Share2, CalendarDays, Facebook, Instagram, Video, Eye } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { doc, getDoc, Timestamp, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Property, TransactionType, PropertyTypeEnum, CustomUser, UserTrustLevel, SerializableProperty } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { incrementPropertyView } from '@/actions/viewActions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, toDate } from 'date-fns';
import { ar } from 'date-fns/locale';
import { formatDisplayPrice } from '@/lib/utils';
import { siteConfig } from '@/config/site';
import { Badge } from '@/components/ui/badge';
import dynamic from 'next/dynamic';

const WhatsAppIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="lucide lucide-whatsapp h-5 w-5 fill-current"><title>WhatsApp</title><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
);


const ReportPropertyDialog = dynamic(() => 
  import('./ReportPropertyDialog').then((mod) => mod.ReportPropertyDialog)
);
const ContactAdminDialog = dynamic(() => 
  import('@/components/dashboard/ContactAdminDialog').then((mod) => mod.ContactAdminDialog)
);


// Helper function to convert ISO string back to Date object
const parsePropertyDates = (prop: SerializableProperty | null): Property | null => {
  if (!prop) return null;
  return {
    ...prop,
    createdAt: new Date(prop.createdAt),
    updatedAt: new Date(prop.updatedAt),
  };
};

const transactionTypeTranslations: Record<TransactionType, string> = {
  sale: "بيع",
  rent: "كراء",
};

const propertyTypeTranslations: Record<PropertyTypeEnum, string> = {
  land: "أرض",
  villa: "فيلا",
  house: "بيت",
  apartment: "شقة",
  office: "مكتب",
  warehouse: "مستودع (قاراج)",
  shop: "حانوت",
  other: "آخر",
};

const trustLevelTranslations: Record<UserTrustLevel, string> = {
  normal: 'عادي',
  untrusted: 'غير موثوق',
  blacklisted: 'قائمة سوداء',
};

interface PropertyDetailClientProps {
    initialProperty: SerializableProperty | null;
    propertyId: string;
}

const VideoEmbed = ({ url, title, poster }: { url: string; title: string; poster?: string }) => {
    try {
        const urlObj = new URL(url);
        let embedSrc: string | null = null;
        let isIframe = true;

        if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
            const videoId = urlObj.hostname.includes('youtu.be')
                ? urlObj.pathname.substring(1).split('?')[0]
                : urlObj.searchParams.get('v');
            if (videoId) embedSrc = `https://www.youtube.com/embed/${videoId}`;
        } else if (urlObj.hostname.includes('tiktok.com')) {
            const pathParts = urlObj.pathname.split('/');
            const videoId = pathParts.find(p => /^\d+$/.test(p));
            if (videoId) embedSrc = `https://www.tiktok.com/embed/v2/${videoId}`;
        } else if (urlObj.hostname.includes('facebook.com')) {
            return (
                 <div className="w-full h-full" style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                    <iframe
                        src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&height=476`}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                        scrolling="no"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        allowFullScreen
                        title={`Video Player for ${title}`}
                    ></iframe>
                 </div>
            );
        } else if (url.match(/\.(mp4|webm|mov)$/i)) {
            embedSrc = url;
            isIframe = false;
        }

        if (embedSrc) {
            if (isIframe) {
                return (
                    <iframe src={embedSrc} title={`Video Player for ${title}`} frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen className="w-full h-full"></iframe>
                );
            } else {
                return (
                    <video key={url} controls preload="metadata" className="w-full h-full" playsInline poster={poster}>
                        <source src={url} />
                        متصفحك لا يدعم عرض الفيديو.
                    </video>
                );
            }
        }
    } catch (e) {
        // Invalid URL, fall through to unsupported link
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-muted p-4 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="font-semibold">تعذر تضمين الفيديو من هذا الرابط.</p>
            <p className="text-sm text-muted-foreground mb-4">لكن يمكنك مشاهدته بالضغط على الزر أدناه.</p>
            <Button asChild><a href={url} target="_blank" rel="noopener noreferrer">فتح الفيديو في صفحة جديدة</a></Button>
        </div>
    );
};


// The component now receives the initial property data as a prop
export default function PropertyDetailClient({ initialProperty, propertyId }: PropertyDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAdmin, loading: authLoading, refreshAdminNotifications } = useAuth();
  
  const [property, setProperty] = useState<Property | null>(parsePropertyDates(initialProperty));
  const [isLoading, setIsLoading] = useState(!initialProperty); // Set loading true if no initial data
  const [error, setError] = useState<string | null>(null);
  const [isReportPropertyDialogOpen, setIsReportPropertyDialogOpen] = useState(false);
  const [isContactAdminDialogOpen, setIsContactAdminDialogOpen] = useState(false);
  
  const [isPropertyActionLoading, setIsPropertyActionLoading] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [archiveReason, setArchiveReason] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletionReason, setDeletionReason] = useState("");

  const [ownerDetailsForAdmin, setOwnerDetailsForAdmin] = useState<{ uid: string; email: string | null; trustLevel: UserTrustLevel } | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(initialProperty?.imageUrls?.[0] || null);
  
  const [copiedShare, setCopiedShare] = useState(false);
  
  const fetchPropertyAndRefresh = useCallback(async () => {
    if (!propertyId) return;
    setIsLoading(true);
    try {
      const propRef = doc(db, "properties", propertyId);
      const docSnap = await getDoc(propRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const fetchedProperty = parsePropertyDates({id: docSnap.id, ...data, createdAt: data.createdAt?.toDate().toISOString(), updatedAt: data.updatedAt?.toDate().toISOString() } as SerializableProperty);
        setProperty(fetchedProperty);

        // Authorization check
        const isOwnerViewing = user && fetchedProperty?.userId === user.uid;
        const canViewNonActive = isOwnerViewing || isAdmin;

        if (fetchedProperty?.status === 'deleted' && !canViewNonActive) {
          setError("هذا العقار تم حذفه وغير متاح للعرض.");
        } else if (fetchedProperty?.status !== 'active' && fetchedProperty?.status !== 'deleted' && !canViewNonActive) {
          setError("هذا العقار غير متاح للعرض حاليًا.");
        } else {
          setError(null); // Clear any previous error
        }

        if (fetchedProperty?.imageUrls && fetchedProperty.imageUrls.length > 0) {
            setSelectedImageUrl(fetchedProperty.imageUrls[0]);
        }

      } else {
        setError("لم يتم العثور على العقار. ربما تم حذفه.");
      }
    } catch(err) {
      console.error("Error refreshing property details:", err);
      toast({ title: "خطأ", description: "فشل تحديث بيانات العقار.", variant: "destructive" });
      setError("فشل تحميل بيانات العقار.");
    } finally {
        setIsLoading(false);
    }
  }, [propertyId, toast, user, isAdmin]);

  useEffect(() => {
    if (!initialProperty) {
      fetchPropertyAndRefresh();
    } else {
      // Logic for when initialProperty is present
      const isOwnerViewing = user && initialProperty.userId === user.uid;
      const canViewNonActive = isOwnerViewing || isAdmin;
      if (initialProperty.status === 'deleted' && !canViewNonActive) {
        setError("هذا العقار تم حذفه وغير متاح للعرض.");
      } else if (initialProperty.status !== 'active' && initialProperty.status !== 'deleted' && !canViewNonActive) {
        setError("هذا العقار غير متاح للعرض حاليًا.");
      } else {
        setError(null);
      }
    }
  }, [initialProperty, fetchPropertyAndRefresh, user, isAdmin]);

  // Effect to increment view count
  useEffect(() => {
    const handleIncrementView = async () => {
      // Only run if property exists and user is not the owner
      if (property && user?.uid !== property.userId) {
        const viewedKey = `viewed-${property.id}`;
        if (!sessionStorage.getItem(viewedKey)) {
          try {
            await incrementPropertyView(property.id);
            sessionStorage.setItem(viewedKey, 'true');
          } catch (e) {
            console.error("Failed to increment view count:", e);
            // We don't toast this error to the user as it's a background task.
          }
        }
      }
    };

    if (propertyId && property && property.status === 'active') {
      handleIncrementView();
    }
  }, [propertyId, property, user]);


  // Fetch owner details if admin
  useEffect(() => {
    const fetchOwnerDetails = async () => {
      if (isAdmin && property?.userId) {
        const ownerRef = doc(db, "users", property.userId);
        const ownerSnap = await getDoc(ownerRef);
        if (ownerSnap.exists()) {
          const ownerData = ownerSnap.data() as CustomUser;
          setOwnerDetailsForAdmin({
            uid: property.userId,
            email: ownerData.email || "غير متوفر",
            trustLevel: ownerData.trustLevel || 'normal',
          });
        } else {
          setOwnerDetailsForAdmin({ uid: property.userId, email: "بيانات المالك غير موجودة", trustLevel: 'normal' });
        }
      }
    };
    if (property) {
        fetchOwnerDetails();
    }
  }, [property, isAdmin]);
  
    const handleShare = async () => {
    if (!property) return;

    const fullUrl = `${window.location.origin}/properties/${property.id}`;
    const shareTitle = property.title;
    const shareText = `تحقق من هذا العقار: ${property.title}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: fullUrl,
        });
      } catch (error) {
        console.log('Web Share API canceled.', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(fullUrl);
        setCopiedShare(true);
        toast({ title: "تم نسخ الرابط!", description: "يمكنك الآن لصقه ومشاركته." });
        setTimeout(() => setCopiedShare(false), 2000);
      } catch (err) {
        toast({
          title: "خطأ",
          description: "لم نتمكن من نسخ الرابط. يرجى المحاولة يدويًا.",
          variant: "destructive",
        });
      }
    }
  };

  const handleAdminPropertyStatusChange = async (newStatus: Property['status'], reason?: string) => {
    if (!property || !isAdmin) return;
    setIsPropertyActionLoading(true);
    try {
      const propRef = doc(db, "properties", property.id);
      const updateData: Partial<Property> = { 
        status: newStatus, 
        updatedAt: serverTimestamp() as any
      };
      if (newStatus === 'deleted' && reason) updateData.deletionReason = reason;
      if (newStatus === 'archived' && reason) updateData.archivalReason = reason;
      if (newStatus === 'active') {
        updateData.deletionReason = "";
        updateData.archivalReason = "";
      }

      await updateDoc(propRef, updateData as any);
      toast({ title: "تم تحديث حالة العقار", description: `تم تغيير حالة العقار إلى ${newStatus}.` });
      await fetchPropertyAndRefresh(); // Re-fetch to get latest data
      await refreshAdminNotifications();
    } catch (e) {
      console.error("Error updating property status by admin:", e);
      toast({ title: "خطأ", description: "فشل تحديث حالة العقار.", variant: "destructive" });
    } finally {
      setIsPropertyActionLoading(false);
      setIsDeleteDialogOpen(false);
      setDeletionReason("");
      setIsArchiveDialogOpen(false);
      setArchiveReason("");
    }
  };

  const handleAdminOwnerTrustLevelChange = async (newTrustLevel: UserTrustLevel) => {
    if (!ownerDetailsForAdmin || !isAdmin) return;
    setIsPropertyActionLoading(true);
    try {
      const userRef = doc(db, "users", ownerDetailsForAdmin.uid);
      await updateDoc(userRef, { trustLevel: newTrustLevel, updatedAt: serverTimestamp() });
      toast({ title: "تم تحديث تصنيف المالك", description: `تم تغيير تصنيف مالك العقار إلى ${trustLevelTranslations[newTrustLevel]}.`});
      setOwnerDetailsForAdmin(prev => prev ? {...prev, trustLevel: newTrustLevel } : null);
    } catch (e) {
      console.error("Error updating owner trust level by admin:", e);
      toast({ title: "خطأ", description: "فشل تحديث تصنيف المالك.", variant: "destructive" });
    } finally {
      setIsPropertyActionLoading(false);
    }
  };

  const generateJsonLd = () => {
    if (!property) return null;

    const propertyTypeSchema = {
      'apartment': 'Apartment',
      'house': 'House',
      'villa': 'House',
      'land': 'LandPlot',
      'office': 'OfficeBuilding',
      'warehouse': 'Place',
      'shop': 'Store',
      'other': 'RealEstateListing'
    }[property.propertyType] || 'RealEstateListing';
    
    return {
      '@context': 'https://schema.org',
      '@type': propertyTypeSchema,
      name: property.title,
      description: property.description,
      image: property.imageUrls && property.imageUrls.length > 0 ? property.imageUrls : undefined,
      ...(property.videoUrl && { video: property.videoUrl }),
      url: `${siteConfig.url}/properties/${property.id}`,
      ...(property.area && {
        floorSize: {
          '@type': 'QuantitativeValue',
          value: property.area,
          unitCode: 'MTK' // Square meter
        }
      }),
      ...(propertyTypeSchema !== 'LandPlot' && {
        numberOfRooms: property.rooms,
        ...(property.bathrooms && {
           numberOfBathroomsTotal: property.bathrooms,
        })
      }),
      address: {
        '@type': 'PostalAddress',
        streetAddress: property.address || property.neighborhood,
        addressLocality: property.city,
        addressRegion: property.wilaya,
        addressCountry: 'DZ'
      },
      offers: {
        '@type': 'Offer',
        price: property.price,
        priceCurrency: 'DZD',
        availability: property.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
        seller: {
          '@type': 'Organization',
          name: siteConfig.name,
        },
      },
    };
  };

  const jsonLd = generateJsonLd();
  
  const getFormattedDate = (date: any) => {
    if (!date) return '';
    const dateObj = date instanceof Timestamp ? date.toDate() : toDate(date);
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: ar });
  };


  if (isLoading || authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">جاري تحميل بيانات العقار...</p>
        </div>
      </div>
    );
  }

  if (error) {
     return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center p-4">
          <AlertCircle size={64} className="text-destructive mb-4" /> 
          <h2 className="text-2xl font-bold text-destructive mb-2">خطأ في عرض العقار</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => router.back()} variant="outline">العودة للخلف</Button> 
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8">
         <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center p-4">
            <MapPin size={64} className="text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">العقار غير متوفر</h2>
            <p className="text-muted-foreground mb-6">لم نتمكن من العثور على تفاصيل هذا العقار. قد يكون تم حذفه أو أن الرابط غير صحيح.</p>
            <Button onClick={() => router.back()} variant="outline">العودة للخلف</Button> 
        </div>
      </div>
    );
  }

  const { title, description, price, wilaya, city, neighborhood, address, rooms, bathrooms, area, filters, imageUrls, videoUrl, createdAt, updatedAt, viewCount, userId: propertyOwnerId, transactionType, propertyType, otherPropertyType, status, phoneNumber, whatsappNumber, facebookUrl, instagramUrl, googleMapsLink } = property;
  
  const featureLabels: Record<keyof Property['filters'], string> = {
    water: "ماء متوفر",
    electricity: "كهرباء متوفرة",
    internet: "إنترنت متوفر",
    gas: "غاز متوفر",
    contract: "بعقد موثق",
  };
  
  const isOwner = user && propertyOwnerId === user.uid;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
     <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Image Gallery & Video Column */}
            <div className="lg:col-span-2">
                <Card className="shadow-lg overflow-hidden sticky top-24">
                    <CardContent className="p-0">
                         {videoUrl && !selectedImageUrl ? (
                             <div className="relative aspect-video w-full bg-black">
                                <VideoEmbed url={videoUrl} title={title} poster={imageUrls?.[0]} />
                            </div>
                        ) : selectedImageUrl ? (
                            <div className="relative aspect-video w-full bg-muted">
                                <Image 
                                    src={selectedImageUrl} 
                                    alt={`${title} - الصورة الرئيسية`} 
                                    fill 
                                    style={{objectFit: "cover"}}
                                    data-ai-hint="property interior room"
                                    priority 
                                />
                            </div>
                        ) : imageUrls && imageUrls.length > 0 && imageUrls[0] ? ( 
                            <div className="relative aspect-video w-full bg-muted">
                                <Image 
                                    src={imageUrls[0]} 
                                    alt={`${title} - الصورة الرئيسية`} 
                                    fill 
                                    style={{objectFit: "cover"}}
                                    data-ai-hint="property interior room"
                                    priority 
                                />
                            </div>
                        ) : (
                            <div className="relative aspect-video w-full bg-muted flex items-center justify-center">
                                <ImageIcon size={64} className="text-muted-foreground" />
                            </div>
                        )}
                        
                        {(imageUrls && imageUrls.length > 0 || videoUrl) && (
                            <div className="flex justify-center space-x-2 rtl:space-x-reverse p-2 bg-background/50 overflow-x-auto">
                                {videoUrl && (
                                     <button 
                                        onClick={() => setSelectedImageUrl(null)} // Or a specific action to show video
                                        className={cn(
                                            "w-20 h-16 relative rounded-md overflow-hidden cursor-pointer border-2 transition-all flex items-center justify-center bg-muted focus:outline-none focus:ring-2 focus:ring-primary",
                                            !selectedImageUrl ? "border-primary scale-105" : "border-transparent hover:border-primary/70"
                                        )}
                                    >
                                        <Video size={32} className="text-primary"/>
                                    </button>
                                )}
                                {imageUrls && imageUrls.map((url, index) => (
                                    <button 
                                        key={index} 
                                        onClick={() => setSelectedImageUrl(url)}
                                        className={cn(
                                            "w-20 h-16 relative rounded-md overflow-hidden cursor-pointer border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary",
                                            selectedImageUrl === url ? "border-primary scale-105" : "border-transparent hover:border-primary/70"
                                        )}
                                    >
                                        <Image 
                                            src={url} 
                                            alt={`صورة مصغرة ${index + 1}`} 
                                            fill 
                                            style={{objectFit: "cover"}}
                                            data-ai-hint="property detail"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Details Column */}
            <div className="lg:col-span-1 space-y-6">
                 <Card className="shadow-lg">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                             <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="secondary">{transactionTypeTranslations[transactionType]}</Badge>
                                    <Badge variant="outline">{propertyTypeTranslations[propertyType]}</Badge>
                                </div>
                                <CardTitle className="font-headline text-2xl text-primary">{title}</CardTitle>
                             </div>
                             {property.status !== 'active' && (
                                <Badge variant="destructive" className="whitespace-nowrap h-fit">
                                    {property.status === 'pending' ? 'قيد المراجعة' : property.status === 'archived' ? 'مؤرشف' : 'محذوف'}
                                </Badge>
                             )}
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground pt-2">
                            <MapPin size={16}/>
                            <span>{wilaya}, {city}</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600 flex items-center gap-2 mb-4">
                            {formatDisplayPrice(price)}
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center text-sm text-muted-foreground">
                            <div className="flex flex-col items-center gap-1">
                                <BedDouble size={20}/>
                                <span>{rooms} غرف</span>
                            </div>
                             <div className="flex flex-col items-center gap-1">
                                <Bath size={20}/>
                                <span>{bathrooms} حمامات</span>
                            </div>
                             <div className="flex flex-col items-center gap-1">
                                <Ruler size={20}/>
                                <span>{area} م²</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-wrap justify-between items-center text-xs text-muted-foreground gap-2">
                        <div className="flex items-center gap-1">
                            <Eye size={14}/>
                            <span>{viewCount || 0} مشاهدات</span>
                        </div>
                        <div className="flex items-center gap-1" title={updatedAt ? format(toDate(updatedAt), 'PPPPp', { locale: ar }) : ''}>
                           <CalendarDays size={14}/>
                           <span>
                                {updatedAt && createdAt && toDate(updatedAt).getTime() !== toDate(createdAt).getTime() ? 'آخر تحديث ' : 'نشر '}
                                {updatedAt ? getFormattedDate(updatedAt) : ''}
                           </span>
                        </div>
                    </CardFooter>
                 </Card>

                 <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="font-headline text-xl">الوصف التفصيلي</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap break-words">
                            {description || "لا يوجد وصف تفصيلي لهذا العقار."}
                        </p>
                    </CardContent>
                 </Card>

                {filters && Object.values(filters).some(val => val === true) && (
                    <Card className="shadow-lg">
                        <CardHeader>
                             <CardTitle className="font-headline text-xl">الميزات والخدمات</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                                {Object.entries(filters).map(([key, value]) => 
                                value && (
                                    <li key={key} className="flex items-center gap-2 text-foreground">
                                    <CheckCircle size={18} className="text-green-500" />
                                    {featureLabels[key as keyof Property['filters']]}
                                    </li>
                                )
                                )}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {googleMapsLink && (
                    <Card className="shadow-lg">
                        <CardHeader>
                             <CardTitle className="font-headline text-xl flex items-center gap-2"><Map size={18}/>الموقع على الخريطة</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <a href={googleMapsLink} target="_blank" rel="noopener noreferrer" className="block w-full">
                                <Button size="lg" className="w-full text-base transition-smooth hover:shadow-md">
                                    <MapPin size={20} className="ml-2 rtl:mr-2 rtl:ml-0"/>
                                    عرض الموقع على خرائط جوجل
                                </Button>
                            </a>
                        </CardContent>
                    </Card>
                )}

                {/* Contact Card */}
                 <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="font-headline text-xl text-center">التواصل مع صاحب العقار</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {phoneNumber && (
                            <a href={`tel:${phoneNumber}`} className="block w-full">
                                <Button size="lg" className="w-full text-base transition-smooth hover:shadow-md">
                                    <Phone size={20} className="ml-2 rtl:mr-2 rtl:ml-0"/>
                                    {phoneNumber}
                                </Button>
                            </a>
                        )}
                         {whatsappNumber && (
                            <a href={`https://wa.me/213${whatsappNumber.substring(1)}`} target="_blank" rel="noopener noreferrer" className="block w-full">
                                <Button 
                                    size="lg" 
                                    className="w-full text-base transition-smooth hover:shadow-md text-white bg-green-500 hover:bg-green-600">
                                    <WhatsAppIcon />
                                    واتساب
                                </Button>
                            </a>
                        )}
                        {facebookUrl && (
                            <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                                <Button size="lg" variant="outline_primary" className="w-full text-base transition-smooth hover:shadow-md">
                                    <Facebook size={20} className="ml-2 rtl:mr-2 rtl:ml-0"/>
                                    فيسبوك
                                </Button>
                            </a>
                        )}
                        {instagramUrl && (
                            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                                <Button 
                                    size="lg" 
                                    className="w-full text-base transition-smooth hover:shadow-md text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:bg-gradient-to-br">
                                    <Instagram size={20} className="ml-2 rtl:mr-2 rtl:ml-0"/>
                                    انستقرام
                                </Button>
                            </a>
                        )}
                        {!phoneNumber && !facebookUrl && !instagramUrl && (
                            <p className="text-sm text-muted-foreground text-center">لم يوفر المالك معلومات تواصل إضافية.</p>
                        )}
                    </CardContent>
                 </Card>


                {/* Actions Card */}
                 <Card className="shadow-lg bg-secondary/30">
                    <CardHeader>
                        <CardTitle className="font-headline text-xl text-center">إجراءات</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button
                            size="lg"
                            variant="outline_primary"
                            className="w-full text-base transition-smooth hover:shadow-md"
                            onClick={handleShare}
                        >
                            {copiedShare ? (
                                <>
                                    <Check size={20} className="ml-2 rtl:mr-2 rtl:ml-0 text-green-500" /> تم النسخ
                                </>
                            ) : (
                                <>
                                    <Share2 size={20} className="ml-2 rtl:mr-2 rtl:ml-0" /> مشاركة العقار
                                </>
                            )}
                        </Button>
                        {user && !isAdmin && !isOwner && (
                            <Button 
                                size="lg" 
                                variant="destructive_outline" 
                                className="w-full text-base transition-smooth hover:shadow-md"
                                onClick={() => setIsReportPropertyDialogOpen(true)}
                            >
                                <Flag size={20} className="ml-2 rtl:mr-2 rtl:ml-0" /> إبلاغ عن العقار
                            </Button>
                        )}
                        {isOwner && (
                            <>
                                <Button
                                    size="lg"
                                    variant="outline_accent" 
                                    className="w-full text-base transition-smooth hover:shadow-md"
                                    onClick={() => setIsContactAdminDialogOpen(true)}
                                >
                                    <MessageSquareWarning size={20} className="ml-2 rtl:mr-2 rtl:ml-0" /> الإبلاغ عن مشكلة
                                </Button>
                                <Button asChild size="lg" variant="outline_secondary" className="w-full text-base transition-smooth hover:shadow-md">
                                    <Link href={`/dashboard/properties/${property.id}/edit`}>
                                        <Edit3 size={20} className="ml-2 rtl:mr-2 rtl:ml-0" /> تعديل العقار
                                    </Link>
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>

            </div>
        </div>
      </div>
      {user && !isAdmin && !isOwner && (
        <ReportPropertyDialog
            isOpen={isReportPropertyDialogOpen}
            onOpenChange={setIsReportPropertyDialogOpen}
            propertyId={property.id}
            propertyTitle={property.title}
        />
      )}
      {isOwner && user && (
        <ContactAdminDialog
          isOpen={isContactAdminDialogOpen}
          onOpenChange={setIsContactAdminDialogOpen}
          userId={user.uid}
          userEmail={user.email || "غير متوفر"}
          propertyId={property.id}
          propertyTitle={property.title}
        />
      )}
    </>
  );
}
