// This page can be merged with settings or kept separate
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Metadata } from "next";

// export const metadata: Metadata = { // Cannot be used in client component
//   title: "الملف الشخصي - DarDz",
//   description: "عرض وتعديل ملفك الشخصي.",
// };

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">الملف الشخصي</h1>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>معلومات المستخدم</CardTitle>
          <CardDescription>
            هذه هي معلومات ملفك الشخصي العامة. (سيتم تنفيذ هذه الميزة لاحقًا)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">سيتم هنا عرض معلومات المستخدم الحالية مع خيار التعديل.</p>
          {/* Example:
          <div><strong>الاسم:</strong> [اسم المستخدم]</div>
          <div><strong>البريد الإلكتروني:</strong> [بريد المستخدم]</div>
          <div><strong>الخطة الحالية:</strong> [خطة المستخدم]</div>
          */}
        </CardContent>
      </Card>
    </div>
  );
}
