import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'دليل عقاري - نصائح ومصطلحات',
  description: 'اكتشف نصائح الخبراء لبيع وشراء وتأجير العقارات، وتعرف على أهم المصطلحات العقارية في الجزائر.',
};

export default function TipsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
