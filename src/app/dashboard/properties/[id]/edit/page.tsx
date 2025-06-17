
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

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
            // router.push("/dashboard/properties"); // Keep them on the page to see error message
          } else {
            // Convert Timestamps to Dates
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

    // Set current plan for image limits etc.
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
      return;
    }

    setIsSubmitting(true);

    try {
      let finalImageUrls: string[] = [];
      const newlyUploadedUrls: string[] = [];
      const filesToUploadActually: File[] = [];

      if (mainImageFile) { // A new main image was selected
        filesToUploadActually.push(mainImageFile);
      }
      filesToUploadActually.push(...additionalImageFiles); // All newly selected additional images

      // Check overall image count against plan limits
      let prospectiveTotalImages = 0;
      if (mainImageFile) prospectiveTotalImages++;
      else if (currentMainImagePreviewFromState) prospectiveTotalImages++;
      
      currentAdditionalImagePreviewsFromState.forEach(preview => {
          if (!preview.startsWith('blob:')) prospectiveTotalImages++; // Count existing image
      });
      prospectiveTotalImages += additionalImageFiles.length; // Add count of new additional files

      // This is a bit off, we need to count distinct images that will be saved
      let countFinalImages = 0;
      if (mainImageFile) countFinalImages = 1;
      else if (currentMainImagePreviewFromState && initialPropertyData.imageUrls.includes(currentMainImagePreviewFromState)) countFinalImages = 1;
      
      const keptAdditional = currentAdditionalImagePreviewsFromState.filter(p => !p.startsWith('blob:') && initialPropertyData.imageUrls.includes(p));
      countFinalImages += keptAdditional.length + additionalImageFiles.length;


      if (countFinalImages > currentPlan.imageLimitPerProperty) {
        toast({
          title: "تجاوز حد الصور",
          description: `خطتك (${currentPlan.name}) تسمح بـ ${currentPlan.imageLimitPerProperty} صور كحد أقصى. لديك حاليًا ${countFinalImages} صور محددة.`,
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }


      if (filesToUploadActually.length > 0) {
        const uploaded = await uploadImagesToServerAction(filesToUploadActually);
        newlyUploadedUrls.push(...uploaded);
      }

      let uploadedUrlTracker = 0;

      // Determine final main image URL
      if (mainImageFile) { // New main image uploaded
        if (newlyUploadedUrls[uploadedUrlTracker]) {
          finalImageUrls.push(newlyUploadedUrls[uploadedUrlTracker]);
          uploadedUrlTracker++;
        }
      } else if (currentMainImagePreviewFromState && initialPropertyData.imageUrls.includes(currentMainImagePreviewFromState)) {
        // Existing main image was kept
        finalImageUrls.push(currentMainImagePreviewFromState);
      }
      // If main image was removed, finalImageUrls[0] will be undefined or an additional image if it exists

      // Add existing additional images that were kept
      currentAdditionalImagePreviewsFromState.forEach(previewUrl => {
        if (!previewUrl.startsWith('blob:') && initialPropertyData.imageUrls.includes(previewUrl)) {
            // Ensure it's not the main image if main image was also an existing one
            if (finalImageUrls.length > 0 && finalImageUrls[0] === previewUrl && !mainImageFile && currentMainImagePreviewFromState === previewUrl) {
                // This was the main image, already added.
            } else {
                 finalImageUrls.push(previewUrl);
            }
        }
      });
      
      // Add newly uploaded additional images
      finalImageUrls.push(...newlyUploadedUrls.slice(uploadedUrlTracker));
      
      // Deduplicate and ensure main image is first if it exists
      const uniqueUrls = [...new Set(finalImageUrls.filter(url => url))];
      finalImageUrls = [];
      if (mainImageFile && newlyUploadedUrls[0]) { // If new main image was uploaded, ensure it's first
          finalImageUrls.push(newlyUploadedUrls[0]);
      } else if (currentMainImagePreviewFromState && initialPropertyData.imageUrls[0] === currentMainImagePreviewFromState) {
          finalImageUrls.push(currentMainImagePreviewFromState);
      }
      uniqueUrls.forEach(url => {
          if (!finalImageUrls.includes(url)) {
              finalImageUrls.push(url);
          }
      });


      const propertyUpdateData = {
        ...formData,
        imageUrls: finalImageUrls,
        updatedAt: serverTimestamp(),
        userId: user.uid, // Ensure userId is part of the update
      };

      const propRef = doc(db, "properties", id as string);
      await updateDoc(propRef, propertyUpdateData);

      toast({ title: "تم تحديث العقار بنجاح!", description: `تم حفظ التعديلات على "${formData.title}".` });
      router.push("/dashboard/properties");
    } catch (error: any) {
      console.error("Error updating property:", error);
      toast({
        title: "خطأ في تحديث العقار",
        description: error.message || "حدث خطأ أثناء محاولة حفظ التعديلات. يرجى المحاولة مرة أخرى.",
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
      <Card className="text-center py-12 shadow-md">
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
    <div>
      <PropertyForm 
        onSubmit={handleSubmit} 
        initialData={initialPropertyData} 
        isLoading={isSubmitting}
        isEditMode={true}
      />
    </div>
  );
}
