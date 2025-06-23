
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { collection, query, where, getDocs, doc, updateDoc, getCountFromServer, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Property, Plan } from "@/types";
import Link from "next/link";
import { Loader2, PlusCircle, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { plans } from "@/config/plans";
import PropertyListItemCard from '@/components/dashboard/PropertyListItemCard';


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
    
