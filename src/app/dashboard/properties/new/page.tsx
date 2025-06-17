
"use client";

import { PropertyForm, PropertyFormValues } from "@/components/dashboard/PropertyForm";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation"; 
import { useAuth } from "@/hooks/use-auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useState } from "react";
import { uploadImages as uploadImagesToServerAction } from "@/actions/uploadActions";


export default function NewPropertyPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: PropertyFormValues, mainImageFile: File | null, additionalImageFiles: File[]) => {
    if (!user) {
      toast({ title: "خطأ", description: "يجب تسجيل الدخول لإضافة عقار.", variant: "destructive" });
      router.push("/login");
      return;
    }

    setIsLoading(true);
    try {
      let imageUrls: string[] = [];
      const allImageFiles: File[] = [];

      if (mainImageFile) {
        allImageFiles.push(mainImageFile);
      }
      if (additionalImageFiles.length > 0) {
        allImageFiles.push(...additionalImageFiles);
      }

      if (allImageFiles.length > 0) {
        imageUrls = await uploadImagesToServerAction(allImageFiles);
        if (imageUrls.length === 0 && allImageFiles.length > 0) {
          throw new Error("Image upload failed to return URLs.");
        }
      }
      
      const propertyData = {
        ...data,
        userId: user.uid,
        imageUrls, // Main image will be imageUrls[0] if present
        status: "active", 
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        deletionReason: "",
      };

      const docRef = await addDoc(collection(db, "properties"), propertyData);
      
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
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PropertyForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
