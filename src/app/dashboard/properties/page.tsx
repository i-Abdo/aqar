
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { collection, query, where, getDocs, doc, updateDoc, getCountFromServer, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Property, Plan, PropertyAppeal, TransactionType, PropertyTypeEnum } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Edit3, Trash2, PlusCircle, AlertTriangle, ShieldQuestion, Eye, Tag, Home as HomeIcon } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { Textarea } from '@/components/ui/textarea';
import { plans } from "@/config/plans";
import { submitPropertyAppeal } from '@/actions/propertyAppealActions';
import { formatDisplayPrice } from '@/lib/utils';

const PROPERTY_APPEAL_COOLDOWN_MS = 24 * 60 * 60000; // 24 hours

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


function PropertyListItemCard({ property, onDelete, onArchive }: { property: Property, onDelete: (id: string, reason: string) => void, onArchive: (id: string, reason: string) => void }) {
  const [deleteReason, setDeleteReason] = useState("");
  const [archiveReason, setArchiveReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isAppealing, setIsAppealing] = useState(false);
  const [lastAppealTime, setLastAppealTime] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user && property.status === 'archived') {
      const storedTime = localStorage.getItem(`lastAppealTime_${user.uid}_${property.id}`);
      if (storedTime) {
        setLastAppealTime(parseInt(storedTime, 10));
      }
    }
  }, [user, property.id, property.status]);

  const canAppeal = () => {
    if (property.status !== 'archived') return false;
    return Date.now() - lastAppealTime > PROPERTY_APPEAL_COOLDOWN_MS;
  };

  const handleDeleteWithReason = async () => {
    if (!deleteReason.trim()) {
      toast({ title: "سبب الحذف مطلوب", description: "يرجى إدخال سبب لحذف العقار.", variant: "destructive"});
      return;
    }
    setIsDeleting(true);
    await onDelete(property.id, deleteReason);
    setIsDeleting(false);
  };

  const handleArchiveWithReason = async () => {
    if (!archiveReason.trim()) {
      toast({ title: "سبب الأرشفة مطلوب", description: "يرجى إدخال سبب لأرشفة العقار.", variant: "destructive"});
      return;
    }
    setIsArchiving(true);
    await onArchive(property.id, archiveReason);
    setIsArchiving(false);
  };

  const handleAppeal = async () => {
    if (!user) {
        toast({ title: "خطأ", description: "يجب تسجيل الدخول لتقديم طعن.", variant: "destructive" });
        return;
    }
    if (!canAppeal()) {
        const timeLeftMs = PROPERTY_APPEAL_COOLDOWN_MS - (Date.now() - lastAppealTime);
        const hoursLeft = Math.ceil(timeLeftMs / (60 * 60000));
        toast({ title: "محاولة متكررة", description: `لقد قدمت طعنًا على هذا العقار مؤخرًا. يرجى الانتظار حوالي ${hoursLeft} ساعة.`, variant: "destructive" });
        return;
    }

    setIsAppealing(true);
    const result = await submitPropertyAppeal({
        propertyId: property.id,
        propertyTitle: property.title,
        ownerUserId: user.uid,
        ownerEmail: user.email || "غير متوفر",
        propertyArchivalReason: property.archivalReason || "---"
    });
    if (result.success) {
        toast({ title: "تم إرسال الطعن", description: result.message });
        const currentTime = Date.now();
        setLastAppealTime(currentTime);
        localStorage.setItem(`lastAppealTime_${user.uid}_${property.id}`, currentTime.toString());
    } else {
        toast({ title: "خطأ في إرسال الطعن", description: result.message, variant: "destructive" });
    }
    setIsAppealing(false);
  };


  const getStatusDisplay = () => {
    switch (property.status) {
      case 'active': return { text: 'نشط', color: 'text-green-600' };
      case 'pending': return { text: 'قيد المراجعة', color: 'text-yellow-600' };
      case 'deleted': return { text: 'محذوف', color: 'text-red-600' };
      case 'archived': return { text: 'متوقف', color: 'text-orange-600' };
      default: return { text: property.status, color: 'text-muted-foreground' };
    }
  };
  const statusDisplay = getStatusDisplay();

  const actionButtons = [];

  if (property.status !== 'deleted' && property.status !== 'archived') {
    actionButtons.push(
      <Button key="edit" variant="outline" size="sm" asChild className="transition-smooth w-full hover:shadow-sm">
        <Link href={`/dashboard/properties/${property.id}/edit`}> <Edit3 size={16} className="ml-1 rtl:ml-0 rtl:mr-1"/> تعديل</Link>
      </Button>
    );
    actionButtons.push(
      <AlertDialog key="delete">
        <AlertDialogTrigger asChild>
          <Button variant="destructive_outline" size="sm" className="transition-smooth w-full hover:shadow-sm"><Trash2 size={16} className="ml-1 rtl:ml-0 rtl:mr-1"/> حذف</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد أنك تريد حذف هذا العقار؟ سيتم نقله إلى المحذوفات. الرجاء إدخال سبب الحذف.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="سبب الحذف (مثال: تم البيع، خطأ في الإدخال)"
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            className="my-2"
            rows={3}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWithReason} disabled={isDeleting || !deleteReason.trim()}>
              {isDeleting && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  } else if (property.status === 'deleted') {
    actionButtons.push(
      <AlertDialog key="archive">
        <AlertDialogTrigger asChild>
            <Button variant="outline_secondary" size="sm" className="w-full transition-smooth hover:shadow-sm">أرشفة العقار</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>تأكيد الأرشفة</AlertDialogTitle>
                <AlertDialogDescription>
                    هل أنت متأكد أنك تريد أرشفة هذا العقار؟ الرجاء إدخال سبب الأرشفة.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <Textarea
                placeholder="سبب الأرشفة (مثال: العقار لم يعد متاحًا مؤقتًا)"
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
                className="my-2"
                rows={3}
            />
            <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={handleArchiveWithReason} disabled={isArchiving || !archiveReason.trim()}>
                    {isArchiving && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                    أرشفة
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    );
  } else if (property.status === 'archived') {
    actionButtons.push(
     <Button key="appeal" onClick={handleAppeal} variant="outline_primary" size="sm" disabled={isAppealing || !canAppeal()} className="w-full transition-smooth hover:shadow-sm">
        {isAppealing ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <ShieldQuestion size={16} className="ml-1 rtl:ml-0 rtl:mr-1"/>}
        {isAppealing ? "جاري إرسال الطعن..." : "طعن"}
     </Button>
    );
  }
  
  const gridColsClass = actionButtons.length === 0 ? 'hidden' : 
                        actionButtons.length === 1 ? 'grid-cols-1' : 
                        actionButtons.length === 2 ? 'grid-cols-2' : 'grid-cols-2';


  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <Link 
        href={`/properties/${property.id}`} 
        className="flex flex-col flex-grow cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary focus:rounded-t-lg"
      >
          <CardHeader className="p-0 group-hover:opacity-90 transition-opacity relative">
            <Image
              src={property.imageUrls?.[0] || "https://placehold.co/400x250.png"}
              alt={property.title}
              width={400}
              height={250}
              className="object-cover w-full h-48 rounded-t-lg"
              data-ai-hint="house exterior"
            />
             <div className="absolute top-2 right-2 flex gap-1">
                {property.transactionType && (
                  <Badge variant="default" className="text-xs opacity-90 group-hover:opacity-100 transition-opacity">
                    {transactionTypeTranslations[property.transactionType]}
                  </Badge>
                )}
                {property.propertyType && (
                  <Badge variant="secondary" className="text-xs opacity-90 group-hover:opacity-100 transition-opacity">
                    {propertyTypeShortTranslations[property.propertyType]}
                    {property.propertyType === 'other' && property.otherPropertyType ? ` (${property.otherPropertyType.substring(0,10)})` : ''}
                  </Badge>
                )}
            </div>
          </CardHeader>
          <CardContent className="p-4 flex-grow group-hover:bg-muted/20 transition-colors">
            <CardTitle className="text-xl font-headline mb-1 truncate group-hover:text-primary transition-colors" title={property.title}>{property.title}</CardTitle>
            <p className="text-lg font-semibold text-green-600 mb-2">{formatDisplayPrice(property.price)}</p>
            <p className="text-sm text-muted-foreground mb-1 truncate">{property.wilaya}, {property.city}</p>
            <div className="text-sm text-muted-foreground">الحالة: <span className={`font-medium ${statusDisplay.color}`}>{statusDisplay.text}</span></div>
            {property.status === 'archived' && (
                <p className="text-xs text-muted-foreground mt-1">سبب التوقيف: {property.archivalReason || "---"}</p>
            )}
            {property.status === 'deleted' && property.deletionReason && (
                <p className="text-xs text-muted-foreground mt-1">سبب الحذف: {property.deletionReason}</p>
            )}
          </CardContent>
      </Link>
      {actionButtons.length > 0 && (
        <CardFooter className={`p-4 border-t grid ${gridColsClass} gap-2`}>
          {actionButtons.map(button => button)}
        </CardFooter>
      )}
    </Card>
  );
}


