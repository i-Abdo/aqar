import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'نصائح عقارية - عقاري',
  description: 'اكتشف نصائح وإرشادات قيمة لبيع وشراء وتأجير العقارات. تعلم من الخبراء لتحقيق أفضل الصفقات.',
};

export default function TipsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
