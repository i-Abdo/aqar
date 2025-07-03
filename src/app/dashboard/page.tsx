
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home, PlusCircle, BarChart3, Settings, UserCircle, Loader2, Bell, AlertTriangle, X, ShieldQuestion, MessageSquareWarning, Flag, ListChecks, DollarSign, Edit } from "lucide-react"; 
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState, useCallback, useMemo } from "react";
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { plans } from "@/config/plans";
import type { Plan, Property, PropertyAppeal, AdminAppealDecisionType, UserIssue, Report, ReportReason } from "@/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge"; 
import { dismissSingleNotification } from "@/actions/notificationActions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface UserStats {
  activeListings: number;
  maxListings: string | number;
  propertyViews: number;
}

interface AppealNotification {
  id: string;
  propertyTitle: string;
  decision?: AdminAppealDecisionType;
  translatedDecision?: string;
  adminNotes?: string;
  decisionDate: string;
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

type ActivityItem = {
  id: string;
  type: 'appeal' | 'issue' | 'report';
  date: Date;
  title: string;
  description: string;
  Icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  onDismiss: () => void;
};

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
    propertyViews: 0,
  });
  const [appealNotifications, setAppealNotifications] = useState<AppealNotification[]>([]);
  const [userIssueUpdates, setUserIssueUpdates] = useState<UserIssueUpdateForDashboard[]>([]);
  const [reportUpdates, setReportUpdates] = useState<ReportUpdateForDashboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canAddProperty, setCanAddProperty] = useState(false);
  const [currentPlanDetails, setCurrentPlanDetails] = useState<Plan | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleDismissAppeal = useCallback(async (appealId: string) => {
    setAppealNotifications(prev => prev.filter(n => n.id !== appealId));
    setUserDashboardNotificationCount(prev => Math.max(0, prev - 1));
    const result = await dismissSingleNotification(appealId, 'appeal');
    if (!result.success) {
      toast({ title: "خطأ", description: result.message, variant: "destructive" });
    }
  }, [setUserDashboardNotificationCount, toast]);

  const handleDismissIssue = useCallback(async (issueId: string) => {
    setUserIssueUpdates(prev => prev.filter(u => u.id !== issueId));
    setUserDashboardNotificationCount(prev => Math.max(0, prev - 1));
    const result = await dismissSingleNotification(issueId, 'issue');
    if (!result.success) {
      toast({ title: "خطأ", description: result.message, variant: "destructive" });
    }
  }, [setUserDashboardNotificationCount, toast]);
  
  const handleDismissReport = useCallback(async (reportId: string) => {
    setReportUpdates(prev => prev.filter(r => r.id !== reportId));
    setUserDashboardNotificationCount(prev => Math.max(0, prev - 1));
    const result = await dismissSingleNotification(reportId, 'report');
    if (!result.success) {
      toast({ title: "خطأ", description: result.message, variant: "destructive" });
    }
  }, [setUserDashboardNotificationCount, toast]);


  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const userPlanId = user.planId || 'free';
        const planDetails = plans.find(p => p.id === userPlanId);
        setCurrentPlanDetails(planDetails || null);

        const propertiesRef = collection(db, "properties");
        const q = query(propertiesRef, where("userId", "==", user.uid));
        
        const [querySnapshot, appealsSnapshot, issuesSnapshot, reportsSnapshot] = await Promise.all([
          getDocs(q),
          getDocs(query(collection(db, "property_appeals"), where("ownerUserId", "==", user.uid), where("appealStatus", "in", ["resolved_deleted", "resolved_kept_archived", "resolved_published"]), where("dismissedByOwner", "!=", true), orderBy("adminDecisionAt", "desc"), limit(5))),
          getDocs(query(collection(db, "user_issues"), where("userId", "==", user.uid), where("status", "in", ["in_progress", "resolved"]), where("dismissedByOwner", "!=", true), orderBy("updatedAt", "desc"), limit(5))),
          getDocs(query(collection(db, "reports"), where("reporterUserId", "==", user.uid), where("status", "in", ["resolved", "dismissed"]), where("dismissedByReporter", "!=", true), orderBy("updatedAt", "desc"), limit(5)))
        ]);

        const userProperties = querySnapshot.docs.map(doc => doc.data() as Property);
        const activeProperties = userProperties.filter(p => ["active", "pending"].includes(p.status));
        const currentPropertyCount = activeProperties.length;
        const totalViews = activeProperties.reduce((sum, prop) => sum + (prop.viewCount || 0), 0);

        if (planDetails) {
          setCanAddProperty(planDetails.maxListings === Infinity || currentPropertyCount < planDetails.maxListings);
          setUserStats({
            activeListings: currentPropertyCount,
            maxListings: planDetails.maxListings === Infinity ? '∞' : planDetails.maxListings,
            propertyViews: totalViews,
          });
        }
        
        setAppealNotifications(appealsSnapshot.docs.map(docSnap => {
          const data = docSnap.data() as PropertyAppeal;
          return {
            id: docSnap.id, propertyTitle: data.propertyTitle, decision: data.adminDecision,
            translatedDecision: data.adminDecision ? decisionTranslations[data.adminDecision] : "غير محدد",
            adminNotes: data.adminNotes,
            decisionDate: data.adminDecisionAt ? (data.adminDecisionAt instanceof Timestamp ? data.adminDecisionAt.toDate() : new Date(data.adminDecisionAt)).toISOString() : new Date().toISOString(),
          };
        }));
        
        setUserIssueUpdates(issuesSnapshot.docs.map(docSnap => {
          const data = docSnap.data() as UserIssue;
          return {
            id: docSnap.id, propertyTitle: data.propertyTitle, originalMessagePreview: data.message.substring(0, 100) + (data.message.length > 100 ? "..." : ""),
            status: data.status, translatedStatus: issueStatusTranslations[data.status] || data.status, adminNotes: data.adminNotes,
            lastUpdateDate: data.updatedAt ? (data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt)).toISOString() : new Date().toISOString(),
          };
        }));

        setReportUpdates(reportsSnapshot.docs.map(docSnap => {
          const data = docSnap.data() as Report;
          return {
            id: docSnap.id, propertyTitle: data.propertyTitle, originalReason: data.reason, status: data.status,
            translatedStatus: reportStatusTranslations[data.status] || data.status, adminNotes: data.adminNotes,
            lastUpdateDate: data.updatedAt ? (data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt)).toISOString() : new Date().toISOString(),
          };
        }));

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({ title: "خطأ", description: "لم نتمكن من تحميل بيانات لوحة التحكم.", variant: "destructive" });
      } finally {
        setIsLoading(false);
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

  const combinedActivities = useMemo(() => {
    const activities: ActivityItem[] = [];

    appealNotifications.forEach(n => activities.push({
      id: n.id, type: 'appeal', date: new Date(n.decisionDate),
      title: `قرار بشأن طعنك على: ${n.propertyTitle}`,
      description: `القرار: ${n.translatedDecision}. ${n.adminNotes || ''}`,
      Icon: ShieldQuestion, iconColor: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      onDismiss: () => handleDismissAppeal(n.id)
    }));

    userIssueUpdates.forEach(u => activities.push({
      id: u.id, type: 'issue', date: new Date(u.lastUpdateDate),
      title: `تحديث على مشكلتك المرسلة`,
      description: `الحالة: ${u.translatedStatus}. ${u.adminNotes ? `ملاحظات المسؤول: ${u.adminNotes}` : ''}`,
      Icon: MessageSquareWarning, iconColor: 'text-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      onDismiss: () => handleDismissIssue(u.id)
    }));
    
    reportUpdates.forEach(r => activities.push({
      id: r.id, type: 'report', date: new Date(r.lastUpdateDate),
      title: `تحديث على بلاغك بخصوص: ${r.propertyTitle}`,
      description: `الحالة: ${r.translatedStatus}. ${r.adminNotes ? `ملاحظات المسؤول: ${r.adminNotes}` : ''}`,
      Icon: Flag, iconColor: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900/30',
      onDismiss: () => handleDismissReport(r.id)
    }));

    return activities.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [appealNotifications, userIssueUpdates, reportUpdates, handleDismissAppeal, handleDismissIssue, handleDismissReport]);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-20rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const userInitials = user?.displayName ? user.displayName.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : "U");
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">مرحباً، {user?.displayName || 'زائر'}!</h1>
        <p className="text-muted-foreground mt-1">
          هنا تجد ملخصًا لنشاطك وآخر التحديثات على حسابك وعقاراتك.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg hover:shadow-xl transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العقارات النشطة</CardTitle>
            <Home className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.activeListings} / {userStats.maxListings}</div>
            <p className="text-xs text-muted-foreground">بناءً على خطتك الحالية</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المشاهدات</CardTitle>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.propertyViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">على جميع عقاراتك النشطة</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary/80 to-primary hover:shadow-xl transition-smooth">
          <PlusCircle className="h-12 w-12 text-primary-foreground mb-3" />
          <Button onClick={handleAddPropertyClick} variant="secondary" className="w-full transition-smooth hover:shadow-md mt-2">
            أضف عقار جديد
          </Button>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="text-primary"/>
                <span>آخر الأنشطة</span>
                {combinedActivities.length > 0 && <Badge variant="destructive">{combinedActivities.length}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : combinedActivities.length > 0 ? (
                <div className="space-y-4">
                  {combinedActivities.map((item) => {
                    const ItemIcon = item.Icon;
                    return (
                      <div key={item.id} className="flex items-start gap-4 p-3 rounded-lg bg-background hover:bg-muted/50 relative group">
                        <div className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${item.bgColor}`}>
                          <ItemIcon className={`h-5 w-5 ${item.iconColor}`} />
                        </div>
                        <div className="flex-grow">
                          <p className="font-semibold text-sm">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                          <p className="text-xs text-muted-foreground/80 mt-1">{new Date(item.date).toLocaleString('ar-DZ', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 left-1 h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={item.onDismiss}
                          aria-label="إخفاء الإشعار"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-10">
                  <AlertTriangle size={32} className="text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">لا توجد أنشطة حديثة لعرضها.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-md">
            <CardHeader className="items-center text-center">
              <Avatar className="h-20 w-20 border-2 border-primary">
                <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "User"} />
                <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
              </Avatar>
              <CardTitle className="pt-2">{user?.displayName}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Badge variant="outline_primary">خطة {currentPlanDetails?.name || '...'}</Badge>
            </CardContent>
            <CardFooter>
              <Button asChild variant="secondary" className="w-full">
                <Link href="/pricing">الترقية الآن</Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="ghost" className="w-full justify-start">
                <Link href="/dashboard/properties"><ListChecks className="mr-2 ml-2 h-4 w-4" /> عرض كل عقاراتي</Link>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-start">
                <Link href="/dashboard/profile"><UserCircle className="mr-2 ml-2 h-4 w-4" /> تعديل الملف الشخصي</Link>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-start">
                <Link href="/dashboard/settings"><Settings className="mr-2 ml-2 h-4 w-4" /> الإعدادات</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
