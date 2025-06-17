
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserCog, Palette, ShieldCheck, BellDot, Trash2 } from "lucide-react";

// Metadata cannot be used in client component, ensure it's removed or handled at layout level if needed.

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-headline">الإعدادات</h1>

      <Card className="shadow-lg hover:shadow-xl transition-smooth">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="text-primary" />
            <span>تفضيلات الحساب</span>
          </CardTitle>
          <CardDescription>
            إدارة معلومات حسابك الأساسية وتفضيلات الإشعارات.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">إدارة الملف الشخصي وكلمة المرور</h3>
            <p className="text-muted-foreground mb-3">
              لتحديث اسم العرض الخاص بك أو تغيير كلمة المرور، يرجى الانتقال إلى صفحة ملفك الشخصي.
            </p>
            <Button asChild variant="outline_primary">
              <Link href="/dashboard/profile">الانتقال إلى الملف الشخصي</Link>
            </Button>
          </div>
          <hr />
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <BellDot />
                إعدادات الإشعارات
            </h3>
            <p className="text-muted-foreground">
              (سيتم تنفيذ هذه الميزة لاحقًا) تحكم في أنواع الإشعارات التي تتلقاها عبر البريد الإلكتروني أو داخل التطبيق.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg hover:shadow-xl transition-smooth">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="text-primary" />
            <span>المظهر</span>
          </CardTitle>
          <CardDescription>
            تخصيص مظهر التطبيق ليناسب تفضيلاتك.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            (سيتم تنفيذ هذه الميزة لاحقًا) اختر بين الوضع الفاتح والداكن، أو إعدادات السمات الأخرى.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-lg hover:shadow-xl transition-smooth">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="text-primary" />
            <span>الأمان وإدارة الحساب</span>
          </CardTitle>
          <CardDescription>
            إدارة خيارات الأمان المتقدمة وحذف الحساب.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div>
            <h3 className="text-lg font-semibold mb-2">إعدادات الأمان المتقدمة</h3>
            <p className="text-muted-foreground">
              (سيتم تنفيذ هذه الميزة لاحقًا) قم بتمكين المصادقة الثنائية (2FA)، عرض سجلات النشاط، وإدارة الجلسات النشطة.
            </p>
          </div>
          <hr />
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-destructive">
                <Trash2 />
                حذف الحساب
            </h3>
            <p className="text-muted-foreground mb-3">
              (سيتم تنفيذ هذه الميزة لاحقًا) إذا كنت ترغب في حذف حسابك بشكل دائم، يمكنك القيام بذلك من هنا. يرجى ملاحظة أن هذا الإجراء لا يمكن التراجع عنه.
            </p>
            {/* <Button variant="destructive" disabled> (Placeholder for future button)
              طلب حذف الحساب
            </Button> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
