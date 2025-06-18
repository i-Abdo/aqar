
"use client";

import { useState, useEffect, Fragment } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Loader2, CheckCircle, AlertOctagon, ArchiveX, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { collection, getDocs, doc, updateDoc, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Report } from "@/types";
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
  }, [toast]);

  const openNotesDialog = (report: Report) => {
    setSelectedReport(report);
    setAdminNotes(report.adminNotes || "");
    setIsNotesDialogOpen(true);
  };

  const handleUpdateReportStatus = async (reportId: string, status: Report['status'], notes?: string) => {
    if (!reportId) {
        toast({title: "خطأ", description: "معرف البلاغ مفقود.", variant: "destructive"});
        return;
    }
    try {
      const reportRef = doc(db, "reports", reportId);
      const updateData: Partial<Omit<Report, 'id' | 'reportedAt'>> & { updatedAt: Timestamp } = { // Ensure only updatable fields + updatedAt
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


  if (isLoading) {
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
                      <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
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
                          <span>تغيير الحالة</span>
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

      {}
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
                disabled={!adminNotes.trim() || !selectedReport}
                variant="default"
            >
                 حل البلاغ مع حفظ الملاحظات
            </Button>
            {selectedReport && (
                 <Button 
                    variant="outline" 
                    onClick={() => handleUpdateReportStatus(selectedReport.id, selectedReport.status, adminNotes)}
                    disabled={!adminNotes.trim()}
                >
                    حفظ الملاحظات فقط
                </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
