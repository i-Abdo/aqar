
"use client";

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Loader2, Eye, Edit, CheckCircle, XCircle, Archive, Gavel } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { collection, getDocs, doc, updateDoc, query, orderBy, Timestamp, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { PropertyAppeal, AppealStatus, AdminAppealDecisionType, Property, UserTrustLevel } from "@/types";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const appealStatusTranslations: Record<AppealStatus, string> = {
  new: 'جديد',
  under_review: 'قيد المراجعة',
  resolved_deleted: 'تم الحل (حذف العقار)',
  resolved_kept_archived: 'تم الحل (إبقاء الأرشفة)',
  resolved_published: 'تم الحل (نشر العقار)',
};

const appealStatusVariants: Record<AppealStatus, "default" | "secondary" | "outline" | "destructive"> = {
  new: 'default',
  under_review: 'secondary',
  resolved_deleted: 'destructive',
  resolved_kept_archived: 'outline',
  resolved_published: 'default', // Consider a success variant if you add one to Badge
};

export default function AdminPropertyAppealsPage() {
  const [appeals, setAppeals] = useState<PropertyAppeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppeal, setSelectedAppeal] = useState<PropertyAppeal | null>(null);
  
  const [isDecisionDialogOpen, setIsDecisionDialogOpen] = useState(false);
  const [decisionType, setDecisionType] = useState<AdminAppealDecisionType | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  
  const { toast } = useToast();

  const fetchAppeals = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, "property_appeals"), orderBy("submittedAt", "desc"));
      const querySnapshot = await getDocs(q);
      const appealsData = querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          submittedAt: (data.submittedAt as Timestamp)?.toDate ? (data.submittedAt as Timestamp).toDate() : new Date(data.submittedAt || Date.now()),
          adminDecisionAt: data.adminDecisionAt ? ((data.adminDecisionAt as Timestamp)?.toDate ? (data.adminDecisionAt as Timestamp).toDate() : new Date(data.adminDecisionAt)) : undefined,
        } as PropertyAppeal;
      });
      setAppeals(appealsData);
    } catch (error) {
      console.error("Error fetching property appeals:", error);
      toast({ title: "خطأ", description: "لم نتمكن من تحميل الطعون.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppeals();
  }, [toast]);

  const openDecisionDialog = (appeal: PropertyAppeal, type: AdminAppealDecisionType) => {
    setSelectedAppeal(appeal);
    setDecisionType(type);
    setAdminNotes(appeal.adminNotes || ""); // Load existing notes if any
    setIsDecisionDialogOpen(true);
  };

  const handleAppealDecision = async () => {
    if (!selectedAppeal || !decisionType) return;
    if (!adminNotes.trim()) {
        toast({ title: "ملاحظات مطلوبة", description: "الرجاء إدخال ملاحظات القرار.", variant: "destructive"});
        return;
    }

    setIsLoading(true);
    try {
      const appealRef = doc(db, "property_appeals", selectedAppeal.id);
      const propertyRef = doc(db, "properties", selectedAppeal.propertyId);
      
      let newAppealStatus: AppealStatus = selectedAppeal.appealStatus;
      let propertyUpdate: Partial<Property> = { updatedAt: Timestamp.now() };
      let ownerUpdate: Partial<{trustLevel: UserTrustLevel, updatedAt: Timestamp}> | null = null;

      switch (decisionType) {
        case 'delete':
          newAppealStatus = 'resolved_deleted';
          propertyUpdate.status = 'deleted';
          propertyUpdate.deletionReason = adminNotes; // Use admin notes as deletion reason
          propertyUpdate.archivalReason = ""; // Clear archival reason
          // Optionally, update owner's trust level if needed here based on policy
          // For now, we don't auto-change trust on delete from appeal, admin can do it via users page
          break;
        case 'keep_archived':
          newAppealStatus = 'resolved_kept_archived';
          propertyUpdate.status = 'archived'; // Ensure it remains archived
          propertyUpdate.archivalReason = adminNotes; // Update archival reason with decision notes
          break;
        case 'publish':
          newAppealStatus = 'resolved_published';
          propertyUpdate.status = 'active';
          propertyUpdate.archivalReason = ""; // Clear archival reason
          propertyUpdate.deletionReason = "";
          // Consider setting owner's trustLevel to 'normal' if published
          ownerUpdate = { trustLevel: 'normal', updatedAt: Timestamp.now() };
          break;
      }

      // Update Appeal Document
      await updateDoc(appealRef, {
        appealStatus: newAppealStatus,
        adminDecision: decisionType,
        adminNotes: adminNotes,
        adminDecisionAt: Timestamp.now(),
      });

      // Update Property Document
      await updateDoc(propertyRef, propertyUpdate);

      // Update Owner's Trust Level (if applicable)
      if (ownerUpdate && selectedAppeal.ownerUserId) {
        const userRef = doc(db, "users", selectedAppeal.ownerUserId);
        await updateDoc(userRef, ownerUpdate);
         toast({ title: "تم تحديث تصنيف المالك", description: `تم تحديث تصنيف المالك إلى ${trustLevelTranslations[ownerUpdate.trustLevel!]}.` });
      }
      
      toast({ title: "تم اتخاذ القرار", description: `تم تحديث حالة الطعن والعقار بنجاح.` });
      fetchAppeals();
      setIsDecisionDialogOpen(false);
      setSelectedAppeal(null);
      setAdminNotes("");
      setDecisionType(null);

    } catch (error) {
      console.error("Error processing appeal decision:", error);
      toast({ title: "خطأ", description: "فشل اتخاذ القرار بشأن الطعن.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateAppealStatusOnly = async (appeal: PropertyAppeal, newStatus: AppealStatus) => {
    setIsLoading(true);
    try {
        const appealRef = doc(db, "property_appeals", appeal.id);
        await updateDoc(appealRef, {
            appealStatus: newStatus,
            adminNotes: appeal.adminNotes || "", // Ensure notes are saved if any
            updatedAt: Timestamp.now() // Assuming 'updatedAt' on appeal doc exists for general updates
        });
        toast({ title: "تم تحديث الحالة", description: `تم تغيير حالة الطعن إلى ${appealStatusTranslations[newStatus]}.` });
        fetchAppeals();
    } catch (error) {
        console.error("Error updating appeal status:", error);
        toast({ title: "خطأ", description: "فشل تحديث حالة الطعن.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  // Translations for trust levels
  const trustLevelTranslations: Record<UserTrustLevel, string> = {
    normal: 'عادي',
    untrusted: 'غير موثوق',
    blacklisted: 'قائمة سوداء',
  };


  if (isLoading && appeals.length === 0) {
    return <div className="flex justify-center items-center py-10"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">إدارة الطعون على العقارات</h1>
      <Card className="shadow-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>عنوان العقار</TableHead>
              <TableHead>مقدم الطعن (Email)</TableHead>
              <TableHead className="max-w-[250px]">سبب الأرشفة الأصلي</TableHead>
              <TableHead>تاريخ التقديم</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="max-w-[200px]">ملاحظات المسؤول</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appeals.map((appeal) => (
              <TableRow key={appeal.id}>
                <TableCell className="font-medium max-w-[180px] truncate" title={appeal.propertyTitle}>
                   <Link href={`/properties/${appeal.propertyId}`} target="_blank" className="hover:underline text-primary">
                    {appeal.propertyTitle}
                  </Link>
                </TableCell>
                <TableCell className="truncate max-w-[150px]" title={appeal.ownerEmail}>{appeal.ownerEmail}</TableCell>
                <TableCell className="text-xs max-w-[200px] truncate" title={appeal.propertyArchivalReason || "غير محدد"}>
                  {appeal.propertyArchivalReason || "غير محدد"}
                </TableCell>
                <TableCell className="text-xs">{new Date(appeal.submittedAt).toLocaleDateString('ar-DZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour:'2-digit', minute:'2-digit' })}</TableCell>
                <TableCell>
                  <Badge variant={appealStatusVariants[appeal.appealStatus]}>
                    {appealStatusTranslations[appeal.appealStatus]}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs max-w-[150px] truncate" title={appeal.adminNotes || "لا يوجد"}>{appeal.adminNotes || "لا يوجد"}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">فتح القائمة</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>خيارات الطعن</DropdownMenuLabel>
                       <DropdownMenuItem onClick={() => window.open(`/properties/${appeal.propertyId}`, '_blank')}><Eye className="mr-2 h-4 w-4" /> عرض العقار</DropdownMenuItem>
                       <DropdownMenuSeparator />
                      {appeal.appealStatus === 'new' && (
                        <DropdownMenuItem onClick={() => handleUpdateAppealStatusOnly(appeal, 'under_review')}>
                          <Edit className="mr-2 h-4 w-4" /> بدء المراجعة
                        </DropdownMenuItem>
                      )}
                       {(appeal.appealStatus === 'new' || appeal.appealStatus === 'under_review') && (
                         <>
                           <DropdownMenuItem onClick={() => openDecisionDialog(appeal, 'publish')} className="text-green-600 focus:text-green-700 focus:bg-green-500/10">
                             <CheckCircle className="mr-2 h-4 w-4" /> نشر العقار
                           </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => openDecisionDialog(appeal, 'keep_archived')}>
                             <Archive className="mr-2 h-4 w-4" /> إبقاء الأرشفة (تحديث السبب)
                           </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => openDecisionDialog(appeal, 'delete')} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                             <XCircle className="mr-2 h-4 w-4" /> حذف العقار
                           </DropdownMenuItem>
                         </>
                       )}
                       {appeal.appealStatus !== 'new' && appeal.appealStatus !== 'under_review' && (
                           <DropdownMenuItem disabled>لا توجد إجراءات إضافية</DropdownMenuItem>
                       )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {appeals.length === 0 && !isLoading && (
          <p className="text-center text-muted-foreground p-6">لا توجد طعون لعرضها حاليًا.</p>
        )}
      </Card>

      {/* Decision Dialog */}
      <AlertDialog open={isDecisionDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setSelectedAppeal(null);
            setAdminNotes("");
            setDecisionType(null);
          }
          setIsDecisionDialogOpen(open);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
                اتخاذ قرار بشأن الطعن: {
                decisionType === 'publish' ? 'نشر العقار' : 
                decisionType === 'keep_archived' ? 'إبقاء العقار مؤرشفًا' :
                decisionType === 'delete' ? 'حذف العقار' : ''
                }
            </AlertDialogTitle>
            <AlertDialogDescription>
              العقار: "{selectedAppeal?.propertyTitle}" (المالك: {selectedAppeal?.ownerEmail})
              <br/>
              سبب الأرشفة الأصلي: {selectedAppeal?.propertyArchivalReason || "غير محدد"}
              <br/>
              الرجاء كتابة ملاحظات توضح سبب قرارك. هذه الملاحظات ستكون سبب الحذف أو الأرشفة الجديد إذا اخترت ذلك.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="ملاحظات القرار..."
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            className="my-2"
            rows={4}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleAppealDecision} disabled={isLoading || !adminNotes.trim()}>
              {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
              تأكيد القرار
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    