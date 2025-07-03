"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home, PlusCircle, BarChart3, Settings, UserCircle, Loader2, Bell, AlertTriangle, X, Trash2, Flag } from "lucide-react"; 
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState, useCallback } from "react";
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { plans } from "@/config/plans";
import type { Plan, Property, PropertyAppeal, AdminAppealDecisionType, UserIssue, Report, ReportReason } from "@/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge"; 
import { dismissSingleNotification } from "@/actions/notificationActions";

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
}

interface UserIssueUpdateForDashboard {
  id: string; 
  propertyTitle?: string; 
  originalMessagePreview: string;
  status: UserIssue['status'];
  translatedStatus: string;
  adminNotes?: string;
  lastUpdateDate: string; 
}

interface ReportUpdateForDashboard {
    id: string;
    propertyTitle: string;
    originalReason: ReportReason;
    status: Report['status'];
    translatedStatus: string;
    adminNotes?: string;
    lastUpdateDate: string;
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

const reportStatusTranslations: Record<Report['status'], string> = {
    new: 'جديد',
    under_review: 'قيد المراجعة',
    resolved: 'تم حل البلاغ',
    dismissed: 'تم رفض البلاغ',
};


export default function DashboardPage() {
  const { user, loading: authLoading, setUserDashboardNotificationCount } = useAuth(); 
  const [userStats, setUserStats] = useState<UserStats>({
    activeListings: 0,
    maxListings: "0",
    planName: "...",
    propertyViews: 0,
    unreadMessages: 0,
  });
  const [appealNotifications, setAppealNotifications] = useState<AppealNotification[]>([]);
  const [userIssueUpdates, setUserIssueUpdates] = useState<UserIssueUpdateForDashboard[]>([]);
  const [reportUpdates, setReportUpdates] = useState<ReportUpdateForDashboard[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [canAddProperty, setCanAddProperty] = useState(false);
  const [currentPlanDetails, setCurrentPlanDetails] = useState<Plan | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const fetchAppealNotifications = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const appealsQuery = query(
        collection(db, "property_appeals"),
        where("ownerUserId", "==", user.uid),
        where("appealStatus", "in", ["resolved_deleted", "resolved_kept_archived", "resolved_published"]),
        where("dismissedByOwner", "!=", true), 
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
        };
      });
      setAppealNotifications(notifications);
    } catch (error) {
      console.error("Error fetching appeal notifications:", error);
    }
  }, [user]);

  const fetchUserIssueUpdates = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const issuesQuery = query(
        collection(db, "user_issues"),
        where("userId", "==", user.uid),
        where("status", "in", ["in_progress", "resolved"]),
        where("dismissedByOwner", "!=", true), 
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
        };
      });
      setUserIssueUpdates(updates);
    } catch (error) {
      console.error("Error fetching user issue updates:", error);
    }
  }, [user]);
  
  const fetchReportUpdates = useCallback(async () => {
    if (!user?.uid) return;
    try {
        const reportsQuery = query(
            collection(db, "reports"),
            where("reporterUserId", "==", user.uid),
            where("status", "in", ["resolved", "dismissed"]),
            where("dismissedByReporter", "!=", true),
            orderBy("updatedAt", "desc"),
            limit(5)
        );
        const querySnapshot = await getDocs(reportsQuery);
        const updates = querySnapshot.docs.map(docSnap => {
            const data = docSnap.data() as Report;
            return {
                id: docSnap.id,
                propertyTitle: data.propertyTitle,
                originalReason: data.reason,
                status: data.status,
                translatedStatus: reportStatusTranslations[data.status] || data.status,
                adminNotes: data.adminNotes,
                lastUpdateDate: data.updatedAt ? (data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt)).toLocaleDateString('ar-DZ', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "غير محدد",
            };
        });
        setReportUpdates(updates);
    } catch (error) {
        console.error("Error fetching report updates:", error);
    }
  }, [user]);

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

        if (planDetails) {
          const propertiesRef = collection(db, "properties");
          const q = query(propertiesRef, where("userId", "==", user.uid), where("status", "in", ["active", "pending"]));
          
          const querySnapshot = await getDocs(q);
          const userProperties = querySnapshot.docs.map(doc => doc.data() as Property);
          const currentPropertyCount = userProperties.length;
          const totalViews = userProperties.reduce((sum, prop) => sum + (prop.viewCount || 0), 0);

          setCanAddProperty(planDetails.maxListings === Infinity || currentPropertyCount < planDetails.maxListings);
          setUserStats(prev => ({
            ...prev,
            activeListings: currentPropertyCount,
            maxListings: planDetails.maxListings === Infinity ? 'غير محدود' : planDetails.maxListings,
            planName: planDetails.name,
            propertyViews: totalViews,
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

    const fetchAllNotifications = async () => {
        setIsLoadingNotifications(true);
        try {
            await Promise.all([
                fetchAppealNotifications(),
                fetchUserIssueUpdates(),
                fetchReportUpdates(),
            ]);
        } catch (error) {
            // Individual fetches handle their own console errors
        } finally {
            setIsLoadingNotifications(false);
        }
    };

    fetchDashboardData();
    fetchAllNotifications();
  }, [user, authLoading, router, toast, fetchAppealNotifications, fetchUserIssueUpdates, fetchReportUpdates]);

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

  const handleDismissAppeal = async (appealId: string) => {
    setAppealNotifications(prev => prev.filter(n => n.id !== appealId));
    setUserDashboardNotificationCount(prev => Math.max(0, prev - 1));
    const result = await dismissSingleNotification(appealId, 'appeal');
    if (!result.success) {
      toast({ title: "خطأ", description: result.message, variant: "destructive" });
      fetchAppealNotifications();
    }
  };

  const handleDismissIssue = async (issueId: string) => {
    setUserIssueUpdates(prev => prev.filter(u => u.id !== issueId));
    setUserDashboardNotificationCount(prev => Math.max(0, prev - 1));
    const result = await dismissSingleNotification(issueId, 'issue');
    if (!result.success) {
      toast({ title: "خطأ", description: result.message, variant: "destructive" });
      fetchUserIssueUpdates();
    }
  };
  
  const handleDismissReport = async (reportId: string) => {
    setReportUpdates(prev => prev.filter(r => r.id !== reportId));
    setUserDashboardNotificationCount(prev => Math.max(0, prev - 1));
    const result = await dismissSingleNotification(reportId, 'report');
    if (!result.success) {
      toast({ title: "خطأ", description: result.message, variant: "destructive" });
      fetchReportUpdates();
    }
  };

  if (authLoading || (isLoadingStats && !user)) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-20rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">جاري تحميل بيانات لوحة التحكم...</p>
      </div>
    );
  }
  
  const hasVisibleNotifications = appealNotifications.length > 0 || userIssueUpdates.length > 0 || reportUpdates.length > 0;
  const totalVisibleNotifications = appealNotifications.length + userIssueUpdates.length + reportUpdates.length;


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-headline text-right">مرحباً بك في لوحة تحكم دار دز</h1>

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
            <CardTitle className="text-sm font-medium text-right">زيارات العقارات (الإجمالي)</CardTitle>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl font-bold">{userStats.propertyViews.toLocaleString()}</div>
             <p className="text-xs text-muted-foreground">
              مجموع المشاهدات على كل عقاراتك
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
          <div className="flex justify-between items-center">
            <CardTitle className="text-right flex items-center gap-2">
              <Bell className="text-primary"/>
              <span>آخر الأنشطة والإشعارات</span>
              {totalVisibleNotifications > 0 && (
                <Badge variant="destructive" className="h-6 px-2.5">{totalVisibleNotifications > 9 ? '9+' : totalVisibleNotifications}</Badge>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-right">
          {isLoadingNotifications ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">جاري تحميل الإشعارات...</p>
            </div>
          ) : (
            <>
              {appealNotifications.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-2 text-primary-foreground/90 border-b pb-1">تحديثات الطعون:</h4>
                  <ul className="space-y-3">
                    {appealNotifications.map((notification) => (
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

              {userIssueUpdates.length > 0 && (
                 <div className="mb-4">
                  <h4 className="text-lg font-semibold mb-2 text-primary-foreground/90 border-b pb-1">تحديثات مشكلاتك المرسلة:</h4>
                  <ul className="space-y-3">
                    {userIssueUpdates.map((update) => (
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
              
               {reportUpdates.length > 0 && (
                 <div className="mb-4">
                  <h4 className="text-lg font-semibold mb-2 text-primary-foreground/90 border-b pb-1 flex items-center gap-2"><Flag size={18}/>تحديثات بلاغاتك:</h4>
                  <ul className="space-y-3">
                    {reportUpdates.map((update) => (
                      <li key={`report-${update.id}`} className="relative p-3 rounded-md border border-border bg-background hover:bg-muted/50 transition-colors">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 left-1 rtl:right-auto rtl:left-1 h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDismissReport(update.id)}
                          aria-label="إخفاء هذا الإشعار"
                        >
                          <X size={16} />
                        </Button>
                        <p className="font-semibold pr-6 rtl:pl-6">
                          بخصوص بلاغك عن: <span className="font-normal">{update.propertyTitle}</span>
                        </p>
                        <p className="text-sm text-muted-foreground pr-6 rtl:pl-6">
                          الحالة: <span className={`font-medium ${
                              update.status === 'resolved' ? 'text-green-600' :
                              update.status === 'dismissed' ? 'text-destructive' : 'text-gray-600'
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


              {!hasVisibleNotifications && !isLoadingNotifications && (
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
