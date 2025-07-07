
"use client";

import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation"; 
import { useAuth } from "@/hooks/use-auth";
import { addDoc, collection, serverTimestamp, query, where, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useState, useEffect, useMemo } from "react";
import { uploadImages as uploadImagesToServerAction } from "@/actions/uploadActions";
import { plans } from "@/config/plans";
import type { Plan, Property, PropertyFormValues } from "@/types";
import { Loader2, AlertTriangle, ShieldX, MessageSquareWarning } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import dynamic from 'next/dynamic';
import * as Sentry from "@sentry/nextjs";

const ContactAdminDialog = dynamic(() =>
  import('@/components/dashboard/ContactAdminDialog').then((mod) => mod.ContactAdminDialog)
);

const PropertyForm = dynamic(() => 
  import('@/components/dashboard/PropertyForm').then((mod) => mod.PropertyForm),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">جاري تحميل النموذج...</p>
      </div>
    )
  }
);


export default function NewPropertyPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading: authLoading, trustLevel } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingLimits, setIsLoadingLimits] = useState(true);
  const [canAddProperty, setCanAddProperty] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [isContactAdminDialogOpen, setIsContactAdminDialogOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login?redirect=/dashboard/properties/new");
      return;
    }

    if (trustLevel === 'blacklisted') {
      setIsLoadingLimits(false);
      setCanAddProperty(false); // Explicitly set for blacklisted
      return;
    }

    const checkLimits = async () => {
      setIsLoadingLimits(true);
      const userPlanId = user.planId || 'free';
      const planDetails = plans.find(p => p.id === userPlanId);
      setCurrentPlan(planDetails || null);

      if (!planDetails) {
        setCanAddProperty(false);
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
        setCanAddProperty(false);
      } finally {
        setIsLoadingLimits(false);
      }
    };

    checkLimits();
  }, [user, authLoading, router, toast, trustLevel]);

  const handleSubmit = async (data: PropertyFormValues, mainImageFile: File | null, additionalImageFiles: File[]) => {
    if (!user) {
      toast({ title: "خطأ", description: "يجب تسجيل الدخول لإضافة عقار.", variant: "destructive" });
      router.push("/login");
      return;
    }
     if (!currentPlan) {
      toast({ title: "خطأ", description: "لم يتم تحميل تفاصيل خطتك. لا يمكن الحفظ.", variant: "destructive" });
      return;
    }
    if (trustLevel === 'blacklisted') {
        toast({ title: "محظور", description: "حسابك محظور من إضافة عقارات جديدة. يرجى الاتصال بالإدارة.", variant: "destructive" });
        return;
    }
    if (!canAddProperty && currentPlan.maxListings !== Infinity) {
         toast({ title: "تم الوصول للحد الأقصى", description: `لقد وصلت إلى الحد الأقصى لعدد العقارات المسموح به في خطة "${currentPlan.name}". يرجى ترقية خطتك.`, variant: "destructive" });
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
        const uploadResult = await uploadImagesToServerAction(allImageFiles);
        if (!uploadResult.success || !uploadResult.urls) {
          throw new Error(uploadResult.error || "Image upload failed to return URLs.");
        }
        imageUrls = uploadResult.urls;
      }
      
      const propertyStatus = trustLevel === 'untrusted' ? "pending" : "active";

      const propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'> = {
        ...data,
        userId: user.uid,
        phoneNumber: data.phoneNumber, 
        imageUrls,
        status: propertyStatus, 
        deletionReason: "",
      };
      
      const propertyDataWithTimestamps = {
        ...propertyData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      await addDoc(collection(db, "properties"), propertyDataWithTimestamps);
      
      toast({
        title: "تم إضافة العقار بنجاح!",
        description: propertyStatus === 'pending' ? `تم إرسال عقارك "${data.title}" للمراجعة.` : `تم نشر عقارك "${data.title}".`,
      });
      router.push(`/dashboard/properties`); 
    } catch (error: any) {
      console.error("Error creating property:", error);
      Sentry.captureException(error, {
        extra: { propertyTitle: data.title, userId: user.uid }
      });
      toast({
        title: "خطأ في إضافة العقار",
        description: error.message || "حدث خطأ أثناء محاولة حفظ العقار. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const initialData = useMemo(() => ({
    filters: { water: false, electricity: false, internet: false, gas: false, contract: false },
  }), []);

  if (authLoading || isLoadingLimits) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-20rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">جاري تحميل البيانات والتحقق من الصلاحيات...</p>
      </div>
    );
  }

  if (trustLevel === 'blacklisted') {
    return (
      <>
        <Card className="text-center py-12 shadow-md max-w-lg mx-auto">
          <CardHeader>
            <ShieldX className="mx-auto h-16 w-16 text-destructive" />
            <CardTitle className="mt-4 text-2xl text-destructive">حساب محظور</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-lg">
              عذرًا، لا يمكنك إضافة عقارات جديدة حاليًا. لقد تم تقييد حسابك بسبب انتهاكات سابقة.
              <br />
              إذا كنت تعتقد أن هذا خطأ، يرجى الاتصال بالإدارة.
            </CardDescription>
          </CardContent>
          <CardFooter className="justify-center">
            <Button onClick={() => setIsContactAdminDialogOpen(true)} variant="outline_destructive" className="transition-smooth hover:shadow-md">
              <MessageSquareWarning size={20} className="ml-2 rtl:mr-2 rtl:ml-0"/>
              الاتصال بالإدارة
            </Button>
          </CardFooter>
        </Card>
        {user && <ContactAdminDialog 
            isOpen={isContactAdminDialogOpen} 
            onOpenChange={setIsContactAdminDialogOpen} 
            userId={user.uid} 
            userEmail={user.email || "غير متوفر"} 
        />}
      </>
    );
  }


  if (!canAddProperty && currentPlan && trustLevel !== 'blacklisted') {
    return (
      <Card className="text-center py-12 shadow-md max-w-lg mx-auto">
        <CardHeader>
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <CardTitle className="mt-4 text-destructive">تم الوصول للحد الأقصى للعقارات</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-lg">
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
  
  if (!currentPlan && trustLevel !== 'blacklisted') { 
      return (
        <div className="text-center py-10">
            <p>حدث خطأ في تحميل تفاصيل خطتك. يرجى المحاولة مرة أخرى.</p>
        </div>
      )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">
          إضافة عقار جديد
        </h1>
        <p className="text-muted-foreground mt-1">
          املأ التفاصيل أدناه لنشر عقارك. الحقول المميزة بـ * إلزامية.
        </p>
      </div>
      <PropertyForm 
        onSubmit={handleSubmit} 
        isLoading={isSubmitting} 
        initialData={initialData}
        isEditMode={false}
      />
    </div>
  );
}
