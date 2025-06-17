
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home, PlusCircle, BarChart3, Settings, UserCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { collection, query, where, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { plans } from "@/config/plans";
import type { Plan } from "@/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";


export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [userStats, setUserStats] = useState({
    activeListings: 0,
    maxListings: "0" as string | number, // Allow string for "غير محدود"
    planName: "...",
    propertyViews: 0, 
    unreadMessages: 0, 
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [canAddProperty, setCanAddProperty] = useState(false);
  const [currentPlanDetails, setCurrentPlanDetails] = useState<Plan | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchDashboardData = async () => {
      setIsLoadingStats(true);
      try {
        const userPlanId = user.planId || 'free';
        const planDetails = plans.find(p => p.id === userPlanId);
        setCurrentPlanDetails(planDetails || null);

        let currentPropertyCount = 0;
        if (planDetails) {
          // Fetch current property count regardless of plan limit type
          const propertiesRef = collection(db, "properties");
          const q = query(propertiesRef, where("userId", "==", user.uid), where("status", "in", ["active", "pending"]));
          const snapshot = await getCountFromServer(q);
          currentPropertyCount = snapshot.data().count;
            
          if (planDetails.maxListings === Infinity) {
            setCanAddProperty(true);
          } else {
            setCanAddProperty(currentPropertyCount < planDetails.maxListings);
          }

          setUserStats(prev => ({
            ...prev,
            activeListings: currentPropertyCount,
            maxListings: planDetails.maxListings === Infinity ? 'غير محدود' : planDetails.maxListings,
            planName: planDetails.name,
          }));
        } else {
          setCanAddProperty(false);
           setUserStats(prev => ({ ...prev, planName: "غير محدد"}));
        }
        // Placeholder for other stats
        // setUserStats(prev => ({ ...prev, propertyViews: 1234, unreadMessages: 3 }));

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({ title: "خطأ", description: "لم نتمكن من تحميل بيانات لوحة التحكم.", variant: "destructive" });
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchDashboardData();
  }, [user, authLoading, router, toast]);

  const handleAddPropertyClick = () => {
    if (canAddProperty) {
      router.push("/dashboard/properties/new");
    } else {
      toast({
        title: "تم الوصول للحد الأقصى",
        description: `لقد وصلت إلى الحد الأقصى لعدد العقارات المسموح به في خطة "${currentPlanDetails?.name}". يرجى ترقية خطتك.`,
        variant: "destructive",
        action: <Button onClick={() => router.push('/pricing')} variant="secondary">الترقية الآن</Button>
      });
    }
  };

  if (authLoading || isLoadingStats) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-20rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">جاري تحميل بيانات لوحة التحكم...</p>
      </div>
    );
  }


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-headline">مرحباً بك في لوحة تحكم DarDz</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg hover:shadow-xl transition-smooth">
          <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-right">العقارات النشطة</CardTitle>
            <Home className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-right">
            {user?.planId === 'vip_plus_plus' && userStats.activeListings === 0 ? (
                 <p className="text-destructive">هناك خطأ هنا فقط في vip++ حيث لا يضهر عدد العقارات المرفوعة تضهر 0</p>
            ) : (
              <>
                <div className="text-2xl font-bold">{userStats.activeListings} / {userStats.maxListings}</div>
                <p className="text-xs text-muted-foreground">
                  بناءً على خطة {userStats.planName} الخاصة بك
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-smooth">
          <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-right">زيارات العقارات (آخر 30 يوم)</CardTitle>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl font-bold">{userStats.propertyViews.toLocaleString()}</div> 
            <p className="text-xs text-muted-foreground">
              (سيتم تفعيل هذه الميزة قريباً)
            </p>
          </CardContent>
        </Card>

         <Card className="shadow-lg flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary/80 to-primary hover:shadow-xl transition-smooth">
          <PlusCircle className="h-12 w-12 text-primary-foreground mb-3" />
          <CardTitle className="text-xl font-semibold text-primary-foreground mb-2 text-center">هل لديك عقار جديد؟</CardTitle>
          <Button onClick={handleAddPropertyClick} variant="secondary" className="w-full transition-smooth hover:shadow-md">
            أضف عقار الآن
          </Button>
        </Card>
      </div>

      <div className="space-y-4 dir-ltr">
        <h2 className="text-2xl font-semibold font-headline text-left">إجراءات سريعة</h2>
        <div className="flex flex-wrap gap-4">
          <Button asChild variant="outline_primary" className="transition-smooth hover:shadow-md">
            <Link href="/dashboard/properties"><Home className="mr-2 h-4 w-4" /> عرض كل عقاراتي</Link>
          </Button>
          <Button asChild variant="outline_primary" className="transition-smooth hover:shadow-md">
            <Link href="/pricing"><PlusCircle className="mr-2 h-4 w-4" /> ترقية الخطة</Link>
          </Button>
           <Button asChild variant="outline_primary" className="transition-smooth hover:shadow-md">
            <Link href="/dashboard/profile"><UserCircle className="mr-2 h-4 w-4" /> تعديل الملف الشخصي</Link>
          </Button>
          <Button asChild variant="outline_primary" className="transition-smooth hover:shadow-md">
            <Link href="/dashboard/settings"><Settings className="mr-2 h-4 w-4" /> الإعدادات</Link>
          </Button>
        </div>
      </div>

      <Card className="shadow-md hover:shadow-lg transition-smooth dir-ltr">
        <CardHeader>
          <CardTitle className="text-left">آخر الأنشطة والرسائل</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-left">
          {userStats.unreadMessages > 0 ? (
            <div className="p-3 rounded-md border border-accent bg-accent/10 text-left">
                <p className="text-accent-foreground">لديك <span className="font-bold">{userStats.unreadMessages}</span> رسائل جديدة غير مقروءة. <Link href="/dashboard/messages" className="underline hover:text-primary">عرض الرسائل</Link></p>
            </div>
          ) : (
             <p className="text-muted-foreground">(سيتم تفعيل هذه الميزة قريباً لعرض الأنشطة والرسائل)</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
