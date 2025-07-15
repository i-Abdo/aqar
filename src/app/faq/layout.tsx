
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'المساعدة والأسئلة الشائعة - عقاري',
  description: 'ابحث عن إجابات لأسئلتك الشائعة حول استخدام منصة عقاري، سواء كنت بائعًا، مشتريًا، أو زائرًا.',
  keywords: ["أسئلة شائعة", "مساعدة", "دعم فني", "كيفية استخدام", "عقاري", "بيع", "شراء", "كراء"],
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
