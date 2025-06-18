
"use client";

import { useState, useEffect, Fragment } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Loader2, CheckCircle, AlertOctagon, ArchiveX, MessageSquare, Trash2, Archive } from "lucide-react"; // Added Trash2, Archive
import { useToast } from "@/hooks/use-toast";
import { collection, getDocs, doc, updateDoc, query, orderBy, Timestamp, getDoc } from "firebase/firestore"; // Added getDoc
import { db } from "@/lib/firebase/client";
import type { Report, Property } from "@/types"; // Added Property type
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
import { Input } from '@/components/ui/input'; // Added Input
import { Card } from '@/components/ui/card';

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


export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  const [isDeletePropertyDialogOpen, setIsDeletePropertyDialogOpen] = useState(false);
  const [propertyDeletionReason, setPropertyDeletionReason] = useState("");

  const [isArchivePropertyDialogOpen, setIsArchivePropertyDialogOpen] = useState(false);
  const [propertyArchiveNotes, setPropertyArchiveNotes] = useState("");

  const { toast } = useToast();

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, "reports"), orderBy("reportedAt", "desc"));
      const querySnapshot = await getDocs(q);
      const reportsData = querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          reportedAt: (data.reportedAt as Timestamp)?.toDate ? (data.reportedAt as Timestamp).toDate() : new Date(data.reportedAt || Date.now()),
          updatedAt: (data.updatedAt as Timestamp)?.toDate ? (data.updatedAt as Timestamp).toDate() : new Date(data.updatedAt || Date.now()),
        } as Report;
      });
      setReports(reportsData);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({ title: "خطأ", description: "لم نتمكن من تحميل البلاغات.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []); // Removed toast from dependency array to prevent re-fetching on toast

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
    setPropertyArchiveNotes(report.adminNotes || ""); // Pre-fill with report notes if any
    setIsArchivePropertyDialogOpen(true);
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
      };
      if (notes !== undefined) {
        updateData.adminNotes = notes;
      }
      await updateDoc(reportRef, updateData); 
      toast({ title: "تم التحديث", description: `تم تحديث حالة البلاغ إلى "${reportStatusTranslations[status]}".` });
      fetchReports(); 
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

  const confirmDeletePropertyFromReport = async () => {
    if (!selectedReport || !propertyDeletionReason.trim()) {
      toast({ title: "خطأ", description: "سبب الحذف مطلوب.", variant: "destructive" });
      return;
    }
    setIsLoading(true); // Indicate loading for this specific action
    try {
      const propertyRef = doc(db, "properties", selectedReport.propertyId);
      const propertySnap = await getDoc(propertyRef);

      if (!propertySnap.exists()) {
        toast({ title: "خطأ", description: "لم يتم العثور على العقار المبلغ عنه.", variant: "destructive" });
        return;
      }
      const propertyData = propertySnap.data() as Property;
      const ownerUserId = propertyData.userId;

      // Update property
      await updateDoc(propertyRef, { 
        status: 'deleted', 
        deletionReason: propertyDeletionReason,
        updatedAt: Timestamp.now() 
      });

      // Update user as untrusted
      if (ownerUserId) {
        const userRef = doc(db, "users", ownerUserId);
        await updateDoc(userRef, { isTrusted: false, updatedAt: Timestamp.now() });
      }

      // Update report
      const reportNotes = `تم حذف العقار بسبب: "${propertyDeletionReason}". تم تصنيف المالك (${ownerUserId || 'غير معروف'}) كغير موثوق.`;
      await handleUpdateReportStatus(selectedReport.id, 'resolved', reportNotes);
      
      toast({ title: "تم حذف العقار", description: `تم حذف العقار "${selectedReport.propertyTitle}" وتصنيف مالكه كغير موثوق.` });
      setPropertyDeletionReason("");
      setIsDeletePropertyDialogOpen(false);
    } catch (error) {
      console.error("Error deleting property from report:", error);
      toast({ title: "خطأ", description: "فشل حذف العقار أو تحديث المستخدم.", variant: "destructive" });
    } finally {
      setIsLoading(false); // Reset loading indicator
    }
  };

  const confirmArchivePropertyFromReport = async () => {
    if (!selectedReport || !propertyArchiveNotes.trim()) {
      toast({ title: "خطأ", description: "ملاحظات الأرشفة مطلوبة.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const propertyRef = doc(db, "properties", selectedReport.propertyId);
      const propertySnap = await getDoc(propertyRef);

      if (!propertySnap.exists()) {
        toast({ title: "خطأ", description: "لم يتم العثور على العقار المبلغ عنه.", variant: "destructive" });
        return;
      }
      const propertyData = propertySnap.data() as Property;
      const ownerUserId = propertyData.userId;

      // Update property
      await updateDoc(propertyRef, { 
        status: 'archived',
        updatedAt: Timestamp.now()
      });
      
      // Update user as untrusted
      if (ownerUserId) {
        const userRef = doc(db, "users", ownerUserId);
        await updateDoc(userRef, { isTrusted: false, updatedAt: Timestamp.now() });
      }
      
      // Update report
      const reportNotes = `تم أرشفة العقار. ملاحظات الأرشفة: "${propertyArchiveNotes}". تم تصنيف المالك (${ownerUserId || 'غير معروف'}) كغير موثوق.`;
      await handleUpdateReportStatus(selectedReport.id, 'resolved', reportNotes);

      toast({ title: "تم أرشفة العقار", description: `تم أرشفة العقار "${selectedReport.propertyTitle}" وتصنيف مالكه كغير موثوق.` });
      setPropertyArchiveNotes("");
      setIsArchivePropertyDialogOpen(false);
    } catch (error) {
      console.error("Error archiving property from report:", error);
      toast({ title: "خطأ", description: "فشل أرشفة العقار أو تحديث المستخدم.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };


  if (isLoading && reports.length === 0) { // Keep loader only on initial load
    return <div className="flex justify-center items-center py-10"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">إدارة البلاغات</h1>
      <Card className="shadow-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="max-w-[200px]">العقار المُبلغ عنه</TableHead>
              <TableHead>المُبلغ (البريد الإلكتروني)</TableHead>
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
                <TableCell className="max-w-[150px] truncate" title={report.reporterEmail}>{report.reporterEmail}</TableCell>
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
                         <MessageSquare className="mr-2 h-4 w-4" /> {report.adminNotes ? 'تعديل/عرض الملاحظات' : 'إضافة ملاحظات'}
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
                                <DropdownMenuItem onClick={() => {setSelectedReport(report); setAdminNotes(report.adminNotes || ""); setIsNotesDialogOpen(true);}}>
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
                        <Trash2 className="mr-2 h-4 w-4" /> حذف العقار وتصنيف المالك
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openArchivePropertyDialog(report)}>
                        <Archive className="mr-2 h-4 w-4" /> أرشفة العقار وتصنيف المالك
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {reports.length === 0 && !isLoading && (
          <p className="text-center text-muted-foreground p-6">لا توجد بلاغات لعرضها حاليًا.</p>
        )}
      </Card>

      {/* Notes Dialog */}
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
              عرض أو تعديل الملاحظات الخاصة بهذا البلاغ. العقار: "{selectedReport?.propertyTitle}"
              <br/>
              السبب: {selectedReport?.reason} | التعليقات: {selectedReport?.comments}
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
                 حل البلاغ مع حفظ الملاحظات
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

      {/* Delete Property Dialog */}
      <AlertDialog open={isDeletePropertyDialogOpen} onOpenChange={setIsDeletePropertyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حذف العقار وتصنيف المالك</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد أنك تريد حذف العقار "{selectedReport?.propertyTitle}"؟ سيتم نقل العقار إلى المحذوفات، وتصنيف مالكه كـ "غير موثوق".
              الرجاء إدخال سبب الحذف (سيتم إرساله للمالك نظريًا).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input 
            placeholder="سبب الحذف (مثال: مخالفة الشروط، معلومات مضللة)" 
            value={propertyDeletionReason}
            onChange={(e) => setPropertyDeletionReason(e.target.value)}
            className="my-4"
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {setSelectedReport(null); setIsDeletePropertyDialogOpen(false)}}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePropertyFromReport} disabled={isLoading || !propertyDeletionReason.trim()}>
              {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
              تأكيد الحذف والتصنيف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Property Dialog */}
      <AlertDialog open={isArchivePropertyDialogOpen} onOpenChange={setIsArchivePropertyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد أرشفة العقار وتصنيف المالك</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد أنك تريد أرشفة العقار "{selectedReport?.propertyTitle}"؟ سيتم أرشفة العقار، وتصنيف مالكه كـ "غير موثوق".
              الرجاء إدخال ملاحظات الأرشفة (سيتم إرسالها للمالك نظريًا).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="ملاحظات الأرشفة..."
            value={propertyArchiveNotes}
            onChange={(e) => setPropertyArchiveNotes(e.target.value)}
            rows={3}
            className="my-4"
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {setSelectedReport(null); setIsArchivePropertyDialogOpen(false)}}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmArchivePropertyFromReport} disabled={isLoading || !propertyArchiveNotes.trim()}>
              {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
              تأكيد الأرشفة والتصنيف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

