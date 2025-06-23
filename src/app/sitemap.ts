
import { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['', '/pricing', '/properties', '/terms', '/privacy', '/login', '/signup'].map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // In a real app, you would also fetch dynamic routes (e.g., properties)
  // const properties = await fetchPropertiesFromDB();
  // const propertyRoutes = properties.map(prop => ({...}));
  
  return [
    ...staticRoutes,
  ];
}
