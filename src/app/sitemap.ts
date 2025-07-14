
import { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'
import { isFirebaseAdminAppInitialized, db as adminDb } from '@/lib/firebase/admin';
import type { Property } from '@/types';

const wilayas = [
  "أدرار", "الشلف", "الأغواط", "أم البواقي", "باتنة", "بجاية", "بسكرة", "بشار",
  "البليدة", "البويرة", "تمنراست", "تبسة", "تلمسان", "تيارت", "تيزي وزو", "الجزائر",
  "الجلفة", "جيجل", "سطيف", "سعيدة", "سكيكدة", "سيدي بلعباس", "عنابة", "قالمة",
  "قسنطينة", "المدية", "مستغانم", "المسيلة", "معسكر", "ورقلة", "وهران", "البيض",
  "إليزي", "برج بوعريريج", "بومرداس", "الطارف", "تندوف", "تيسمسيلت", "الوادي", "خنشلة",
  "سوق أهراس", "تيبازة", "ميلة", "عين الدفلى", "النعامة", "عين تموشنت", "غرداية", "غليزان"
];


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes from siteConfig
  const staticRoutes = ['', '/pricing', '/properties', '/terms', '/privacy', '/login', '/signup', '/tips', '/services'].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Wilaya pages
  const wilayaRoutes = wilayas.map(wilaya => ({
    url: `${siteConfig.url}/properties/wilaya/${encodeURIComponent(wilaya)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
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
      console.warn("Could not fetch properties for sitemap. This might be due to missing credentials in the build environment. Sitemap will be generated with static routes only.", error);
    }
  } else {
    console.warn("Firebase Admin SDK not initialized. Dynamic property routes will not be included in the sitemap.");
  }
  
  return [
    ...staticRoutes,
    ...wilayaRoutes,
    ...propertyRoutes,
  ];
}
