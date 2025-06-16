
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home, PlusCircle, BarChart3, Settings, UserCircle } from "lucide-react";

// ملاحظة: export const metadata لا يمكن استخدامها مباشرة في مكونات العميل (Client Components).
// يمكن تعيين عنوان الصفحة ديناميكيًا باستخدام useEffect و document.title إذا لزم الأمر،
// أو بشكل أفضل، في مكون خادم (Server Component) رئيسي أو ملف layout.tsx.

export default function DashboardPage() {
  // بيانات مثال: في تطبيق حقيقي، سيتم جلب هذه البيانات ديناميكيًا للمستخدم الحالي.
  const userStats = {
    activeListings: 2, // مثال
    maxListings: 5,    // مثال
    planName: "VIP",   // مثال
    propertyViews: 1234, // مثال
    unreadMessages: 3, // مثال
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-headline">مرحباً بك في لوحة تحكم DarDz</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg hover:shadow-xl transition-smooth">
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

        <Card className="shadow-lg hover:shadow-xl transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">زيارات العقارات (آخر 30 يوم)</CardTitle>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.propertyViews.toLocaleString()}</div> 
            <p className="text-xs text-muted-foreground">
              +15.2% عن الشهر الماضي (مثال)
            </p>
          </CardContent>
        </Card>

         <Card className="shadow-lg flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary/80 to-primary hover:shadow-xl transition-smooth">
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
            <Link href="/dashboard/properties"><Home className="rtl:ml-2 ml-0 mr-2 h-4 w-4" /> عرض كل عقاراتي</Link>
          </Button>
          <Button asChild variant="outline_primary" className="transition-smooth hover:shadow-md">
            <Link href="/pricing"><PlusCircle className="rtl:ml-2 ml-0 mr-2 h-4 w-4" /> ترقية الخطة</Link>
          </Button>
           <Button asChild variant="outline_primary" className="transition-smooth hover:shadow-md">
            <Link href="/dashboard/profile"><UserCircle className="rtl:ml-2 ml-0 mr-2 h-4 w-4" /> تعديل الملف الشخصي</Link>
          </Button>
          <Button asChild variant="outline_primary" className="transition-smooth hover:shadow-md">
            <Link href="/dashboard/settings"><Settings className="rtl:ml-2 ml-0 mr-2 h-4 w-4" /> الإعدادات</Link>
          </Button>
        </div>
      </div>

      {/* Placeholder for a list of recent activities or messages */}
      <Card className="shadow-md hover:shadow-lg transition-smooth">
        <CardHeader>
          <CardTitle>آخر الأنشطة والرسائل</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {userStats.unreadMessages > 0 ? (
            <div className="p-3 rounded-md border border-accent bg-accent/10">
                <p className="text-accent-foreground">لديك <span className="font-bold">{userStats.unreadMessages}</span> رسائل جديدة غير مقروءة. <Link href="/dashboard/messages" className="underline hover:text-primary">عرض الرسائل</Link></p>
            </div>
          ) : (
             <p className="text-muted-foreground">لا توجد أنشطة جديدة أو رسائل لعرضها حاليًا.</p>
          )}
          {/* Example of another activity */}
          <p className="text-sm text-muted-foreground">تمت الموافقة على عقارك "شقة فاخرة في حيدرة" بتاريخ 2024-07-28.</p>
        </CardContent>
      </Card>
    </div>
  );
}
