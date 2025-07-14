"use client";

import PropertyDetailClient from '@/components/properties/PropertyDetailClient';

// This page is now a simple wrapper that renders the client component.
// The client component will handle its own data fetching.
export default function PropertyDetailPage() {
  return <PropertyDetailClient />;
}
