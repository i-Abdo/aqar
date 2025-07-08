
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserCog, Palette, ShieldCheck, BellDot, Trash2, Sun, Moon, Computer, Server, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/hooks/use-theme";
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { ThemeSetting } from "@/hooks/use-theme";
import { checkArchiveConnection } from "@/actions/debugActions";
import { useToast } from "@/hooks/use-toast";

interface CheckResult {
  success: boolean;
  message: string;
  details?: string;
}

export default function SettingsPage() {
  const { themeSetting, setThemeSetting, effectiveTheme } = useTheme();
  const [isClient, setIsClient] = React.useState(false);
  const [isChecking, setIsChecking] = React.useState(false);
  const [checkResult, setCheckResult] = React.useState<CheckResult | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCheckConnection = async () => {
    setIsChecking(true);
    setCheckResult(null);
    try {
      const result = await checkArchiveConnection();
      setCheckResult(result);
      if (!result.success) {
        toast({
          title: "فشل فحص الخادم",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ غير متوقع",
        description: "حدث خطأ أثناء محاولة فحص إعدادات الخادم.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };


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
          {isClient ? (
            <div className="space-y-4">
              <RadioGroup
                dir="rtl"
                value={themeSetting}
                onValueChange={(value: string) => setThemeSetting(value as ThemeSetting)}
                className="flex flex-row flex-wrap gap-4"
              >
                <Label
                  htmlFor="theme-light"
                  className="flex flex-1 items-center justify-between gap-3 p-3 rounded-md border hover:bg-accent/50 transition-colors cursor-pointer min-w-[150px]"
                >
                  <span className="flex items-center gap-2 text-sm">
                    <Sun size={16} />
                    الوضع الفاتح
                  </span>
                  <RadioGroupItem value="light" id="theme-light" />
                </Label>

                <Label
                  htmlFor="theme-dark"
                  className="flex flex-1 items-center justify-between gap-3 p-3 rounded-md border hover:bg-accent/50 transition-colors cursor-pointer min-w-[150px]"
                >
                  <span className="flex items-center gap-2 text-sm">
                    <Moon size={16} />
                    الوضع الداكن
                  </span>
                  <RadioGroupItem value="dark" id="theme-dark" />
                </Label>

                <Label
                  htmlFor="theme-system"
                  className="flex flex-1 items-center justify-between gap-3 p-3 rounded-md border hover:bg-accent/50 transition-colors cursor-pointer min-w-[180px]"
                >
                  <span className="flex items-center gap-2 text-sm">
                    <Computer size={16} />
                    حسب إعدادات الجهاز
                  </span>
                  <RadioGroupItem value="system" id="theme-system" />
                </Label>
              </RadioGroup>
              <p className="text-xs text-muted-foreground mt-2">
                المظهر المطبق حالياً: {effectiveTheme === 'dark' ? "داكن" : "فاتح"}.
                <br />
                عند اختيار "حسب إعدادات الجهاز"، سيتبع التطبيق تفضيلات نظام التشغيل الخاص بك.
              </p>
            </div>
          ) : (
            <div className="flex flex-row flex-wrap gap-4">
              {[1,2,3].map(i => (
                 <div key={i} className="h-12 w-32 rounded-md border animate-pulse bg-muted/50"></div>
              ))}
               <div className="h-10 w-3/4 rounded animate-pulse bg-muted/50 mt-2 basis-full"></div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="shadow-lg hover:shadow-xl transition-smooth">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="text-primary" />
            <span>تشخيص إعدادات الخادم</span>
          </CardTitle>
          <CardDescription>
            استخدم هذه الأدوات للتحقق من صحة اتصال الخادم بالخدمات الخارجية.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">فحص خدمة رفع الفيديو (Archive.org)</h3>
            <p className="text-muted-foreground mb-3">
              اضغط على الزر أدناه للتحقق مما إذا كان الخادم قادرًا على الاتصال بخدمة الأرشفة باستخدام متغيرات البيئة التي قدمتها.
            </p>
            <Button onClick={handleCheckConnection} disabled={isChecking}>
              {isChecking && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              فحص الاتصال بخدمة الأرشفة
            </Button>
          </div>
          {checkResult && (
            <div className={`p-4 rounded-md border ${checkResult.success ? 'bg-green-500/10 border-green-500/30' : 'bg-destructive/10 border-destructive/30'}`}>
              <div className="flex items-start gap-3">
                {checkResult.success ? <CheckCircle className="text-green-500 mt-1" /> : <AlertTriangle className="text-destructive mt-1" />}
                <div className="flex-1">
                  <p className={`font-bold ${checkResult.success ? 'text-green-700' : 'text-destructive'}`}>
                    {checkResult.message}
                  </p>
                  {checkResult.details && <p className="text-xs mt-1 text-muted-foreground">{checkResult.details}</p>}
                </div>
              </div>
            </div>
          )}
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
