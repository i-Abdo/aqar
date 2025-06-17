
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { collection, query, where, getDocs, doc, updateDoc, getCountFromServer, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Property, Plan } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Edit3, Trash2, PlusCircle, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation"; // Added missing import
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
import { Input } from '@/components/ui/input';
import { plans } from "@/config/plans";

// Dummy property card component for this page
function PropertyListItemCard({ property, onDelete, onArchive }: { property: Property, onDelete: (id: string, reason: string) => void, onArchive: (id: string) => void }) {
  const [deleteReason, setDeleteReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const { toast } = useToast();

  const handleDeleteWithReason = async () => {
    if (!deleteReason.trim()) {
      toast({ title: "سبب الحذف مطلوب", description: "يرجى إدخال سبب لحذف العقار.", variant: "destructive"});
      return;
    }
    setIsDeleting(true);
    await onDelete(property.id, deleteReason);
    setIsDeleting(false);
  };
  
  const handleArchive = async () => {
    setIsArchiving(true);
    await onArchive(property.id);
    setIsArchiving(false);
  };

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="p-0">
        <Image 
          src={property.imageUrls?.[0] || "https://placehold.co/400x250.png"} 
          alt={property.title}
          width={400} 
          height={250} 
          className="object-cover w-full h-48"
          data-ai-hint="house exterior"
        />
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl font-headline mb-1 truncate" title={property.title}>{property.title}</CardTitle>
        <p className="text-lg font-semibold text-primary mb-2">{property.price.toLocaleString()} د.ج</p>
        <p className="text-sm text-muted-foreground mb-1 truncate">{property.wilaya}, {property.city}</p>
        <p className="text-sm text-muted-foreground">الحالة: <span className={`font-medium ${property.status === 'active' ? 'text-green-600' : property.status === 'pending' ? 'text-yellow-600' : 'text-orange-600'}`}>{property.status === 'active' ? 'نشط' : property.status === 'pending' ? 'قيد المراجعة' : property.status === 'deleted' ? 'محذوف' : 'مؤرشف'}</span></p>
      </CardContent>
      <CardFooter className="p-4 border-t grid grid-cols-2 gap-2">
         {property.status !== 'deleted' && property.status !== 'archived' && (
          <>
            <Button variant="outline" size="sm" asChild className="transition-smooth">
              <Link href={`/dashboard/properties/${property.id}/edit`}> <Edit3 size={16} className="ml-1 rtl:ml-0 rtl:mr-1"/> تعديل</Link>
            </Button>
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive_outline" size="sm" className="transition-smooth"><Trash2 size={16} className="ml-1 rtl:ml-0 rtl:mr-1"/> حذف</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                  <AlertDialogDescription>
                    هل أنت متأكد أنك تريد حذف هذا العقار؟ سيتم نقله إلى المحذوفات. الرجاء إدخال سبب الحذف.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Input 
                  placeholder="سبب الحذف (مثال: تم البيع، خطأ في الإدخال)" 
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="my-2"
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
          </>
         )}
          {(property.status === 'deleted') && (
             <Button variant="outline_secondary" size="sm" onClick={handleArchive} disabled={isArchiving} className="col-span-2 transition-smooth">
                {isArchiving && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                أرشفة العقار
             </Button>
          )}
      </CardFooter>
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
      // Fetch properties
      const propsQuery = query(collection(db, "properties"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(propsQuery);
      const props = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt),
          updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate() : new Date(doc.data().updatedAt),
      } as Property));
      setProperties(props);

      // Check limits
      const userPlanId = user.planId || 'free';
      const planDetails = plans.find(p => p.id === userPlanId);
      setCurrentPlan(planDetails || null);

      if (planDetails) {
        if (planDetails.maxListings === Infinity) {
          setCanAddProperty(true);
        } else {
          // Count only active and pending properties towards the limit
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
        setCanAddProperty(false); // Default to false if plan details not found
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
      await updateDoc(propRef, { status: 'deleted', deletionReason: reason, updatedAt: new Date() });
      toast({ title: "تم الحذف", description: "تم نقل العقار إلى المحذوفات." });
      fetchPropertiesAndLimits(); // Refresh list and limits
    } catch (error) {
      toast({ title: "خطأ", description: "فشل حذف العقار.", variant: "destructive" });
    }
  };
  
  const handleArchiveProperty = async (id: string) => {
    try {
      const propRef = doc(db, "properties", id);
      await updateDoc(propRef, { status: 'archived', updatedAt: new Date() });
      toast({ title: "تمت الأرشفة", description: "تم أرشفة العقار بنجاح." });
      fetchPropertiesAndLimits(); // Refresh list and limits
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
