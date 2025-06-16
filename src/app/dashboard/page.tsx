import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home, PlusCircle, BarChart3 } from "lucide-react";

// export const metadata: Metadata = { // Cannot be used in client component
//   title: "لوحة التحكم - DarDz",
//   description: "إدارة عقاراتك وإعدادات حسابك في DarDz.",
// };

export default function DashboardPage() {
  // In a real app, fetch user-specific data here (e.g., number of listings, plan info)
  const userStats = {
    activeListings: 2, // Example data
    maxListings: 5,    // Example data
    planName: "VIP",   // Example data
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-headline">مرحباً بك في لوحة تحكم DarDz</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العقارات النشطة</CardTitle>
            <Home className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.activeListings} / {userStats.maxListings}</div>
            <p className="text-xs text-muted-foreground">
              بناءً على خطة {userStats.planName} الخاصة بك
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">زيارات العقارات (آخر 30 يوم)</CardTitle>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div> 
            <p className="text-xs text-muted-foreground">
              +15.2% عن الشهر الماضي
            </p>
          </CardContent>
        </Card>

         <Card className="shadow-lg flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary/80 to-primary">
          <PlusCircle className="h-12 w-12 text-primary-foreground mb-3" />
          <CardTitle className="text-xl font-semibold text-primary-foreground mb-2 text-center">هل لديك عقار جديد؟</CardTitle>
          <Button asChild variant="secondary" className="w-full transition-smooth hover:shadow-md">
            <Link href="/dashboard/properties/new">أضف عقار الآن</Link>
          </Button>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold font-headline">إجراءات سريعة</h2>
        <div className="flex flex-wrap gap-4">
          <Button asChild variant="outline_primary" className="transition-smooth hover:shadow-md">
            <Link href="/dashboard/properties">عرض كل عقاراتي</Link>
          </Button>
          <Button asChild variant="outline_primary" className="transition-smooth hover:shadow-md">
            <Link href="/pricing">ترقية الخطة</Link>
          </Button>
           <Button asChild variant="outline_primary" className="transition-smooth hover:shadow-md">
            <Link href="/dashboard/settings">تعديل الملف الشخصي</Link>
          </Button>
        </div>
      </div>

      {/* Placeholder for a list of recent activities or messages */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>آخر الأنشطة</CardTitle>
          <CardDescription>لا توجد أنشطة جديدة لعرضها حاليًا.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">سيتم عرض استفسارات جديدة أو إشعارات النظام هنا.</p>
        </CardContent>
      </Card>
    </div>
  );
}
