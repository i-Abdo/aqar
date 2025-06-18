
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home, PlusCircle, BarChart3, Settings, UserCircle, Loader2, Bell, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { collection, query, where, getCountFromServer, getDocs, orderBy, limit, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { plans } from "@/config/plans";
import type { Plan, PropertyAppeal, AdminAppealDecisionType } from "@/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface UserStats {
  activeListings: number;
  maxListings: string | number;
  planName: string;
  propertyViews: number;
  unreadMessages: number; // Kept for potential future use
}

interface AppealNotification {
  id: string;
  propertyTitle: string;
  decision?: AdminAppealDecisionType;
  translatedDecision?: string;
  adminNotes?: string;
  decisionDate?: string;
}

const decisionTranslations: Record<AdminAppealDecisionType, string> = {
  publish: "تم نشر عقارك",
  keep_archived: "بقي عقارك مؤرشفًا",
  delete: "تم حذف عقارك",
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [userStats, setUserStats] = useState<UserStats>({
    activeListings: 0,
    maxListings: "0",
    planName: "...",
    propertyViews: 0,
    unreadMessages: 0,
  });
  const [appealNotifications, setAppealNotifications] = useState<AppealNotification[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
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
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({ title: "خطأ", description: "لم نتمكن من تحميل بيانات لوحة التحكم.", variant: "destructive" });
      } finally {
        setIsLoadingStats(false);
      }
    };

    const fetchAppealNotifications = async () => {
      setIsLoadingNotifications(true);
      try {
        if (!user?.uid) {
          setIsLoadingNotifications(false);
          return;
        }
        const appealsQuery = query(
          collection(db, "property_appeals"),
          where("ownerUserId", "==", user.uid),
          where("appealStatus", "in", ["resolved_deleted", "resolved_kept_archived", "resolved_published"]),
          orderBy("adminDecisionAt", "desc"),
          limit(5) // Show latest 5 notifications
        );
        const querySnapshot = await getDocs(appealsQuery);
        const notifications = querySnapshot.docs.map(docSnap => {
          const data = docSnap.data() as PropertyAppeal;
          return {
            id: docSnap.id,
            propertyTitle: data.propertyTitle,
            decision: data.adminDecision,
            translatedDecision: data.adminDecision ? decisionTranslations[data.adminDecision] : "قرار غير محدد",
            adminNotes: data.adminNotes,
            decisionDate: data.adminDecisionAt ? (data.adminDecisionAt instanceof Timestamp ? data.adminDecisionAt.toDate() : new Date(data.adminDecisionAt)).toLocaleDateString('ar-DZ', { day: '2-digit', month: 'long', year: 'numeric' }) : "غير محدد",
          };
        });
        setAppealNotifications(notifications);
      } catch (error) {
        console.error("Error fetching appeal notifications:", error);
        // Do not toast for this error to avoid bothering user, but log it.
      } finally {
        setIsLoadingNotifications(false);
      }
    };

    fetchDashboardData();
    fetchAppealNotifications();
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

  if (authLoading || (isLoadingStats && isLoadingNotifications && !user)) { // Adjusted condition
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-20rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">جاري تحميل بيانات لوحة التحكم...</p>
      </div>
    );
  }


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-headline text-right">مرحباً بك في لوحة تحكم DarDz</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg hover:shadow-xl transition-smooth">
          <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2 text-right">
            <CardTitle className="text-sm font-medium text-right">العقارات النشطة</CardTitle>
            <Home className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-right">
            <>
              <div className="text-2xl font-bold">{userStats.activeListings} / {userStats.maxListings}</div>
              <p className="text-xs text-muted-foreground">
                بناءً على خطة {userStats.planName} الخاصة بك
              </p>
            </>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-smooth">
          <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2 text-right">
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

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold font-headline text-right">إجراءات سريعة</h2>
        <div className="flex flex-wrap gap-4 justify-center">
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

      <Card className="shadow-md hover:shadow-lg transition-smooth">
        <CardHeader>
          <CardTitle className="text-right flex items-center gap-2">
            <Bell className="text-primary"/>
            آخر الأنشطة والإشعارات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-right">
          {isLoadingNotifications ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">جاري تحميل الإشعارات...</p>
            </div>
          ) : appealNotifications.length > 0 ? (
            <ul className="space-y-3">
              {appealNotifications.map((notification) => (
                <li key={notification.id} className="p-3 rounded-md border border-border bg-background hover:bg-muted/50 transition-colors">
                  <p className="font-semibold text-primary-foreground/90">بخصوص عقار: <span className="font-normal text-foreground">{notification.propertyTitle}</span></p>
                  <p className="text-sm text-muted-foreground">
                    القرار: <span className={`font-medium ${
                      notification.decision === 'publish' ? 'text-green-600' : 
                      notification.decision === 'delete' ? 'text-destructive' : 'text-orange-500'
                    }`}>{notification.translatedDecision}</span>
                    {notification.adminNotes && (
                      <span className="block mt-1 text-xs"> ملاحظات المسؤول: {notification.adminNotes}</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground/80 mt-1">بتاريخ: {notification.decisionDate}</p>
                </li>
              ))}
            </ul>
          ) : (
             <div className="flex flex-col items-center justify-center text-center py-6">
                <AlertTriangle size={32} className="text-muted-foreground mb-2" />
                <p className="text-muted-foreground">لا توجد إشعارات أو أنشطة حديثة لعرضها.</p>
             </div>
          )}
          {userStats.unreadMessages > 0 && ( // Still keeping this for future message system
            <div className="mt-4 p-3 rounded-md border border-accent bg-accent/10 text-right">
                <p className="text-accent-foreground">لديك <span className="font-bold">{userStats.unreadMessages}</span> رسائل جديدة غير مقروءة. <Link href="/dashboard/messages" className="underline hover:text-primary">عرض الرسائل</Link></p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
