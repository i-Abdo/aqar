
import { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'
import { isFirebaseAdminAppInitialized, db as adminDb } from '@/lib/firebase/admin';
import type { Property } from '@/types';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes from siteConfig
  const staticRoutes = ['', '/pricing', '/properties', '/terms', '/privacy', '/login', '/signup', '/tips'].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  let propertyRoutes: MetadataRoute.Sitemap = [];

  // Fetch dynamic routes (properties)
  if (isFirebaseAdminAppInitialized) {
    try {
      const propertiesSnapshot = await adminDb.collection("properties").where("status", "==", "active").get();
      const properties = propertiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
      
      propertyRoutes = properties.map(prop => ({
        url: `${siteConfig.url}/properties/${prop.id}`,
        lastModified: prop.updatedAt ? new Date(prop.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      }));
    } catch (error) {
      console.error("Error fetching properties for sitemap:", error);
      // Return only static routes if there's an error
      return staticRoutes;
    }
  } else {
    console.warn("Firebase Admin SDK not initialized. Dynamic property routes will not be included in the sitemap.");
  }
  
  return [
    ...staticRoutes,
    ...propertyRoutes,
  ];
}
