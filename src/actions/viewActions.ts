
'use server';

import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

/**
 * Increments the view count for a specific property.
 * This action is designed to be called from the client-side when a property is viewed.
 * @param propertyId The ID of the property to increment the view count for.
 */
export async function incrementPropertyView(propertyId: string): Promise<{ success: boolean; error?: string }> {
  if (!propertyId) {
    console.error("incrementPropertyView Error: propertyId is required.");
    return { success: false, error: "معرف العقار مطلوب." };
  }

  try {
    const propRef = doc(db, "properties", propertyId);
    // Use the `increment` function to atomically increase the viewCount.
    // This also initializes the field to 1 if it doesn't exist.
    await updateDoc(propRef, {
      viewCount: increment(1)
    });
    return { success: true };
  } catch (error) {
    console.error(`Error incrementing view count for property ${propertyId}:`, error);
    // In a production app, you might want to log this to a monitoring service.
    return { success: false, error: "فشل تحديث عدد المشاهدات." };
  }
}
