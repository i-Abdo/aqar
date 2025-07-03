
"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { PropertyForm, PropertyFormValues } from "@/components/dashboard/PropertyForm";
import { uploadImages as uploadImagesToServerAction } from "@/actions/uploadActions";
import type { Property, Plan } from "@/types";
import { plans } from "@/config/plans";
import { Loader2, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const id = React.useMemo(() => {
    const rawId = params?.id;
    return Array.isArray(rawId) ? rawId[0] : rawId;
  }, [params?.id]);

  const [initialPropertyData, setInitialPropertyData] = useState<Property | null>(null);
  const [isLoadingProperty, setIsLoadingProperty] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push(`/login?redirect=/dashboard/properties/${id}/edit`);
      return;
    }

    const fetchProperty = async () => {
      if (!id) {
        toast({ title: "خطأ", description: "معرف العقار غير موجود.", variant: "destructive" });
        router.push("/dashboard/properties");
        setIsLoadingProperty(false);
        return;
      }
      setIsLoadingProperty(true);
      try {
        const propRef = doc(db, "properties", id as string);
        const docSnap = await getDoc(propRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.userId !== user.uid) {
            setAuthError("ليس لديك الصلاحية لتعديل هذا العقار.");
            toast({ title: "وصول غير مصرح به", description: "لا يمكنك تعديل هذا العقار.", variant: "destructive" });
          } else {
            const propertyDataWithDates: Property = {
              id: docSnap.id,
              ...data,
              createdAt: (data.createdAt as Timestamp)?.toDate ? (data.createdAt as Timestamp).toDate() : new Date(data.createdAt),
              updatedAt: (data.updatedAt as Timestamp)?.toDate ? (data.updatedAt as Timestamp).toDate() : new Date(data.updatedAt),
            } as Property;
            setInitialPropertyData(propertyDataWithDates);
          }
        } else {
          toast({ title: "خطأ", description: "لم يتم العثور على العقار.", variant: "destructive" });
          router.push("/dashboard/properties");
        }
      } catch (error) {
        console.error("Error fetching property:", error);
        toast({ title: "خطأ", description: "حدث خطأ أثناء تحميل بيانات العقار.", variant: "destructive" });
      } finally {
        setIsLoadingProperty(false);
      }
    };

    fetchProperty();

    const userPlanId = user.planId || 'free';
    const planDetails = plans.find(p => p.id === userPlanId);
    setCurrentPlan(planDetails || null);

  }, [id, user, authLoading, router, toast]);

  const handleSubmit = async (
    formData: PropertyFormValues,
    mainImageFile: File | null, 
    additionalImageFiles: File[], 
    currentMainImagePreviewFromState: string | null, 
    currentAdditionalImagePreviewsFromState: string[] 
  ) => {
    if (!user || !initialPropertyData || authError) {
      toast({ title: "خطأ", description: "لا يمكن حفظ التعديلات.", variant: "destructive" });
      return;
    }
    if (!currentPlan) {
      toast({ title: "خطأ", description: "لم يتم تحميل تفاصيل خطتك. لا يمكن الحفظ.", variant: "destructive" });
      setIsSubmitting(false); 
      return;
    }
     if (!id) {
      toast({ title: "خطأ", description: "معرف العقار مفقود. لا يمكن الحفظ.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);

    try {
      let finalImageUrls: string[] = [];
      const uploadedUrls: string[] = [];

      const filesToUpload: File[] = [];
      if (mainImageFile) { 
        filesToUpload.push(mainImageFile);
      }
      filesToUpload.push(...additionalImageFiles); 

      if (filesToUpload.length > 0) {
        const results = await uploadImagesToServerAction(filesToUpload);
        uploadedUrls.push(...results);
      }

      let mainImageUrlToSave: string | undefined = undefined;
      let uploadedMainImageConsumed = false;

      if (mainImageFile) { 
        if (uploadedUrls.length > 0) {
          mainImageUrlToSave = uploadedUrls[0];
          uploadedMainImageConsumed = true;
        } else if (filesToUpload.length > 0) { 
            throw new Error("فشل رفع الصورة الرئيسية الجديدة.");
        }
      } else if (currentMainImagePreviewFromState && initialPropertyData.imageUrls.includes(currentMainImagePreviewFromState)) {
        mainImageUrlToSave = currentMainImagePreviewFromState;
      }
      

      if (mainImageUrlToSave) {
        finalImageUrls.push(mainImageUrlToSave);
      }
      
      currentAdditionalImagePreviewsFromState.forEach(previewUrl => {
        if (!previewUrl.startsWith('blob:') && initialPropertyData.imageUrls.includes(previewUrl)) {
          if (previewUrl !== mainImageUrlToSave && !finalImageUrls.includes(previewUrl)) {
            finalImageUrls.push(previewUrl);
          }
        }
      });

      const newAdditionalUploadedUrls = uploadedMainImageConsumed ? uploadedUrls.slice(1) : uploadedUrls;
      newAdditionalUploadedUrls.forEach(url => {
        if (!finalImageUrls.includes(url)) {
          finalImageUrls.push(url);
        }
      });

      finalImageUrls = [...new Set(finalImageUrls.filter(url => url))];


      if (finalImageUrls.length > currentPlan.imageLimitPerProperty) {
        toast({
          title: "تجاوز حد الصور",
          description: `خطتك (${currentPlan.name}) تسمح بـ ${currentPlan.imageLimitPerProperty} صور كحد أقصى. لديك حاليًا ${finalImageUrls.length} صور محددة للحفظ.`,
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      const propertyUpdateData: Partial<Property> = {
        ...formData,
        phoneNumber: formData.phoneNumber, 
        imageUrls: finalImageUrls,
        updatedAt: serverTimestamp() as Timestamp,
        googleMapsLocation: formData.googleMapsLocation || null,
      };
      
      delete (propertyUpdateData as any).id; 


      const propRef = doc(db, "properties", id);
      await updateDoc(propRef, propertyUpdateData);

      toast({ title: "تم تحديث العقار بنجاح!", description: `تم حفظ التعديلات على "${formData.title}".` });
      router.push("/dashboard/properties");
    } catch (error: any) {
      console.error("Error updating property:", error);
      let description = "حدث خطأ أثناء محاولة حفظ التعديلات. يرجى المحاولة مرة أخرى.";
      if (error.message) {
          description = error.message;
      }
      toast({
        title: "خطأ في تحديث العقار",
        description: description,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoadingProperty) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-20rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">جاري تحميل بيانات العقار...</p>
      </div>
    );
  }

  if (authError) {
    return (
      <Card className="text-center py-12 shadow-md max-w-lg mx-auto">
        <CardHeader>
          <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
          <CardTitle className="mt-4 text-destructive">وصول غير مصرح به</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            {authError}
          </CardDescription>
        </CardContent>
        <CardFooter className="justify-center">
          <Button asChild className="transition-smooth hover:shadow-md">
            <Link href="/dashboard/properties">العودة إلى عقاراتي</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  if (!initialPropertyData) {
    return (
         <div className="flex items-center justify-center min-h-[calc(100vh-20rem)]">
            <p className="text-muted-foreground">لم يتم العثور على العقار المطلوب.</p>
         </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">
          تعديل العقار
        </h1>
        <p className="text-muted-foreground mt-1">
          املأ التفاصيل أدناه لتعديل عقارك. الحقول المميزة بـ * إلزامية.
        </p>
      </div>
      <PropertyForm 
        onSubmit={handleSubmit} 
        initialData={initialPropertyData} 
        isLoading={isSubmitting}
        isEditMode={true}
      />
    </div>
  );
}
