
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home, PlusCircle, BarChart3, Settings, UserCircle, Loader2, Bell, AlertTriangle, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { collection, query, where, getCountFromServer, getDocs, orderBy, limit, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { plans } from "@/config/plans";
import type { Plan, PropertyAppeal, AdminAppealDecisionType, UserIssue } from "@/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface UserStats {
  activeListings: number;
  maxListings: string | number;
  planName: string;
  propertyViews: number;
  unreadMessages: number;
}

interface AppealNotification {
  id: string;
  propertyTitle: string;
  decision?: AdminAppealDecisionType;
  translatedDecision?: string;
  adminNotes?: string;
  decisionDate?: string;
  isDismissed?: boolean; // Added for client-side dismissal
}

interface UserIssueUpdateForDashboard {
  id: string; // Issue ID
  propertyTitle?: string; // If related to a property
  originalMessagePreview: string;
  status: UserIssue['status'];
  translatedStatus: string;
  adminNotes?: string;
  lastUpdateDate: string; // From issue's updatedAt field
  isDismissed?: boolean; // Added for client-side dismissal
}

const decisionTranslations: Record<AdminAppealDecisionType, string> = {
  publish: "تم نشر عقارك",
  keep_archived: "بقي عقارك مؤرشفًا",
  delete: "تم حذف عقارك",
};

