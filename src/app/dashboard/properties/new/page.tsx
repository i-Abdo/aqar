
"use client";

import { PropertyForm, PropertyFormValues } from "@/components/dashboard/PropertyForm";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation"; 
import { useAuth } from "@/hooks/use-auth";
import { addDoc, collection, serverTimestamp, query, where, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useState, useEffect } from "react";
import { uploadImages as uploadImagesToServerAction } from "@/actions/uploadActions";
import { plans } from "@/config/plans";
import type { Plan, Property } from "@/types";
import { Loader2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NewPropertyPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingLimits, setIsLoadingLimits] = useState(true);
  const [canAddProperty, setCanAddProperty] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login?redirect=/dashboard/properties/new");
      return;
    }

    const checkLimits = async () => {
      setIsLoadingLimits(true);
      const userPlanId = user.planId || 'free';
      const planDetails = plans.find(p => p.id === userPlanId);
      setCurrentPlan(planDetails || null);

      if (!planDetails) {
        setCanAddProperty(false); // Default to no if plan not found
        setIsLoadingLimits(false);
        return;
      }

      if (planDetails.maxListings === Infinity) {
        setCanAddProperty(true);
        setIsLoadingLimits(false);
        return;
      }

      try {
        const propertiesRef = collection(db, "properties");
        const q = query(propertiesRef, where("userId", "==", user.uid), where("status", "in", ["active", "pending"]));
        const snapshot = await getCountFromServer(q);
        const currentPropertyCount = snapshot.data().count;
        
        if (currentPropertyCount < planDetails.maxListings) {
          setCanAddProperty(true);
        } else {
          setCanAddProperty(false);
        }
      } catch (error) {
        console.error("Error fetching property count:", error);
        toast({ title: "خطأ", description: "لم نتمكن من التحقق من حدود النشر.", variant: "destructive" });
        setCanAddProperty(false); // Fail safe
      } finally {
        setIsLoadingLimits(false);
      }
    };

    checkLimits();
  }, [user, authLoading, router, toast]);

  const handleSubmit = async (data: PropertyFormValues, mainImageFile: File | null, additionalImageFiles: File[]) => {
    if (!user) {
      toast({ title: "خطأ", description: "يجب تسجيل الدخول لإضافة عقار.", variant: "destructive" });
      router.push("/login");
      return;
    }
    if (!canAddProperty && currentPlan?.maxListings !== Infinity) {
         toast({ title: "تم الوصول للحد الأقصى", description: `لقد وصلت إلى الحد الأقصى لعدد العقارات المسموح به في خطة "${currentPlan?.name}". يرجى ترقية خطتك.`, variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    try {
      let imageUrls: string[] = [];
      const allImageFiles: File[] = [];

      if (mainImageFile) {
        allImageFiles.push(mainImageFile);
      }
      if (additionalImageFiles.length > 0) {
        allImageFiles.push(...additionalImageFiles);
      }
      
      const totalImagesToUpload = allImageFiles.length;
      if (currentPlan && totalImagesToUpload > currentPlan.imageLimitPerProperty) {
         toast({ title: "تم تجاوز حد الصور", description: `تسمح خطتك "${currentPlan.name}" بتحميل ${currentPlan.imageLimitPerProperty} صور كحد أقصى لكل عقار. لديك ${totalImagesToUpload} صور.`, variant: "destructive" });
         setIsSubmitting(false);
         return;
      }


      if (allImageFiles.length > 0) {
        imageUrls = await uploadImagesToServerAction(allImageFiles);
        if (imageUrls.length === 0 && allImageFiles.length > 0) {
          throw new Error("Image upload failed to return URLs.");
        }
      }
      
      const propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'> = {
        ...data,
        userId: user.uid,
        phoneNumber: data.phoneNumber || undefined, // Add phone number
        imageUrls,
        status: "active", 
        deletionReason: "",
        firebaseStudioTestField: "Hello from Firebase Studio! This is a test field.", 
      };
      
      const propertyDataWithTimestamps = {
        ...propertyData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      await addDoc(collection(db, "properties"), propertyDataWithTimestamps);
      
      toast({
        title: "تم إضافة العقار بنجاح!",
        description: `تم نشر عقارك "${data.title}".`,
      });
      router.push(`/dashboard/properties`); 
    } catch (error: any) {
      console.error("Error creating property:", error);
      toast({
        title: "خطأ في إضافة العقار",
        description: error.message || "حدث خطأ أثناء محاولة حفظ العقار. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoadingLimits) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-20rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">جاري تحميل البيانات والتحقق من الصلاحيات...</p>
      </div>
    );
  }

  if (!canAddProperty && currentPlan) {
    return (
      <Card className="text-center py-12 shadow-md">
        <CardHeader>
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <CardTitle className="mt-4 text-destructive">تم الوصول للحد الأقصى للعقارات</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            لقد وصلت إلى الحد الأقصى لعدد العقارات ({currentPlan.maxListings}) المسموح به في خطتك الحالية ({currentPlan.name}).
            <br />
            لإضافة المزيد من العقارات، يرجى ترقية خطتك.
          </CardDescription>
        </CardContent>
        <CardFooter className="justify-center">
          <Button asChild className="transition-smooth hover:shadow-md">
            <Link href="/pricing">عرض خطط الأسعار والترقية</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  if (!currentPlan) { 
      return (
        <div className="text-center py-10">
            <p>حدث خطأ في تحميل تفاصيل خطتك. يرجى المحاولة مرة أخرى.</p>
        </div>
      )
  }


  return (
    <div>
      <PropertyForm 
        onSubmit={handleSubmit} 
        isLoading={isSubmitting} 
        initialData={{filters: currentPlan.aiAssistantAccess ? {water:false, electricity:false, internet:false, gas:false, contract:false} : undefined} as Partial<Property>} 
      />
    </div>
  );
}
