
"use client";

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Image as ImageIcon, MapPin, BedDouble, Bath, CheckCircle, Flag, MessageSquareWarning, Edit3, Trash2, Ruler, Tag, Building, Home, UserCircle, Mail, MoreVertical, ShieldCheck, RefreshCw, Archive, Check, X, AlertCircle, Map } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState, useCallback } from 'react'; // Added React
import { doc, getDoc, Timestamp, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Property, TransactionType, PropertyTypeEnum, CustomUser, UserTrustLevel } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { ReportPropertyDialog } from '@/components/properties/ReportPropertyDialog';
import { ContactAdminDialog } from '@/components/dashboard/ContactAdminDialog';
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
import { Metadata } from 'next';
import { db as adminDb } from '@/lib/firebase/admin';


type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;
  try {
    const propRef = adminDb.collection("properties").doc(id);
    const docSnap = await propRef.get();

    if (!docSnap.exists) {
      return {
        title: 'عقار غير موجود - عقاري',
        description: 'لم نتمكن من العثور على العقار الذي تبحث عنه. قد يكون تم حذفه أو أن الرابط غير صحيح.',
      };
    }

    const property = docSnap.data() as Property;
    
    const description = `${property.transactionType === 'sale' ? 'للبيع' : 'للكراء'}: ${property.title} في ${property.city}, ${property.wilaya}. ${property.description.substring(0, 120)}...`;

    return {
      title: `${property.title} - عقاري`,
      description: description,
      openGraph: {
        title: `${property.title} - عقاري`,
        description: description,
        images: property.imageUrls && property.imageUrls.length > 0 ? [property.imageUrls[0]] : [],
        url: `/properties/${id}`,
        type: 'article',
      },
    };
  } catch (error) {
    console.error('Error generating metadata for property:', error);
    return {
      title: 'خطأ - عقاري',
      description: 'حدث خطأ أثناء تحميل بيانات العقار.',
    };
  }
}


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

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const id = React.useMemo(() => {
    const rawId = params?.id;
    return Array.isArray(rawId) ? rawId[0] : rawId;
  }, [params?.id]);

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin, refreshAdminNotifications } = useAuth();
  const [isReportPropertyDialogOpen, setIsReportPropertyDialogOpen] = useState(false);
  const [isContactAdminDialogOpen, setIsContactAdminDialogOpen] = useState(false);
  
  const [isPropertyActionLoading, setIsPropertyActionLoading] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [archiveReason, setArchiveReason] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletionReason, setDeletionReason] = useState("");

  const [ownerDetailsForAdmin, setOwnerDetailsForAdmin] = useState<{ uid: string; email: string | null; trustLevel: UserTrustLevel } | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  const fetchPropertyAndOwner = useCallback(async () => {
    if (!id) {
      setError("معرف العقار غير موجود.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    setOwnerDetailsForAdmin(null);
    try {
      const propRef = doc(db, "properties", id as string);
      const docSnap = await getDoc(propRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as Omit<Property, 'id' | 'createdAt' | 'updatedAt'> & { createdAt: any, updatedAt: any };
        
        const isOwnerViewing = user && data.userId === user.uid;
        const canViewNonActive = isOwnerViewing || isAdmin;

        if (data.status === 'deleted' && !canViewNonActive) {
             setError("هذا العقار تم حذفه وغير متاح للعرض.");
        } else if (data.status !== 'active' && data.status !== 'deleted' && !canViewNonActive) {
          setError("هذا العقار غير متاح للعرض حاليًا.");
        } else {
          const fetchedProperty = {
            id: docSnap.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate ? (data.createdAt as Timestamp).toDate() : new Date(data.createdAt),
            updatedAt: (data.updatedAt as Timestamp)?.toDate ? (data.updatedAt as Timestamp).toDate() : new Date(data.updatedAt),
          } as Property;
          setProperty(fetchedProperty);
          if (fetchedProperty.imageUrls && fetchedProperty.imageUrls.length > 0) {
            setSelectedImageUrl(fetchedProperty.imageUrls[0]);
          }

          if (isAdmin && fetchedProperty.userId) {
            const ownerRef = doc(db, "users", fetchedProperty.userId);
            const ownerSnap = await getDoc(ownerRef);
            if (ownerSnap.exists()) {
              const ownerData = ownerSnap.data() as CustomUser;
              setOwnerDetailsForAdmin({ 
                uid: fetchedProperty.userId, 
                email: ownerData.email || "غير متوفر",
                trustLevel: ownerData.trustLevel || 'normal',
              });
            } else {
              setOwnerDetailsForAdmin({ uid: fetchedProperty.userId, email: "بيانات المالك غير موجودة", trustLevel: 'normal' });
            }
          }
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
  }, [id, user, isAdmin]);

  useEffect(() => {
    fetchPropertyAndOwner();
  }, [fetchPropertyAndOwner]);

  const handleAdminPropertyStatusChange = async (newStatus: Property['status'], reason?: string) => {
    if (!property || !isAdmin) return;
    setIsPropertyActionLoading(true);
    try {
      const propRef = doc(db, "properties", property.id);
      const updateData: Partial<Property> = { 
        status: newStatus, 
        updatedAt: serverTimestamp() as Timestamp 
      };
      if (newStatus === 'deleted' && reason) updateData.deletionReason = reason;
      if (newStatus === 'archived' && reason) updateData.archivalReason = reason;
      if (newStatus === 'active') {
        updateData.deletionReason = "";
        updateData.archivalReason = "";
      }

      await updateDoc(propRef, updateData);
      toast({ title: "تم تحديث حالة العقار", description: `تم تغيير حالة العقار إلى ${newStatus}.` });
      await fetchPropertyAndOwner(); // Re-fetch to get latest data
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
      toast({ title: "تم تحديث تصنيف المالك", description: `تم تغيير تصنيف المالك إلى ${trustLevelTranslations[newTrustLevel]}.`});
      setOwnerDetailsForAdmin(prev => prev ? {...prev, trustLevel: newTrustLevel } : null);
      // No need to refreshAdminNotifications here as it's not directly a "new item" count
    } catch (e) {
      console.error("Error updating owner trust level by admin:", e);
      toast({ title: "خطأ", description: "فشل تحديث تصنيف المالك.", variant: "destructive" });
    } finally {
      setIsPropertyActionLoading(false);
    }
  };

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
        <AlertCircle size={64} className="text-destructive mb-4" /> 
        <h2 className="text-2xl font-bold text-destructive mb-2">خطأ في تحميل العقار</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => router.back()} variant="outline">العودة للخلف</Button> 
      </div>
    );
  }

  if (!property) {
    return (
         <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] text-center p-4">
            <MapPin size={64} className="text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">العقار غير متوفر</h2>
            <p className="text-muted-foreground mb-6">لم نتمكن من العثور على تفاصيل هذا العقار. قد يكون تم حذفه أو أن الرابط غير صحيح.</p>
            <Button onClick={() => router.back()} variant="outline">العودة للخلف</Button> 
        </div>
    );
  }

  const { title, description, price, wilaya, city, neighborhood, address, rooms, bathrooms, length, width, area, filters, imageUrls, createdAt, userId: propertyOwnerId, transactionType, propertyType, otherPropertyType, status } = property;
  const featureLabels: Record<keyof Property['filters'], string> = {
    water: "ماء متوفر",
    electricity: "كهرباء متوفرة",
    internet: "إنترنت متوفر",
    gas: "غاز متوفر",
    contract: "بعقد موثق",
  };
  
  const isOwner = user && propertyOwnerId === user.uid;

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-2xl overflow-hidden max-w-5xl mx-auto">
        <CardHeader className="p-0">
            {selectedImageUrl ? (
                <div className="relative aspect-[2/1] md:aspect-[5/2] w-full rounded-t-lg overflow-hidden bg-muted">
                    <Image 
                        src={selectedImageUrl} 
                        alt={`${title} - الصورة الرئيسية`} 
                        fill 
                        style={{objectFit: "contain"}}
                        data-ai-hint="property interior room"
                        priority 
                    />
                </div>
            ) : imageUrls && imageUrls.length > 0 && imageUrls[0] ? ( 
                 <div className="relative aspect-[2/1] md:aspect-[5/2] w-full rounded-t-lg overflow-hidden bg-muted">
                    <Image 
                        src={imageUrls[0]} 
                        alt={`${title} - الصورة الرئيسية`} 
                        fill 
                        style={{objectFit: "contain"}}
                        data-ai-hint="property interior room"
                        priority 
                    />
                </div>
            ) : (
                <div className="relative aspect-[2/1] md:aspect-[5/2] w-full bg-muted flex items-center justify-center rounded-t-lg">
                    <ImageIcon size={64} className="text-muted-foreground" />
                </div>
            )}
            
            {imageUrls && imageUrls.length > 1 && (
                <div className="flex space-x-2 rtl:space-x-reverse p-2 bg-background/50 overflow-x-auto">
                    {imageUrls.map((url, index) => (
                        <button 
                            key={index} 
                            onClick={() => setSelectedImageUrl(url)}
                            className={cn(
                                "w-20 h-16 md:w-24 md:h-20 relative rounded-md overflow-hidden cursor-pointer border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary",
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
        </CardHeader>
        
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start mb-4">
            <CardTitle className="font-headline text-3xl md:text-4xl text-primary mb-2 md:mb-0">
              {title}
            </CardTitle>
            <div className="text-2xl md:text-3xl font-bold text-green-600 flex items-center gap-1 whitespace-nowrap">
               {formatDisplayPrice(price)}
            </div>
          </div>

          <CardDescription className="text-sm text-muted-foreground mb-6">
            نشر بتاريخ: {new Date(createdAt).toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' })}
            {property.status !== 'active' && (
                <span className={`font-bold mx-2 ${property.status === 'deleted' ? 'text-destructive' : property.status === 'archived' ? 'text-orange-500' : 'text-yellow-600'}`}>
                    (الحالة: {property.status === 'pending' ? 'قيد المراجعة' : property.status === 'archived' ? 'مؤرشف' : 'محذوف'})
                    {property.status === 'deleted' && property.deletionReason && ` - السبب: ${property.deletionReason}`}
                    {property.status === 'archived' && property.archivalReason && ` - السبب: ${property.archivalReason}`}
                </span>
            )}
          </CardDescription>

          <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
            <div>
              <h3 className="text-xl font-semibold mb-3 font-headline border-b pb-2">المواصفات الأساسية</h3>
              <div className="space-y-2 text-muted-foreground">
                <p className="flex items-center gap-2"><Tag size={18} /> <strong>نوع المعاملة:</strong> {transactionTypeTranslations[transactionType]}</p>
                <p className="flex items-center gap-2"><Home size={18} /> <strong>نوع العقار:</strong> {propertyTypeTranslations[propertyType]} {propertyType === 'other' && otherPropertyType ? ` (${otherPropertyType})` : ''}</p>
                <p className="flex items-center gap-2"><BedDouble size={18} /> <strong>عدد الغرف:</strong> {rooms}</p>
                <p className="flex items-center gap-2"><Bath size={18} /> <strong>عدد الحمامات:</strong> {bathrooms}</p>
                {length && <p className="flex items-center gap-2"><Ruler size={18} /> <strong>الطول:</strong> {length} متر</p>}
                {width && <p className="flex items-center gap-2"><Ruler size={18} /> <strong>العرض:</strong> {width} متر</p>}
                {area && <p className="flex items-center gap-2"><Ruler size={18} /> <strong>المساحة:</strong> {area} م²</p>}
              </div>
            </div>
             <div>
              <h3 className="text-xl font-semibold mb-3 font-headline border-b pb-2">الموقع</h3>
              <div className="space-y-2 text-muted-foreground">
                <p className="flex items-center gap-2"><MapPin size={18} /> <strong>الولاية:</strong> {wilaya}</p>
                <p className="flex items-center gap-2"><MapPin size={18} /> <strong>المدينة/البلدية:</strong> {city}</p>
                {neighborhood && <p className="flex items-center gap-2"><MapPin size={18} /> <strong>الحي:</strong> {neighborhood}</p>}
                {address && <p className="flex items-center gap-2"><MapPin size={18} /> <strong>العنوان:</strong> {address}</p>}
              </div>
            </div>
          </div>
          
          {isAdmin && ownerDetailsForAdmin && (
            <div className="mb-8 p-4 border rounded-md bg-secondary/50">
              <h3 className="text-lg font-semibold mb-2 font-headline flex items-center gap-2 text-primary">
                <UserCircle size={20} />
                معلومات المالك (للمسؤول فقط)
              </h3>
              <div className="space-y-1 text-sm">
                <p><strong>UID:</strong> {ownerDetailsForAdmin.uid}</p>
                <p className="flex items-center gap-1">
                  <Mail size={16} />
                  <strong>البريد الإلكتروني:</strong> {ownerDetailsForAdmin.email || "غير متوفر"}
                </p>
                <p><strong>التصنيف الحالي:</strong> {trustLevelTranslations[ownerDetailsForAdmin.trustLevel]}</p>
              </div>
            </div>
          )}

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

          {property.googleMapsLocation?.lat && property.googleMapsLocation?.lng && (
            <div className="mt-8">
                <h3 className="text-xl font-semibold mb-3 font-headline border-b pb-2 flex items-center gap-2"><Map size={18}/>الموقع على الخريطة</h3>
                <div className="aspect-video w-full rounded-md overflow-hidden border">
                    <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        src={`https://maps.google.com/maps?q=${property.googleMapsLocation.lat},${property.googleMapsLocation.lng}&hl=ar&z=15&output=embed`}
                    ></iframe>
                </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-6 md:p-8 border-t bg-secondary/30">
            <div className="w-full">
                <h3 className="text-xl font-semibold mb-4 font-headline text-center">الإجراءات</h3>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                   {user && !isAdmin && !isOwner && (
                     <Button 
                        size="lg" 
                        variant="destructive_outline" 
                        className="flex-1 transition-smooth hover:shadow-md"
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
                                className="flex-1 transition-smooth hover:shadow-md"
                                onClick={() => setIsContactAdminDialogOpen(true)}
                            >
                                <MessageSquareWarning size={20} className="ml-2 rtl:mr-2 rtl:ml-0" /> الإبلاغ عن مشكلة
                            </Button>
                            <Button asChild size="lg" variant="outline_primary" className="flex-1 transition-smooth hover:shadow-md">
                                <Link href={`/dashboard/properties/${property.id}/edit`}>
                                    <Edit3 size={20} className="ml-2 rtl:mr-2 rtl:ml-0" /> تعديل العقار
                                </Link>
                            </Button>
                            {property.status !== 'deleted' && (
                                <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => { setIsDeleteDialogOpen(open); if (!open) setDeletionReason(""); }}>
                                    <AlertDialogTrigger asChild>
                                        <Button size="lg" variant="destructive" className="flex-1 transition-smooth hover:shadow-md">
                                            <Trash2 size={20} className="ml-2 rtl:mr-2 rtl:ml-0" /> حذف العقار
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>تأكيد حذف العقار</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            هل أنت متأكد أنك تريد حذف هذا العقار؟ سيتم نقله إلى المحذوفات.
                                            الرجاء إدخال سبب الحذف.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <Textarea
                                            placeholder="سبب الحذف..."
                                            value={deletionReason}
                                            onChange={(e) => setDeletionReason(e.target.value)}
                                            className="my-2"
                                            rows={3}
                                        />
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleAdminPropertyStatusChange('deleted', deletionReason)} disabled={isPropertyActionLoading || !deletionReason.trim()}>
                                            {isPropertyActionLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                                            تأكيد الحذف
                                        </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </>
                    )}
                     {isAdmin && !isOwner && ownerDetailsForAdmin && ( 
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="lg" variant="outline_primary" className="flex-1 transition-smooth hover:shadow-md">
                                    <ShieldCheck size={20} className="ml-2 rtl:mr-2 rtl:ml-0" /> إدارة (مسؤول) <MoreVertical size={16} className="mr-1 rtl:ml-1 rtl:mr-0"/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center" className="w-56">
                                <DropdownMenuLabel>إجراءات على العقار</DropdownMenuLabel>
                                {property.status !== 'active' && (
                                    <DropdownMenuItem onClick={() => handleAdminPropertyStatusChange('active')} disabled={isPropertyActionLoading}>
                                        <Check size={16} className="text-green-500 ml-2 rtl:mr-2 rtl:ml-0" /> تفعيل العقار
                                    </DropdownMenuItem>
                                )}
                                {property.status !== 'archived' && (
                                    <DropdownMenuItem onClick={() => setIsArchiveDialogOpen(true)} disabled={isPropertyActionLoading}>
                                        <Archive size={16} className="ml-2 rtl:mr-2 rtl:ml-0" /> أرشفة العقار
                                    </DropdownMenuItem>
                                )}
                                {property.status !== 'deleted' && (
                                    <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive focus:text-destructive" disabled={isPropertyActionLoading}>
                                        <Trash2 size={16} className="ml-2 rtl:mr-2 rtl:ml-0" /> حذف العقار
                                    </DropdownMenuItem>
                                )}
                                 {property.status === 'pending' && (
                                    <DropdownMenuItem onClick={() => handleAdminPropertyStatusChange('active')} className="text-green-600 focus:text-green-700" disabled={isPropertyActionLoading}>
                                        <RefreshCw size={16} className="ml-2 rtl:mr-2 rtl:ml-0" /> الموافقة على النشر
                                    </DropdownMenuItem>
                                )}


                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>إجراءات على المالك</DropdownMenuLabel>
                                <DropdownMenuSub>
                                <DropdownMenuSubTrigger disabled={isPropertyActionLoading}>
                                    <UserCircle size={16} className="ml-2 rtl:mr-2 rtl:ml-0" /> تغيير تصنيف المالك
                                </DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                    <DropdownMenuSubContent>
                                    {Object.entries(trustLevelTranslations).map(([levelKey, levelName]) => (
                                        <DropdownMenuItem 
                                            key={levelKey} 
                                            onClick={() => handleAdminOwnerTrustLevelChange(levelKey as UserTrustLevel)}
                                            disabled={ownerDetailsForAdmin.trustLevel === levelKey || isPropertyActionLoading}
                                        >
                                            {ownerDetailsForAdmin.trustLevel === levelKey && <Check size={14} className="ml-1 rtl:mr-1 rtl:ml-0"/>}
                                            {levelName}
                                        </DropdownMenuItem>
                                    ))}
                                    </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                                </DropdownMenuSub>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                   {(!user && !isOwner && !isAdmin) && (
                     <p className="text-muted-foreground text-center w-full">لإجراءات إضافية، يرجى تسجيل الدخول.</p>
                   )}
                </div>
            </div>
        </CardFooter>
      </Card>
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

      {/* Admin Archive Dialog */}
      <AlertDialog open={isAdmin && isArchiveDialogOpen} onOpenChange={(open) => { setIsArchiveDialogOpen(open); if (!open) setArchiveReason(""); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>أرشفة العقار (إجراء إداري)</AlertDialogTitle>
            <AlertDialogDescription>
              أنت على وشك أرشفة العقار "{property.title}". الرجاء إدخال سبب الأرشفة.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="سبب الأرشفة..."
            value={archiveReason}
            onChange={(e) => setArchiveReason(e.target.value)}
            className="my-2"
            rows={3}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleAdminPropertyStatusChange('archived', archiveReason)} disabled={isPropertyActionLoading || !archiveReason.trim()}>
              {isPropertyActionLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
              تأكيد الأرشفة
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Admin Delete Dialog (reusing for admin if !isOwner) */}
       <AlertDialog open={isAdmin && !isOwner && isDeleteDialogOpen} onOpenChange={(open) => { setIsDeleteDialogOpen(open); if(!open) setDeletionReason(""); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف العقار (إجراء إداري)</AlertDialogTitle>
            <AlertDialogDescription>
              أنت على وشك حذف العقار "{property.title}" كمسؤول. الرجاء إدخال سبب الحذف.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="سبب الحذف (إجراء إداري)..."
            value={deletionReason}
            onChange={(e) => setDeletionReason(e.target.value)}
            className="my-2"
            rows={3}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleAdminPropertyStatusChange('deleted', deletionReason)} disabled={isPropertyActionLoading || !deletionReason.trim()}>
              {isPropertyActionLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
              تأكيد الحذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
