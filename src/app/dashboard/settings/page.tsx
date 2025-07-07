
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserCog, Palette, ShieldCheck, BellDot, Trash2, Sun, Moon, Computer, Server, Loader2, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/hooks/use-theme";
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { ThemeSetting } from "@/hooks/use-theme";
import { getCloudinaryConfigStatus } from "@/actions/debugActions";

interface DebugInfo {
    cloudNameExists: boolean;
    apiKeyExists: boolean;
    apiSecretExists: boolean;
    envNode: string;
}

export default function SettingsPage() {
  const { themeSetting, setThemeSetting, effectiveTheme } = useTheme();
  const [isClient, setIsClient] = React.useState(false);
  const [debugInfo, setDebugInfo] = React.useState<DebugInfo | null>(null);
  const [isDebugging, setIsDebugging] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleDebugClick = async () => {
    setIsDebugging(true);
    setDebugInfo(null);
    try {
        const info = await getCloudinaryConfigStatus();
        setDebugInfo(info);
    } catch (error) {
        console.error("Error fetching debug info:", error);
    } finally {
        setIsDebugging(false);
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
      
       <Card className="shadow-lg hover:shadow-xl transition-smooth border-accent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-accent">
            <Server />
            <span>تشخيص إعدادات الخادم</span>
          </CardTitle>
          <CardDescription>
            استخدم هذا الزر للتحقق مما إذا كان خادم Vercel يمكنه قراءة متغيرات البيئة الخاصة بـ Cloudinary بشكل صحيح.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Button onClick={handleDebugClick} disabled={isDebugging}>
              {isDebugging ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Server className="ml-2 h-4 w-4" />}
              {isDebugging ? "جاري الفحص..." : "فحص إعدادات الرفع"}
            </Button>
            {debugInfo && (
                <div className="p-4 bg-muted rounded-md text-sm font-mono space-y-2">
                    <h4 className="font-bold text-base mb-2">نتيجة الفحص من خادم Vercel:</h4>
                    <p className={debugInfo.cloudNameExists ? "text-green-500" : "text-destructive"}>
                        CLOUDINARY_CLOUD_NAME: {debugInfo.cloudNameExists ? 'موجود' : 'مفقود'}
                    </p>
                    <p className={debugInfo.apiKeyExists ? "text-green-500" : "text-destructive"}>
                        CLOUDINARY_API_KEY: {debugInfo.apiKeyExists ? 'موجود' : 'مفقود'}
                    </p>
                    <p className={debugInfo.apiSecretExists ? "text-green-500" : "text-destructive"}>
                        CLOUDINARY_API_SECRET: {debugInfo.apiSecretExists ? 'موجود' : 'مفقود'}
                    </p>
                    <p className="text-muted-foreground pt-2">
                        البيئة الحالية: {debugInfo.envNode}
                    </p>
                    {(!debugInfo.cloudNameExists || !debugInfo.apiKeyExists || !debugInfo.apiSecretExists) && (
                        <div className="flex items-start gap-2 pt-3 text-destructive border-t border-destructive/20">
                            <AlertCircle size={20} className="mt-1"/>
                            <div>
                                <p className="font-bold">مشكلة هامة:</p>
                                <p className="text-xs">الخادم لا يستطيع قراءة واحد أو أكثر من المتغيرات المطلوبة لرفع الصور. يرجى مراجعتها بدقة في إعدادات Vercel ثم إعادة نشر المشروع.</p>
                            </div>
                        </div>
                    )}
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