const issueStatusTranslations: Record<UserIssue['status'], string> = {
  new: 'جديد',
  in_progress: 'قيد المعالجة',
  resolved: 'تم الحل',
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
  const [userIssueUpdates, setUserIssueUpdates] = useState<UserIssueUpdateForDashboard[]>([]);
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
      if (!user?.uid) return;
      try {
        const appealsQuery = query(
          collection(db, "property_appeals"),
          where("ownerUserId", "==", user.uid),
          where("appealStatus", "in", ["resolved_deleted", "resolved_kept_archived", "resolved_published"]),
          orderBy("adminDecisionAt", "desc"),
          limit(5)
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
            isDismissed: false,
          };
        });
        setAppealNotifications(notifications);
      } catch (error) {
        console.error("Error fetching appeal notifications:", error);
      }
    };

    const fetchUserIssueUpdates = async () => {
      if (!user?.uid) return;
      try {
        const issuesQuery = query(
          collection(db, "user_issues"),
          where("userId", "==", user.uid),
          where("status", "in", ["in_progress", "resolved"]),
          orderBy("updatedAt", "desc"),
          limit(5)
        );
        const querySnapshot = await getDocs(issuesQuery);
        const updates = querySnapshot.docs.map(docSnap => {
          const data = docSnap.data() as UserIssue;
          return {
            id: docSnap.id,
            propertyTitle: data.propertyTitle,
            originalMessagePreview: data.message.substring(0, 100) + (data.message.length > 100 ? "..." : ""),
            status: data.status,
            translatedStatus: issueStatusTranslations[data.status] || data.status,
            adminNotes: data.adminNotes,
            lastUpdateDate: data.updatedAt ? (data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt)).toLocaleDateString('ar-DZ', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "غير محدد",
            isDismissed: false,
          };
        });
        setUserIssueUpdates(updates);
      } catch (error) {
        console.error("Error fetching user issue updates:", error);
      }
    };

    const fetchAllNotifications = async () => {
        setIsLoadingNotifications(true);
        try {
            await Promise.all([
                fetchAppealNotifications(),
                fetchUserIssueUpdates()
            ]);
        } catch (error) {
            // Individual fetches handle their own console errors
        } finally {
            setIsLoadingNotifications(false);
        }
    };

    fetchDashboardData();
    fetchAllNotifications();
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

  const handleDismissAppeal = (appealId: string) => {
    setAppealNotifications(prev => 
      prev.map(notif => notif.id === appealId ? { ...notif, isDismissed: true } : notif)
    );
  };

  const handleDismissIssue = (issueId: string) => {
    setUserIssueUpdates(prev =>
      prev.map(notif => notif.id === issueId ? { ...notif, isDismissed: true } : notif)
    );
  };

  if (authLoading || (isLoadingStats && !user)) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-20rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">جاري تحميل بيانات لوحة التحكم...</p>
      </div>
    );
  }

  const visibleAppealNotifications = appealNotifications.filter(n => !n.isDismissed);
  const visibleUserIssueUpdates = userIssueUpdates.filter(u => !u.isDismissed);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-headline text-right">مرحباً بك في لوحة تحكم عقاري</h1>

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
          ) : (
            <>
              {visibleAppealNotifications.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-2 text-primary-foreground/90 border-b pb-1">تحديثات الطعون:</h4>
                  <ul className="space-y-3">
                    {visibleAppealNotifications.map((notification) => (
                      <li key={`appeal-${notification.id}`} className="relative p-3 rounded-md border border-border bg-background hover:bg-muted/50 transition-colors">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 left-1 rtl:right-auto rtl:left-1 h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDismissAppeal(notification.id)}
                          aria-label="إخفاء هذا الإشعار"
                        >
                          <X size={16} />
                        </Button>
                        <p className="font-semibold pr-6 rtl:pl-6">بخصوص طعن على عقار: <span className="font-normal text-foreground">{notification.propertyTitle}</span></p>
                        <p className="text-sm text-muted-foreground pr-6 rtl:pl-6">
                          القرار: <span className={`font-medium ${
                            notification.decision === 'publish' ? 'text-green-600' :
                            notification.decision === 'delete' ? 'text-destructive' : 'text-orange-500'
                          }`}>{notification.translatedDecision}</span>
                          {notification.adminNotes && (
                            <span className="block mt-1 text-xs"> ملاحظات المسؤول: {notification.adminNotes}</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground/80 mt-1 pr-6 rtl:pl-6">بتاريخ: {notification.decisionDate}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {visibleUserIssueUpdates.length > 0 && (
                 <div className="mb-4">
                  <h4 className="text-lg font-semibold mb-2 text-primary-foreground/90 border-b pb-1">تحديثات مشكلاتك المرسلة:</h4>
                  <ul className="space-y-3">
                    {visibleUserIssueUpdates.map((update) => (
                      <li key={`issue-${update.id}`} className="relative p-3 rounded-md border border-border bg-background hover:bg-muted/50 transition-colors">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 left-1 rtl:right-auto rtl:left-1 h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDismissIssue(update.id)}
                          aria-label="إخفاء هذا الإشعار"
                        >
                          <X size={16} />
                        </Button>
                        <p className="font-semibold pr-6 rtl:pl-6">
                          {update.propertyTitle
                            ? `بخصوص مشكلتك حول العقار: ${update.propertyTitle}`
                            : `بخصوص مشكلتك: "${update.originalMessagePreview}"`}
                        </p>
                        <p className="text-sm text-muted-foreground pr-6 rtl:pl-6">
                          الحالة: <span className={`font-medium ${
                              update.status === 'resolved' ? 'text-green-600' :
                              update.status === 'in_progress' ? 'text-blue-600' : 'text-gray-600'
                          }`}>{update.translatedStatus}</span>
                          {update.adminNotes && (
                            <span className="block mt-1 text-xs"> ملاحظات المسؤول: {update.adminNotes}</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground/80 mt-1 pr-6 rtl:pl-6">آخر تحديث بتاريخ: {update.lastUpdateDate}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {visibleAppealNotifications.length === 0 && visibleUserIssueUpdates.length === 0 && (
                 <div className="flex flex-col items-center justify-center text-center py-6">
                    <AlertTriangle size={32} className="text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">لا توجد إشعارات أو أنشطة حديثة لعرضها.</p>
                 </div>
              )}
            </>
          )}
          {userStats.unreadMessages > 0 && (
            <div className="mt-4 p-3 rounded-md border border-accent bg-accent/10 text-right">
                <p className="text-accent-foreground">لديك <span className="font-bold">{userStats.unreadMessages}</span> رسائل جديدة غير مقروءة. <Link href="/dashboard/messages" className="underline hover:text-primary">عرض الرسائل</Link></p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
