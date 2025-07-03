import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إدارة الاشتراك - عقاري',
  description: 'عرض تفاصيل خطتك الحالية وترقيتها للوصول إلى ميزات أقوى.',
};

export default function SubscriptionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
