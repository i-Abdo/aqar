
import { Metadata } from 'next';
import { db as adminDb, isFirebaseAdminAppInitialized } from '@/lib/firebase/admin';
import type { Property } from '@/types';
import PropertyDetailClient from '@/components/properties/PropertyDetailClient';
import { notFound } from 'next/navigation';
import { getAuth } from 'firebase-admin/auth';
import { app as adminApp } from '@/lib/firebase/admin';

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;
  if (!isFirebaseAdminAppInitialized) {
    return {
      title: 'عقار - عقاري',
      description: 'تفاصيل العقار.',
    };
  }
  try {
    const propRef = adminDb.collection("properties").doc(id);
    const docSnap = await propRef.get();

    if (!docSnap.exists) {
      return {
        title: 'عقار غير موجود - عقاري',
        description: 'لم نتمكن من العثور على العقار الذي تبحث عنه. قد يكون تم حذفه أو أن الرابط غير صحيح.',
      };
    }

    const property = docSnap.data() as Property;
    
    const description = `${property.transactionType === 'sale' ? 'للبيع' : 'للكراء'}: ${property.title} في ${property.city}, ${property.wilaya}. ${property.description.substring(0, 120)}...`;

    return {
      title: `${property.title} - عقاري`,
      description: description,
      openGraph: {
        title: `${property.title} - عقاري`,
        description: description,
        images: property.imageUrls && property.imageUrls.length > 0 ? [property.imageUrls[0]] : [],
        url: `/properties/${id}`,
        type: 'article',
      },
    };
  } catch (error) {
    console.error('Error generating metadata for property:', error);
    return {
      title: 'خطأ - عقاري',
      description: 'حدث خطأ أثناء تحميل بيانات العقار.',
    };
  }
}

// Helper function to fetch property data from Firestore on the server
async function getProperty(id: string) {
    if (!isFirebaseAdminAppInitialized) {
        console.warn("Admin SDK not initialized. Cannot fetch property details on the server.");
        return null;
    }
    try {
        const propRef = adminDb.collection("properties").doc(id);
        const docSnap = await propRef.get();

        if (!docSnap.exists) {
            return null;
        }

        const data = docSnap.data();
        if (!data) return null;

        // Convert Firestore Timestamps to ISO strings for serialization
        const propertyData = {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt.toDate().toISOString(),
            updatedAt: data.updatedAt.toDate().toISOString(),
        };

        return propertyData;
    } catch (error) {
        console.error("Error fetching property on server:", error);
        return null; // Return null on error to be handled by the page component
    }
}


export default async function PropertyDetailPage({ params }: Props) {
  const propertyData = await getProperty(params.id);

  if (!propertyData) {
    // If admin SDK fails, client can still try to fetch.
    // We pass null and let the client component handle the fetching logic.
    return <PropertyDetailClient initialProperty={null} propertyId={params.id} />;
  }

  return <PropertyDetailClient initialProperty={propertyData} propertyId={params.id} />;
}
