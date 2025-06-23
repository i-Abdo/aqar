import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تصفح العقارات - عقاري',
  description: 'ابحث عن شقق، بيوت، وأراض للبيع أو الإيجار في جميع أنحاء الجزائر. استخدم فلاتر البحث المتقدمة لإيجاد عقارك المثالي.',
};

export default function PropertiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
