
import { Metadata } from 'next';
import PropertyDetailClient from '@/components/properties/PropertyDetailClient';
import { isFirebaseAdminAppInitialized, db as adminDb } from '@/lib/firebase/admin';
import type { Property, SerializableProperty } from '@/types';
import { siteConfig } from '@/config/site';

type Props = {
  params: { id: string };
};

// This function now runs on the server, using the Admin SDK
async function getProperty(id: string): Promise<Property | null> {
  if (!isFirebaseAdminAppInitialized) {
    console.error("Firebase Admin SDK not initialized. Cannot fetch property for metadata.");
    return null;
  }
  try {
    const propRef = adminDb.collection('properties').doc(id);
    const docSnap = await propRef.get();
    if (docSnap.exists) {
      const data = docSnap.data();
      // Convert Firestore Timestamps to Date objects
      const propertyData: Property = {
        id: docSnap.id,
        ...data,
        createdAt: data?.createdAt.toDate(),
        updatedAt: data?.updatedAt.toDate(),
      } as Property;
      return propertyData;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching property ${id} for metadata:`, error);
    return null;
  }
}


// This function generates dynamic metadata for each property page on the server
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const property = await getProperty(params.id);

  if (!property) {
    return {
      title: 'العقار غير موجود - عقاري',
      description: 'لم نتمكن من العثور على العقار الذي تبحث عنه.',
    };
  }

  const truncatedDescription = property.description && property.description.length > 155
    ? `${property.description.substring(0, 155)}...`
    : property.description || 'لا يوجد وصف متاح.';

  return {
    title: `${property.title} - عقاري`,
    description: truncatedDescription,
    openGraph: {
      title: property.title,
      description: truncatedDescription,
      images: [
        {
          url: property.imageUrls?.[0] || siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: property.title,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: property.title,
      description: truncatedDescription,
      images: [property.imageUrls?.[0] || siteConfig.ogImage],
    },
  };
}

// This page is now a Server Component that fetches data and passes it to the client
export default async function PropertyDetailPage({ params }: Props) {
  const propertyData = await getProperty(params.id);
  
  // We need to serialize the Date objects to strings before passing them to a client component
  const serializableProperty = propertyData ? {
    ...propertyData,
    createdAt: propertyData.createdAt.toISOString(),
    updatedAt: propertyData.updatedAt.toISOString(),
  } as SerializableProperty : null;

  return <PropertyDetailClient initialProperty={serializableProperty} propertyId={params.id} />;
}
