import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الأسعار والخطط - عقاري',
  description: 'اختر الخطة التي تناسب احتياجاتك من بين خططنا المرنة. ابدأ بالخطة المجانية أو قم بالترقية لميزات أكثر.',
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