export default function MyPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [canAddProperty, setCanAddProperty] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const router = useRouter();


  const fetchPropertiesAndLimits = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const propsQuery = query(collection(db, "properties"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(propsQuery);
      const props = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt),
          updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate() : new Date(doc.data().updatedAt),
      } as Property));

      props.sort((a, b) => (b.createdAt as any) - (a.createdAt as any));
      setProperties(props);

      const userPlanId = user.planId || 'free';
      const planDetails = plans.find(p => p.id === userPlanId);
      setCurrentPlan(planDetails || null);

      if (planDetails) {
        if (planDetails.maxListings === Infinity) {
          setCanAddProperty(true);
        } else {
          const activePendingPropsQuery = query(
            collection(db, "properties"),
            where("userId", "==", user.uid),
            where("status", "in", ["active", "pending"])
          );
          const countSnapshot = await getCountFromServer(activePendingPropsQuery);
          const activePendingPropsCount = countSnapshot.data().count;
          setCanAddProperty(activePendingPropsCount < planDetails.maxListings);
        }
      } else {
        setCanAddProperty(false);
      }
    } catch (error) {
      console.error("Error fetching properties or limits:", error);
      toast({ title: "خطأ", description: "لم نتمكن من تحميل بياناتك.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchPropertiesAndLimits();
    } else if (!authLoading && !user) {
      router.push('/login');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const handleDeleteProperty = async (id: string, reason: string) => {
    try {
      const propRef = doc(db, "properties", id);
      await updateDoc(propRef, { status: 'deleted', deletionReason: reason, archivalReason: "", updatedAt: Timestamp.now() });
      toast({ title: "تم الحذف", description: "تم نقل العقار إلى المحذوفات." });
      fetchPropertiesAndLimits();
    } catch (error) {
      toast({ title: "خطأ", description: "فشل حذف العقار.", variant: "destructive" });
    }
  };

  const handleArchiveProperty = async (id: string, reason: string) => {
    try {
      const propRef = doc(db, "properties", id);
      await updateDoc(propRef, { status: 'archived', archivalReason: reason, deletionReason: "", updatedAt: Timestamp.now() });
      toast({ title: "تمت الأرشفة", description: "تم أرشفة العقار بنجاح." });
      fetchPropertiesAndLimits();
    } catch (error) {
      toast({ title: "خطأ", description: "فشل أرشفة العقار.", variant: "destructive" });
    }
  };

  const handleAddPropertyClick = () => {
    if (canAddProperty) {
        router.push('/dashboard/properties/new');
    } else {
        toast({
            title: "تم الوصول للحد الأقصى",
            description: `لقد وصلت إلى الحد الأقصى لعدد العقارات المسموح به في خطة "${currentPlan?.name}". يرجى ترقية خطتك.`,
            variant: "destructive",
            action: <Button onClick={() => router.push('/pricing')} variant="secondary">الترقية الآن</Button>
        });
    }
  };


  if (isLoading || authLoading) {
    return <div className="flex justify-center items-center py-10"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">عقاراتي</h1>
        <Button onClick={handleAddPropertyClick} className="transition-smooth hover:shadow-md">
          <PlusCircle className="ml-2 rtl:ml-0 rtl:mr-2 h-5 w-5" /> إضافة عقار جديد
        </Button>
      </div>

      {properties.length === 0 ? (
        <Card className="text-center py-12 shadow-md">
          <CardHeader>
            <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle className="mt-4">لا توجد عقارات لعرضها</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              لم تقم بإضافة أي عقارات حتى الآن. ابدأ بإضافة عقارك الأول!
            </CardDescription>
          </CardContent>
           <CardFooter className="justify-center">
            <Button onClick={handleAddPropertyClick} className="transition-smooth hover:shadow-md">
                <PlusCircle className="ml-2 rtl:ml-0 rtl:mr-2 h-5 w-5" /> إضافة عقار
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(prop => (
            <PropertyListItemCard key={prop.id} property={prop} onDelete={handleDeleteProperty} onArchive={handleArchiveProperty} />
          ))}
        </div>
      )}
    </div>
  );
}
    
