
import { Metadata } from 'next';
import PropertyDetailClient from '@/components/properties/PropertyDetailClient';

type Props = {
  params: { id: string };
};

// Return a generic metadata object to prevent server-side fetching errors.
// This change prioritizes fixing the runtime crash.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: 'تفاصيل العقار - عقاري',
    description: 'عرض التفاصيل الكاملة للعقار المحدد.',
  };
}

// This page now acts as a simple shell that renders the client component.
// All data fetching is deferred to the client to avoid server-side auth issues.
export default function PropertyDetailPage({ params }: Props) {
  return <PropertyDetailClient initialProperty={null} propertyId={params.id} />;
}
