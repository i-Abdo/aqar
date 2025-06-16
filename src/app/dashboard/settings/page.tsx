import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Metadata } from "next";

// export const metadata: Metadata = { // Cannot be used in client component
//   title: "الإعدادات - DarDz",
//   description: "إدارة إعدادات حسابك وتفضيلاتك.",
// };

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">إعدادات الحساب</h1>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>ملف التعريف</CardTitle>
          <CardDescription>
            تحديث معلومات ملفك الشخصي. (سيتم تنفيذ هذه الميزة لاحقًا)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">سيتم هنا عرض نموذج لتعديل اسم المستخدم، الصورة الشخصية، إلخ.</p>
        </CardContent>
      </Card>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>إعدادات الإشعارات</CardTitle>
          <CardDescription>
            إدارة تفضيلات الإشعارات الخاصة بك. (سيتم تنفيذ هذه الميزة لاحقًا)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">سيتم هنا عرض خيارات لتفعيل/إلغاء تفعيل أنواع مختلفة من الإشعارات.</p>
        </CardContent>
      </Card>
       <Card className="shadow-md">
        <CardHeader>
          <CardTitle>الأمان</CardTitle>
          <CardDescription>
            تغيير كلمة المرور وإدارة جلسات الدخول. (سيتم تنفيذ هذه الميزة لاحقًا)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">سيتم هنا عرض خيارات لتغيير كلمة المرور.</p>
        </CardContent>
      </Card>
    </div>
  );
}
