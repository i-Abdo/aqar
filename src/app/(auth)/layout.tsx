
import { AppLogo } from "@/components/layout/AppLogo";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s - عقاري',
    default: 'المصادقة - عقاري',
  },
  description: 'تسجيل الدخول أو إنشاء حساب جديد للوصول إلى لوحة التحكم الخاصة بك في عقاري.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-8 right-8 rtl:right-auto rtl:left-8">
        <AppLogo />
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
