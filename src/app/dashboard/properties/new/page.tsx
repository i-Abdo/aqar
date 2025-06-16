"use client";

import { PropertyForm, PropertyFormValues } from "@/components/dashboard/PropertyForm";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation"; // App Router
import { useAuth } from "@/hooks/use-auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useState } from "react";
// Assume Cloudinary upload function exists or will be implemented
// import { uploadImagesToCloudinary } from "@/lib/cloudinary"; 

// Placeholder for Cloudinary upload
async function uploadImagesToCloudinary(files: File[]): Promise<string[]> {
  // Simulate upload and return placeholder URLs
  if (files.length === 0) return [];
  return files.map((file, index) => `https://placehold.co/600x400.png?text=Property+Image+${index+1}`);
}


export default function NewPropertyPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: PropertyFormValues, imageFiles: File[]) => {
    if (!user) {
      toast({ title: "خطأ", description: "يجب تسجيل الدخول لإضافة عقار.", variant: "destructive" });
      router.push("/login");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Upload images to Cloudinary (or other service)
      // This is a placeholder. In a real app, you'd handle actual uploads.
      const imageUrls = await uploadImagesToCloudinary(imageFiles);
      if (imageFiles.length > 0 && imageUrls.length === 0) {
         throw new Error("Image upload failed");
      }

      // 2. Prepare property data for Firestore
      const propertyData = {
        ...data,
        userId: user.uid,
        imageUrls,
        status: "active", // Or "pending" if admin approval is needed
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // 3. Save property data to Firestore
      const docRef = await addDoc(collection(db, "properties"), propertyData);
      
      toast({
        title: "تم إضافة العقار بنجاح!",
        description: `تم نشر عقارك "${data.title}".`,
      });
      router.push(`/dashboard/properties`); // Or to the property's page: /properties/${docRef.id}
    } catch (error) {
      console.error("Error creating property:", error);
      toast({
        title: "خطأ في إضافة العقار",
        description: "حدث خطأ أثناء محاولة حفظ العقار. يرجى المحاولة مرة أخرى.",
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

// Add metadata if it were a server component
// export const metadata: Metadata = {
//   title: "إضافة عقار جديد - DarDz",
//   description: "أضف عقارًا جديدًا إلى قائمة ممتلكاتك في DarDz.",
// };
