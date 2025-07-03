
"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Image as ImageIcon, MapPin, BedDouble, Bath, CheckCircle, Flag, MessageSquareWarning, Edit3, Trash2, Ruler, Tag, Building, Home, UserCircle, Mail, MoreVertical, ShieldCheck, RefreshCw, Archive, Check, X, AlertCircle, Map, Phone, Share2, CalendarDays, Facebook, Instagram } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { doc, getDoc, Timestamp, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Property, TransactionType, PropertyTypeEnum, CustomUser, UserTrustLevel } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { ReportPropertyDialog } from '@/components/properties/ReportPropertyDialog';
import { ContactAdminDialog } from '@/components/dashboard/ContactAdminDialog';
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
import { formatDisplayPrice } from '@/lib/utils';
import { siteConfig } from '@/config/site';
import { Badge } from '@/components/ui/badge';


// Helper function to convert ISO string back to Date object
const parsePropertyDates = (prop: any): Property => {
  if (!prop) return prop;
  return {
    ...prop,
    createdAt: prop.createdAt?.toDate ? prop.createdAt.toDate() : new Date(prop.createdAt),
    updatedAt: prop.updatedAt?.toDate ? prop.updatedAt.toDate() : new Date(prop.updatedAt),
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
    initialProperty: any | null;
    propertyId: string;
}

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
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  
  const [copiedShare, setCopiedShare] = useState(false);
  
  const mapEmbedUrl = useMemo(() => {
    // Prioritize coordinates if they exist
    if (property?.googleMapsLocation && property.googleMapsLocation.lat != null && property.googleMapsLocation.lng != null) {
        const { lat, lng } = property.googleMapsLocation;
        return `https://www.google.com/maps?q=${lat},${lng}&hl=ar&z=15&output=embed`;
    }

    // Fallback for old data: try to parse the link
    const googleMapsLink = property?.googleMapsLink;
    if (!googleMapsLink) return null;

    const coordRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = googleMapsLink.match(coordRegex);

    if (match && match[1] && match[2]) {
      const lat = match[1];
      const lon = match[2];
      return `https://www.google.com/maps?q=${lat},${lon}&hl=ar&z=15&output=embed`;
    }
    
    return null;
  }, [property?.googleMapsLocation, property?.googleMapsLink]);

  const fetchPropertyAndRefresh = useCallback(async () => {
    if (!propertyId) return;
    setIsLoading(true);
    try {
      const propRef = doc(db, "properties", propertyId);
      const docSnap = await getDoc(propRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as Omit<Property, 'id'>;
        const fetchedProperty = parsePropertyDates({id: docSnap.id, ...data});
        setProperty(fetchedProperty);

        // Authorization check
        const isOwnerViewing = user && fetchedProperty.userId === user.uid;
        const canViewNonActive = isOwnerViewing || isAdmin;

        if (fetchedProperty.status === 'deleted' && !canViewNonActive) {
          setError("هذا العقار تم حذفه وغير متاح للعرض.");
        } else if (fetchedProperty.status !== 'active' && fetchedProperty.status !== 'deleted' && !canViewNonActive) {
          setError("هذا العقار غير متاح للعرض حاليًا.");
        } else {
          setError(null); // Clear any previous error
        }

        if (fetchedProperty.imageUrls && fetchedProperty.imageUrls.length > 0) {
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
       if (initialProperty.imageUrls && initialProperty.imageUrls.length > 0) {
            setSelectedImageUrl(initialProperty.imageUrls[0]);
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
    
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: property.title,
      description: property.description,
      image: property.imageUrls && property.imageUrls.length > 0 ? property.imageUrls[0] : undefined,
      url: `${siteConfig.url}/properties/${property.id}`,
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
      brand: {
        '@type': 'Brand',
        name: siteConfig.name,
      },
    };
  };

  const jsonLd = generateJsonLd();

  if (isLoading || authLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">جاري تحميل بيانات العقار...</p>
      </div>
    );
  }

  if (error) {
     return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center p-4">
        <AlertCircle size={64} className="text-destructive mb-4" /> 
        <h2 className="text-2xl font-bold text-destructive mb-2">خطأ في عرض العقار</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => router.back()} variant="outline">العودة للخلف</Button> 
      </div>
    );
  }

  if (!property) {
    // This case should be handled by the server component, but as a fallback:
    return (
         <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center p-4">
            <MapPin size={64} className="text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">العقار غير متوفر</h2>
            <p className="text-muted-foreground mb-6">لم نتمكن من العثور على تفاصيل هذا العقار. قد يكون تم حذفه أو أن الرابط غير صحيح.</p>
            <Button onClick={() => router.back()} variant="outline">العودة للخلف</Button> 
        </div>
    );
  }

  const { title, description, price, wilaya, city, neighborhood, address, rooms, bathrooms, area, filters, imageUrls, createdAt, userId: propertyOwnerId, transactionType, propertyType, otherPropertyType, status, phoneNumber, facebookUrl, instagramUrl, googleMapsLink } = property;
  
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
     <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Image Gallery Column */}
            <div className="lg:col-span-2">
                <Card className="shadow-lg overflow-hidden sticky top-24">
                    <CardContent className="p-0">
                        {selectedImageUrl ? (
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
                        
                        {imageUrls && imageUrls.length > 1 && (
                            <div className="flex justify-center space-x-2 rtl:space-x-reverse p-2 bg-background/50 overflow-x-auto">
                                {imageUrls.map((url, index) => (
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
                 </Card>

                 <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="font-headline text-xl">الوصف التفصيلي</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
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

                {mapEmbedUrl && (
                     <Card className="shadow-lg">
                        <CardHeader>
                             <CardTitle className="font-headline text-xl flex items-center gap-2"><Map size={18}/>الموقع على الخريطة</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="aspect-video w-full rounded-md overflow-hidden border">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    allowFullScreen
                                    src={mapEmbedUrl}
                                    title="موقع العقار على الخريطة"
                                ></iframe>
                                </div>
                        </CardContent>
                    </Card>
                )}

                {/* Contact Card */}
                 <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="font-headline text-xl text-center">التواصل مع صاحب العقار</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {phoneNumber && (
                            <a href={`tel:${phoneNumber}`} className="w-full">
                                <Button size="lg" className="w-full text-base transition-smooth hover:shadow-md">
                                    <Phone size={20} className="ml-2 rtl:mr-2 rtl:ml-0"/>
                                    {phoneNumber}
                                </Button>
                            </a>
                        )}
                        {facebookUrl && (
                            <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                                <Button size="lg" variant="outline_primary" className="w-full text-base transition-smooth hover:shadow-md">
                                    <Facebook size={20} className="ml-2 rtl:mr-2 rtl:ml-0"/>
                                    فيسبوك
                                </Button>
                            </a>
                        )}
                        {instagramUrl && (
                            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="w-full">
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
    </div>
    </>
  );
}

