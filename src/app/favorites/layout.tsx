
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'المفضلة - عقاري',
  description: 'عرض قائمة العقارات التي قمت بحفظها للمشاهدة لاحقًا.',
};

export default function FavoritesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
