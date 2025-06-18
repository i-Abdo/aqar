
"use client";
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Image as ImageIcon, MapPin, BedDouble, Bath, CheckCircle, Flag, MessageSquareWarning, Edit3, Trash2, Ruler } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { doc, getDoc, Timestamp, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Property } from '@/types';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatDisplayPrice } from '@/lib/utils';


export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter(); 
  const { toast } = useToast();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin } = useAuth();
  const [isReportPropertyDialogOpen, setIsReportPropertyDialogOpen] = useState(false);
  const [isContactAdminDialogOpen, setIsContactAdminDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletionReason, setDeletionReason] = useState("");
  const [isDeletingProperty, setIsDeletingProperty] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);


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
            
            if (data.status === 'deleted' && !(user && (data.userId === user.uid || isAdmin))) {
                 setError("هذا العقار تم حذفه وغير متاح للعرض.");
            } else if (data.status !== 'active' && data.status !== 'deleted' && !(user && (data.userId === user.uid || isAdmin))) {
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

  const handleDeleteProperty = async () => {
    if (!property || !user || !(user.uid === property.userId || isAdmin)) { 
      toast({ title: "خطأ", description: "غير مصرح لك بحذف هذا العقار.", variant: "destructive" });
      return;
    }
    if (!deletionReason.trim()) {
      toast({ title: "سبب الحذف مطلوب", description: "يرجى إدخال سبب الحذف.", variant: "destructive" });
      return;
    }
    setIsDeletingProperty(true);
    try {
      const propRef = doc(db, "properties", property.id);
      await updateDoc(propRef, { 
        status: 'deleted', 
        deletionReason: deletionReason,
        archivalReason: "", 
        updatedAt: serverTimestamp() 
      });
      toast({ title: "تم الحذف", description: `تم حذف العقار "${property.title}" بنجاح.` });
      if (isAdmin) {
          router.push("/admin/properties"); 
      } else {
          router.push("/dashboard/properties"); 
      }
      setIsDeleteDialogOpen(false);
    } catch (e) {
      console.error("Error deleting property:", e);
      toast({ title: "خطأ", description: "فشل حذف العقار. يرجى المحاولة مرة أخرى.", variant: "destructive" });
    } finally {
      setIsDeletingProperty(false);
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
        <MapPin size={64} className="text-destructive mb-4" /> 
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

  const { title, description, price, wilaya, city, neighborhood, address, rooms, bathrooms, length, width, area, filters, imageUrls, createdAt, userId: propertyOwnerId } = property;
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
                {length && <p className="flex items-center gap-2"><Ruler size={18} /> <strong>الطول:</strong> {length} متر</p>}
                {width && <p className="flex items-center gap-2"><Ruler size={18} /> <strong>العرض:</strong> {width} متر</p>}
                {area && <p className="flex items-center gap-2"><Ruler size={18} /> <strong>المساحة:</strong> {area} م²</p>}
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
                                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
                                        <AlertDialogAction onClick={handleDeleteProperty} disabled={isDeletingProperty || !deletionReason.trim()}>
                                            {isDeletingProperty && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                                            تأكيد الحذف
                                        </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </>
                    )}
                     {(isAdmin && !isOwner) && ( 
                        <>
                            <Button asChild size="lg" variant="outline_primary" className="flex-1 transition-smooth hover:shadow-md">
                                <Link href={`/admin/properties`}> 
                                    <Edit3 size={20} className="ml-2 rtl:mr-2 rtl:ml-0" /> إدارة العقار (مسؤول)
                                </Link>
                            </Button>
                            {property.status !== 'deleted' && (
                                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                <AlertDialogTrigger asChild>
                                    <Button size="lg" variant="destructive" className="flex-1 transition-smooth hover:shadow-md">
                                        <Trash2 size={20} className="ml-2 rtl:mr-2 rtl:ml-0" /> حذف العقار (مسؤول)
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>تأكيد حذف العقار (مسؤول)</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        أنت على وشك حذف هذا العقار كمسؤول. الرجاء إدخال سبب الحذف.
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
                                    <AlertDialogAction onClick={handleDeleteProperty} disabled={isDeletingProperty || !deletionReason.trim()}>
                                        {isDeletingProperty && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                                        تأكيد الحذف
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            )}
                        </>
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
    </div>
  );
}
