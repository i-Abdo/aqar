
"use client";

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Loader2, CheckCircle, AlertOctagon, ArchiveX, MessageSquare, Trash2, Archive, RefreshCcwDot, UserCheck, UserX, UserCog } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { collection, getDocs, doc, updateDoc, query, orderBy, Timestamp, getDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Report, Property, UserTrustLevel, CustomUser } from "@/types";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

interface EnhancedReport extends Report {
  ownerCurrentTrustLevel?: UserTrustLevel;
  ownerUserId?: string;
}

const reportStatusTranslations: Record<Report['status'], string> = {
  new: 'جديد',
  under_review: 'قيد المراجعة',
  resolved: 'تم الحل',
  dismissed: 'مرفوض',
};

const reportStatusVariants: Record<Report['status'], "default" | "secondary" | "destructive" | "outline"> = {
  new: 'default',
  under_review: 'secondary',
  resolved: 'outline',
  dismissed: 'destructive',
};

const trustLevelTranslations: Record<UserTrustLevel, string> = {
  normal: 'عادي',
  untrusted: 'غير موثوق',
  blacklisted: 'قائمة سوداء',
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<EnhancedReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  const [isDeletePropertyDialogOpen, setIsDeletePropertyDialogOpen] = useState(false);
  const [propertyDeletionReason, setPropertyDeletionReason] = useState("");

  const [isArchivePropertyDialogOpen, setIsArchivePropertyDialogOpen] = useState(false);
  const [propertyArchiveReason, setPropertyArchiveReason] = useState(""); 

  const [isTrustLevelDialogOpen, setIsTrustLevelDialogOpen] = useState(false);
  const [targetUserForTrustLevel, setTargetUserForTrustLevel] = useState<{userId: string, propertyTitle: string, currentTrustLevel: UserTrustLevel} | null>(null);
  const [selectedTrustLevel, setSelectedTrustLevel] = useState<UserTrustLevel>('normal');


  const { toast } = useToast();
  const { refreshAdminNotifications } = useAuth(); // Added

  const fetchReports = async () => {
    setIsLoading(true);
    try {
        // 1. Fetch all reports
        const reportsQuery = query(collection(db, "reports"), orderBy("reportedAt", "desc"));
        const reportsSnapshot = await getDocs(reportsQuery);
        const reportsData = reportsSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Report));

        if (reportsData.length === 0) {
            setReports([]);
            setIsLoading(false);
            return;
        }

        // 2. Collect unique property IDs from reports
        const propertyIds = [...new Set(reportsData.map(r => r.propertyId).filter(Boolean))];
        const propertiesMap = new Map<string, Property>();

        // 3. Fetch all related properties in chunks
        if (propertyIds.length > 0) {
            const propChunks = [];
            for (let i = 0; i < propertyIds.length; i += 30) {
                propChunks.push(propertyIds.slice(i, i + 30));
            }
            // Use __name__ to query by document ID in the web SDK
            const propPromises = propChunks.map(chunk =>
                getDocs(query(collection(db, "properties"), where("__name__", "in", chunk)))
            );
            const propSnapshots = await Promise.all(propPromises);
            propSnapshots.forEach(snapshot => {
                snapshot.forEach(propDoc => {
                    propertiesMap.set(propDoc.id, { id: propDoc.id, ...propDoc.data() } as Property);
                });
            });
        }

        // 4. Collect unique user IDs from the fetched properties
        const userIds = [...new Set(Array.from(propertiesMap.values()).map(p => p.userId).filter(Boolean))];
        const usersMap = new Map<string, { trustLevel: UserTrustLevel }>();

        // 5. Fetch all related users in chunks
        if (userIds.length > 0) {
            const userChunks = [];
            for (let i = 0; i < userIds.length; i += 30) {
                userChunks.push(userIds.slice(i, i + 30));
            }
            const userPromises = userChunks.map(chunk =>
                getDocs(query(collection(db, "users"), where("uid", "in", chunk)))
            );
            const userSnapshots = await Promise.all(userPromises);
            userSnapshots.forEach(snapshot => {
                snapshot.forEach(userDoc => {
                    const userData = userDoc.data() as CustomUser;
                    usersMap.set(userDoc.id, { trustLevel: userData.trustLevel || 'normal' });
                });
            });
        }

        // 6. Combine all data into enhanced reports
        const enhancedReportsData = reportsData.map(report => {
            const property = report.propertyId ? propertiesMap.get(report.propertyId) : undefined;
            const ownerUserId = property?.userId;
            const ownerInfo = ownerUserId ? usersMap.get(ownerUserId) : undefined;
            
            return {
                ...report,
                ownerCurrentTrustLevel: ownerInfo?.trustLevel || 'normal',
                ownerUserId: ownerUserId,
                reportedAt: (report.reportedAt as any)?.toDate ? (report.reportedAt as any).toDate() : new Date(report.reportedAt || Date.now()),
                updatedAt: (report.updatedAt as any)?.toDate ? (report.updatedAt as any).toDate() : new Date(report.updatedAt || Date.now()),
            } as EnhancedReport;
        });

        setReports(enhancedReportsData);
    } catch (error) {
        console.error("Error fetching reports:", error);
        toast({ title: "خطأ", description: "لم نتمكن من تحميل البلاغات.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
};

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openNotesDialog = (report: Report) => {
    setSelectedReport(report);
    setAdminNotes(report.adminNotes || "");
    setIsNotesDialogOpen(true);
  };

  const openDeletePropertyDialog = (report: Report) => {
    setSelectedReport(report);
    setPropertyDeletionReason("");
    setIsDeletePropertyDialogOpen(true);
  };

  const openArchivePropertyDialog = (report: Report) => {
    setSelectedReport(report);
    setPropertyArchiveReason(""); 
    setIsArchivePropertyDialogOpen(true);
  };

  const openTrustLevelDialogForReportOwner = async (report: Report) => {
    if (!report.propertyId) {
        toast({ title: "خطأ", description: "معرف العقار مفقود في البلاغ.", variant: "destructive" });
        return;
    }
    setIsLoading(true);
    try {
        const propRef = doc(db, "properties", report.propertyId);
        const propSnap = await getDoc(propRef);
        if (propSnap.exists() && propSnap.data()?.userId) {
            const ownerUserId = propSnap.data()?.userId;
            const userRef = doc(db, "users", ownerUserId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const currentTrust = userSnap.data()?.trustLevel || 'normal';
                setTargetUserForTrustLevel({ userId: ownerUserId, propertyTitle: report.propertyTitle, currentTrustLevel: currentTrust });
                setSelectedTrustLevel(currentTrust);
                setIsTrustLevelDialogOpen(true);
            } else {
                toast({ title: "خطأ", description: "لم يتم العثور على مالك العقار.", variant: "destructive" });
            }
        } else {
            toast({ title: "خطأ", description: "لم يتم العثور على العقار أو مالكه.", variant: "destructive" });
        }
    } catch (e) {
        toast({ title: "خطأ", description: "فشل تحميل بيانات مالك العقار.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  const handleChangeUserTrustLevel = async () => {
    if (!targetUserForTrustLevel) {
        toast({ title: "خطأ", description: "لم يتم تحديد المستخدم لتغيير التصنيف.", variant: "destructive" });
        return;
    }
    setIsLoading(true);
    try {
        const userRef = doc(db, "users", targetUserForTrustLevel.userId);
        await updateDoc(userRef, { trustLevel: selectedTrustLevel, updatedAt: Timestamp.now() });
        toast({ title: "تم تحديث التصنيف", description: `تم تحديث تصنيف مالك العقار "${targetUserForTrustLevel.propertyTitle}" إلى "${trustLevelTranslations[selectedTrustLevel]}".` });
        await fetchReports(); // Refresh local, ownerCurrentTrustLevel might change
        // No need to call refreshAdminNotifications here as it's not changing the 'new' report count
    } catch (error) {
        console.error("Error changing user trust level:", error);
        toast({ title: "خطأ", description: "فشل تحديث تصنيف المستخدم.", variant: "destructive" });
    } finally {
        setIsLoading(false);
        setIsTrustLevelDialogOpen(false);
        setTargetUserForTrustLevel(null);
    }
  };


  const handleUpdateReportStatus = async (reportId: string, status: Report['status'], notes?: string) => {
    if (!reportId) {
        toast({title: "خطأ", description: "معرف البلاغ مفقود.", variant: "destructive"});
        return;
    }
    try {
      const reportRef = doc(db, "reports", reportId);
      const updateData: Partial<Omit<Report, 'id' | 'reportedAt'>> & { updatedAt: Timestamp } = {
        status,
        updatedAt: Timestamp.now(),
        dismissedByReporter: false, // Create a notification for the reporter
      };
      if (notes !== undefined) {
        updateData.adminNotes = notes;
      }
      await updateDoc(reportRef, updateData);
      toast({ title: "تم التحديث", description: `تم تحديث حالة البلاغ إلى "${reportStatusTranslations[status]}".` });
      await fetchReports();
      await refreshAdminNotifications();
    } catch (error) {
      console.error("Error updating report status:", error);
      toast({ title: "خطأ", description: "فشل تحديث حالة البلاغ.", variant: "destructive" });
    }
    if (isNotesDialogOpen) setIsNotesDialogOpen(false);
    setSelectedReport(null);
    setAdminNotes("");
  };

  const handleSaveNotesAndResolve = async () => {
    if (!selectedReport) return;
    if (!adminNotes.trim()) {
        toast({title: "ملاحظات مطلوبة", description: "الرجاء إدخال ملاحظات المسؤول لحل البلاغ.", variant: "destructive"});
        return;
    }
    await handleUpdateReportStatus(selectedReport.id, 'resolved', adminNotes);
  };

  const confirmPropertyAction = async (actionType: 'delete' | 'archive') => {
    if (!selectedReport) return;
    if (actionType === 'delete' && !propertyDeletionReason.trim()) {
      toast({ title: "خطأ", description: "سبب الحذف مطلوب.", variant: "destructive" });
      return;
    }
    if (actionType === 'archive' && !propertyArchiveReason.trim()) { 
      toast({ title: "خطأ", description: "سبب الأرشفة مطلوب.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const propertyRef = doc(db, "properties", selectedReport.propertyId);
      const propertySnap = await getDoc(propertyRef);

      if (!propertySnap.exists()) {
        toast({ title: "خطأ", description: "لم يتم العثور على العقار المبلغ عنه.", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      const propertyUpdate: Partial<Property> = { updatedAt: Timestamp.now() };
      let reportNotes = "";

      if (actionType === 'delete') {
        propertyUpdate.status = 'deleted';
        propertyUpdate.deletionReason = propertyDeletionReason;
        propertyUpdate.archivalReason = ""; 
        reportNotes = `تم حذف العقار بسبب: "${propertyDeletionReason}". (تصنيف المالك لم يتغير)`;
      } else { 
        propertyUpdate.status = 'archived';
        propertyUpdate.archivalReason = propertyArchiveReason;
        propertyUpdate.deletionReason = ""; 
        reportNotes = `تم أرشفة العقار بسبب: "${propertyArchiveReason}". (تصنيف المالك لم يتغير)`;
      }
      await updateDoc(propertyRef, propertyUpdate);

      await handleUpdateReportStatus(selectedReport.id, 'resolved', reportNotes);

      toast({ title: `تم ${actionType === 'delete' ? 'حذف' : 'أرشفة'} العقار`, description: `تم ${actionType === 'delete' ? 'حذف' : 'أرشفة'} العقار "${selectedReport.propertyTitle}".` });
      // refreshAdminNotifications is called within handleUpdateReportStatus

      if (actionType === 'delete') {
        setPropertyDeletionReason("");
        setIsDeletePropertyDialogOpen(false);
      } else {
        setPropertyArchiveReason("");
        setIsArchivePropertyDialogOpen(false);
      }
    } catch (error) {
      console.error(`Error ${actionType} property from report:`, error);
      toast({ title: "خطأ", description: `فشل ${actionType === 'delete' ? 'حذف' : 'أرشفة'} العقار.`, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivateProperty = async (report: Report) => {
    setIsLoading(true);
    try {
        const propertyRef = doc(db, "properties", report.propertyId);
        const propertySnap = await getDoc(propertyRef);
        if (!propertySnap.exists()) {
            toast({ title: "خطأ", description: "لم يتم العثور على العقار.", variant: "destructive" });
            setIsLoading(false);
            return;
        }

        await updateDoc(propertyRef, { status: 'active', updatedAt: Timestamp.now(), deletionReason: "", archivalReason: "" });

        const reportNotes = `تم إعادة تنشيط العقار. (تصنيف المالك لم يتغير)`;
        await handleUpdateReportStatus(report.id, 'resolved', reportNotes);
        // refreshAdminNotifications is called within handleUpdateReportStatus

        toast({ title: "تمت إعادة التنشيط", description: `تم إعادة تنشيط العقار "${report.propertyTitle}".` });
    } catch (error) {
        console.error("Error reactivating property:", error);
        toast({ title: "خطأ", description: "فشل إعادة تنشيط العقار.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  const renderDropdownMenu = (report: EnhancedReport) => (
      <DropdownMenu>
          <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">فتح القائمة</span>
                  <MoreHorizontal className="h-4 w-4" />
              </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
              <DropdownMenuLabel>إجراءات البلاغ</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                  <Link href={`/properties/${report.propertyId}`} target="_blank">
                      <Eye className="mr-2 h-4 w-4" /> عرض العقار
                  </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openNotesDialog(report)}>
                  <MessageSquare className="mr-2 h-4 w-4" /> {report.adminNotes ? 'تعديل/عرض الملاحظات' : 'إضافة ملاحظات (إرسال رسالة للمبلغ)'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>تغيير حالة البلاغ</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                          <DropdownMenuItem onClick={() => handleUpdateReportStatus(report.id, 'new')}>
                              <AlertOctagon className="mr-2 h-4 w-4 text-blue-500" /> جديد
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateReportStatus(report.id, 'under_review')}>
                              <Loader2 className="mr-2 h-4 w-4 text-yellow-500 animate-spin" /> قيد المراجعة
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setSelectedReport(report); setAdminNotes(report.adminNotes || ""); setIsNotesDialogOpen(true); }}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> تم الحل (مع ملاحظات)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateReportStatus(report.id, 'dismissed')}>
                              <ArchiveX className="mr-2 h-4 w-4 text-red-500" /> مرفوض
                          </DropdownMenuItem>
                      </DropdownMenuSubContent>
                  </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>إجراءات على العقار والمالك</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => openDeletePropertyDialog(report)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                  <Trash2 className="mr-2 h-4 w-4" /> حذف العقار
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openArchivePropertyDialog(report)}>
                  <Archive className="mr-2 h-4 w-4" /> أرشفة العقار
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleReactivateProperty(report)} className="text-green-600 focus:text-green-700 focus:bg-green-500/10">
                  <RefreshCcwDot className="mr-2 h-4 w-4" /> إعادة تنشيط العقار
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openTrustLevelDialogForReportOwner(report)} disabled={!report.propertyId}>
                  <UserCog className="mr-2 h-4 w-4" /> تغيير تصنيف مالك العقار
              </DropdownMenuItem>
          </DropdownMenuContent>
      </DropdownMenu>
  );


  if (isLoading) {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">إدارة البلاغات</h1>
            <p className="text-muted-foreground">
              قم بمراجعة البلاغات المقدمة من المستخدمين حول العقارات. يمكنك اتخاذ إجراءات على العقار أو رفض البلاغات غير الصحيحة.
            </p>
            <Card className="shadow-xl">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="max-w-[200px]"><Skeleton className="h-5 w-40" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                            <TableHead className="max-w-[250px]"><Skeleton className="h-5 w-48" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                            <TableHead className="text-right"><Skeleton className="h-5 w-16" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">إدارة البلاغات</h1>
      <p className="text-muted-foreground">
        قم بمراجعة البلاغات المقدمة من المستخدمين حول العقارات. يمكنك اتخاذ إجراءات على العقار أو رفض البلاغات غير الصحيحة.
      </p>
      
      {/* Mobile View: Cards */}
      <div className="md:hidden space-y-4">
        {reports.map((report) => (
          <Card key={report.id} className="shadow-md">
            <CardHeader>
              <div className="flex justify-between items-start">
                  <CardTitle className="text-base truncate flex-1 pr-2">
                     <Link href={`/properties/${report.propertyId}`} target="_blank" className="hover:underline text-primary">
                        {report.propertyTitle}
                     </Link>
                  </CardTitle>
                  {renderDropdownMenu(report)}
              </div>
              <CardDescription className="pt-1">
                 <Badge variant={reportStatusVariants[report.status]}>
                    {reportStatusTranslations[report.status]}
                  </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-xs text-muted-foreground">المبلغ</p>
                  <p className="truncate" title={report.reporterEmail}>{report.reporterUserId === report.ownerUserId ? "صاحب العقار" : report.reporterEmail}</p>
                </div>
                 <div>
                  <p className="font-semibold text-xs text-muted-foreground">السبب</p>
                  <p className="truncate" title={report.reason}>{report.reason}</p>
                </div>
                 <div>
                  <p className="font-semibold text-xs text-muted-foreground">التعليقات</p>
                  <p className="text-xs truncate" title={report.comments}>{report.comments}</p>
                </div>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
                {new Date(report.reportedAt).toLocaleDateString('ar-DZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Desktop View: Table */}
      <Card className="shadow-xl hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="max-w-[200px]">العقار المُبلغ عنه</TableHead>
              <TableHead>المُبلغ</TableHead>
              <TableHead>السبب</TableHead>
              <TableHead className="max-w-[250px]">التعليقات</TableHead>
              <TableHead>تاريخ البلاغ</TableHead>
              <TableHead>ملاحظات المسؤول</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium max-w-[180px] truncate" title={report.propertyTitle}>
                  <Link href={`/properties/${report.propertyId}`} target="_blank" className="hover:underline text-primary">
                    {report.propertyTitle}
                  </Link>
                </TableCell>
                <TableCell 
                  className="max-w-[150px] truncate" 
                  title={report.reporterUserId === report.ownerUserId ? "صاحب العقار" : report.reporterEmail}
                >
                  {report.ownerUserId && report.reporterUserId === report.ownerUserId ? "صاحب العقار" : report.reporterEmail}
                </TableCell>
                <TableCell className="text-xs max-w-[120px] truncate" title={report.reason}>{report.reason}</TableCell>
                <TableCell className="text-xs max-w-[200px] truncate" title={report.comments}>{report.comments}</TableCell>
                <TableCell className="text-xs">{new Date(report.reportedAt).toLocaleDateString('ar-DZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</TableCell>
                <TableCell className="text-xs max-w-[150px] truncate" title={report.adminNotes || "لا يوجد"}>{report.adminNotes || "لا يوجد"}</TableCell>
                <TableCell>
                  <Badge variant={reportStatusVariants[report.status]}>
                    {reportStatusTranslations[report.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {renderDropdownMenu(report)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {reports.length === 0 && !isLoading && (
          <p className="text-center text-muted-foreground p-6">لا توجد بلاغات لعرضها حاليًا.</p>
        )}
      </Card>

      <AlertDialog open={isNotesDialogOpen} onOpenChange={(open) => {
          setIsNotesDialogOpen(open);
          if (!open) {
            setSelectedReport(null);
            setAdminNotes("");
          }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ملاحظات المسؤول على البلاغ</AlertDialogTitle>
            <AlertDialogDescription>
              عرض أو تعديل الملاحظات الخاصة بهذا البلاغ. عند حل البلاغ، سيتم إرسال هذه الملاحظات كرسالة للمبلغ.
              <br/>
              العقار: "{selectedReport?.propertyTitle}"
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="أدخل ملاحظاتك هنا..."
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={5}
            className="my-2"
          />
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel onClick={() => {setSelectedReport(null); setIsNotesDialogOpen(false); setAdminNotes("");}}>إغلاق</AlertDialogCancel>
            <Button
                onClick={handleSaveNotesAndResolve}
                disabled={isLoading || !adminNotes.trim() || !selectedReport}
                variant="default"
            >
                 {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                 حل البلاغ وإرسال الرسالة
            </Button>
            {selectedReport && (
                 <Button
                    variant="outline"
                    onClick={() => handleUpdateReportStatus(selectedReport.id, selectedReport.status, adminNotes)}
                    disabled={isLoading || !adminNotes.trim()}
                >
                    {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                    حفظ الملاحظات فقط
                </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeletePropertyDialogOpen} onOpenChange={(open) => {
          setIsDeletePropertyDialogOpen(open);
          if (!open) {setSelectedReport(null); setPropertyDeletionReason("");}
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حذف العقار</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف العقار "{selectedReport?.propertyTitle}". الرجاء إدخال سبب الحذف.
              (تصنيف المالك لن يتغير).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="سبب الحذف (مثال: مخالفة الشروط، معلومات مضللة)"
            value={propertyDeletionReason}
            onChange={(e) => setPropertyDeletionReason(e.target.value)}
            className="my-2"
            rows={3}
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {setSelectedReport(null); setIsDeletePropertyDialogOpen(false)}}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmPropertyAction('delete')} disabled={isLoading || !propertyDeletionReason.trim()}>
              {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
              تأكيد الحذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isArchivePropertyDialogOpen} onOpenChange={(open) => {
          setIsArchivePropertyDialogOpen(open);
          if (!open) { setSelectedReport(null); setPropertyArchiveReason("");}
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد أرشفة العقار</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم أرشفة العقار "{selectedReport?.propertyTitle}". الرجاء إدخال سبب الأرشفة.
              (تصنيف المالك لن يتغير).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="سبب الأرشفة..."
            value={propertyArchiveReason}
            onChange={(e) => setPropertyArchiveReason(e.target.value)}
            rows={3}
            className="my-2"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmPropertyAction('archive')} disabled={isLoading || !propertyArchiveReason.trim()}>
              {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
              تأكيد الأرشفة
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isTrustLevelDialogOpen} onOpenChange={(open) => {
          setIsTrustLevelDialogOpen(open);
          if(!open) setTargetUserForTrustLevel(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تغيير تصنيف مالك العقار</AlertDialogTitle>
            <AlertDialogDescription>
              تغيير تصنيف مالك العقار "{targetUserForTrustLevel?.propertyTitle}" (المستخدم: {targetUserForTrustLevel?.userId}).<br/>
              التصنيف الحالي: {targetUserForTrustLevel?.currentTrustLevel ? trustLevelTranslations[targetUserForTrustLevel.currentTrustLevel] : 'غير محدد'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 space-y-2">
            <Label htmlFor="trustLevelChangeDialogReport">التصنيف الجديد</Label>
            <Select value={selectedTrustLevel} onValueChange={(value) => setSelectedTrustLevel(value as UserTrustLevel)}>
                <SelectTrigger id="trustLevelChangeDialogReport">
                    <SelectValue placeholder="اختر تصنيف المالك..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="normal"><UserCheck className="inline-block mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4"/>{trustLevelTranslations.normal}</SelectItem>
                    <SelectItem value="untrusted"><UserX className="inline-block mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4"/>{trustLevelTranslations.untrusted}</SelectItem>
                    <SelectItem value="blacklisted"><UserCog className="inline-block mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4"/>{trustLevelTranslations.blacklisted}</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleChangeUserTrustLevel} disabled={isLoading}>
                {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2"/>}
                تحديث التصنيف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
