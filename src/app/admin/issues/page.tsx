
"use client";

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Loader2, MessageSquare, UserCog, UserCheck, UserX, Mail, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { collection, getDocs, doc, updateDoc, query, orderBy, Timestamp, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { UserIssue, CustomUser, UserTrustLevel } from "@/types";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label"; // Added missing import

const issueStatusTranslations: Record<UserIssue['status'], string> = {
  new: 'جديد',
  in_progress: 'قيد المعالجة',
  resolved: 'تم الحل',
};

const issueStatusVariants: Record<UserIssue['status'], "default" | "secondary" | "outline"> = {
  new: 'default',
  in_progress: 'secondary',
  resolved: 'outline',
};

const trustLevelTranslations: Record<UserTrustLevel, string> = {
  normal: 'عادي',
  untrusted: 'غير موثوق',
  blacklisted: 'قائمة سوداء',
};

export default function AdminUserIssuesPage() {
  const [issues, setIssues] = useState<UserIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<UserIssue | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [targetUserTrustLevel, setTargetUserTrustLevel] = useState<UserTrustLevel>('normal');
  const [currentUserDetails, setCurrentUserDetails] = useState<Partial<CustomUser> | null>(null);
  const { toast } = useToast();

  const fetchIssues = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, "user_issues"), orderBy("submittedAt", "desc"));
      const querySnapshot = await getDocs(q);
      const issuesData = querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          submittedAt: (data.submittedAt as Timestamp)?.toDate ? (data.submittedAt as Timestamp).toDate() : new Date(data.submittedAt || Date.now()),
          updatedAt: (data.updatedAt as Timestamp)?.toDate ? (data.updatedAt as Timestamp).toDate() : new Date(data.updatedAt || Date.now()),
        } as UserIssue;
      });
      setIssues(issuesData);
    } catch (error) {
      console.error("Error fetching user issues:", error);
      toast({ title: "خطأ", description: "لم نتمكن من تحميل مشاكل المستخدمين.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const openDetailsDialog = async (issue: UserIssue) => {
    setSelectedIssue(issue);
    setAdminNotes(issue.adminNotes || "");
    
    // Fetch current user details to display their current trust level
    setIsLoading(true); // Use a loading state for fetching user details
    try {
        const userRef = doc(db, "users", issue.userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const userData = userSnap.data() as CustomUser;
            setCurrentUserDetails({ email: userData.email, trustLevel: userData.trustLevel || 'normal' });
            setTargetUserTrustLevel(userData.trustLevel || 'normal');
        } else {
            setCurrentUserDetails({ email: issue.userEmail, trustLevel: 'normal' }); // Fallback
            setTargetUserTrustLevel('normal');
            toast({ title: "تنبيه", description: "لم يتم العثور على بيانات المستخدم التفصيلية.", variant: "default" });
        }
    } catch (e) {
        toast({ title: "خطأ", description: "فشل تحميل بيانات المستخدم.", variant: "destructive" });
        setCurrentUserDetails({ email: issue.userEmail, trustLevel: 'normal' });
        setTargetUserTrustLevel('normal');
    } finally {
        setIsLoading(false);
    }
    setIsDetailsDialogOpen(true);
  };

  const handleUpdateIssue = async (newStatus?: UserIssue['status']) => {
    if (!selectedIssue) return;
    
    setIsLoading(true);
    try {
      // Update User Trust Level
      if (selectedIssue.userId && currentUserDetails?.trustLevel !== targetUserTrustLevel) {
          const userRef = doc(db, "users", selectedIssue.userId);
          await updateDoc(userRef, { trustLevel: targetUserTrustLevel, updatedAt: Timestamp.now() });
          toast({ title: "تم تحديث تصنيف المستخدم", description: `تم تغيير تصنيف المستخدم إلى ${trustLevelTranslations[targetUserTrustLevel]}.` });
      }

      // Update Issue Status and Notes
      const issueRef = doc(db, "user_issues", selectedIssue.id);
      const updateData: Partial<UserIssue> = { 
        adminNotes: adminNotes.trim() || "",
        updatedAt: Timestamp.now() 
      };
      if (newStatus) {
        updateData.status = newStatus;
      }
      await updateDoc(issueRef, updateData);
      
      toast({ title: "تم تحديث المشكلة", description: `تم ${newStatus ? `تغيير حالة المشكلة إلى ${issueStatusTranslations[newStatus]} و` : ""} حفظ الملاحظات.` });
      fetchIssues();
      setIsDetailsDialogOpen(false);
    } catch (error) {
      console.error("Error updating issue or user trust level:", error);
      toast({ title: "خطأ", description: "فشل تحديث المشكلة أو تصنيف المستخدم.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && issues.length === 0) {
    return <div className="flex justify-center items-center py-10"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">إدارة مشاكل المستخدمين</h1>
      <Card className="shadow-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>معرف المستخدم</TableHead>
              <TableHead>البريد الإلكتروني</TableHead>
              <TableHead className="max-w-[300px]">الرسالة</TableHead>
              <TableHead>تاريخ الإرسال</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issues.map((issue) => (
              <TableRow key={issue.id}>
                <TableCell className="font-medium truncate" title={issue.userId}>{issue.userId}</TableCell>
                <TableCell className="truncate" title={issue.userEmail}>{issue.userEmail}</TableCell>
                <TableCell className="text-xs max-w-[250px] truncate" title={issue.message}>{issue.message}</TableCell>
                <TableCell className="text-xs">{new Date(issue.submittedAt).toLocaleDateString('ar-DZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</TableCell>
                <TableCell>
                  <Badge variant={issueStatusVariants[issue.status]}>
                    {issueStatusTranslations[issue.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => openDetailsDialog(issue)}>
                    <Eye className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" /> عرض وتعديل
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {issues.length === 0 && !isLoading && (
          <p className="text-center text-muted-foreground p-6">لا توجد مشاكل مستخدمين لعرضها حاليًا.</p>
        )}
      </Card>

      {/* Issue Details Dialog */}
      <AlertDialog open={isDetailsDialogOpen} onOpenChange={(open) => {
          setIsDetailsDialogOpen(open);
          if (!open) {
            setSelectedIssue(null); 
            setAdminNotes("");
            setCurrentUserDetails(null);
          }
      }}>
        <AlertDialogContent className="sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>تفاصيل مشكلة المستخدم</AlertDialogTitle>
            <AlertDialogDescription>
              المستخدم: {selectedIssue?.userEmail} (ID: {selectedIssue?.userId})
              <br />
              التصنيف الحالي للمستخدم: {currentUserDetails?.trustLevel ? trustLevelTranslations[currentUserDetails.trustLevel] : 'غير محدد'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div>
                <h4 className="font-semibold mb-1">رسالة المستخدم:</h4>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md whitespace-pre-wrap">{selectedIssue?.message}</p>
            </div>
            <hr/>
            <div>
                <Label htmlFor="adminNotesForIssue">ملاحظات المسؤول:</Label>
                <Textarea
                    id="adminNotesForIssue"
                    placeholder="أدخل ملاحظاتك هنا..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                    className="my-2"
                />
            </div>
            <div>
                <Label htmlFor="userTrustLevelChange">تغيير تصنيف المستخدم:</Label>
                <Select value={targetUserTrustLevel} onValueChange={(value) => setTargetUserTrustLevel(value as UserTrustLevel)}>
                    <SelectTrigger id="userTrustLevelChange">
                        <SelectValue placeholder="اختر تصنيف المالك..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="normal"><UserCheck className="inline-block mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4"/>{trustLevelTranslations.normal}</SelectItem>
                        <SelectItem value="untrusted"><UserX className="inline-block mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4"/>{trustLevelTranslations.untrusted}</SelectItem>
                        <SelectItem value="blacklisted"><UserCog className="inline-block mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4"/>{trustLevelTranslations.blacklisted}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div>
                <Label htmlFor="issueStatusChange">تغيير حالة المشكلة:</Label>
                <Select value={selectedIssue?.status} onValueChange={(value) => setSelectedIssue(prev => prev ? {...prev, status: value as UserIssue['status']} : null )}>
                    <SelectTrigger id="issueStatusChange">
                        <SelectValue placeholder="اختر حالة المشكلة..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="new">{issueStatusTranslations.new}</SelectItem>
                        <SelectItem value="in_progress">{issueStatusTranslations.in_progress}</SelectItem>
                        <SelectItem value="resolved">{issueStatusTranslations.resolved}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
          <AlertDialogFooter className="gap-2 sm:gap-0 pt-4 border-t">
            <AlertDialogCancel>إغلاق</AlertDialogCancel>
            <Button 
                onClick={() => handleUpdateIssue(selectedIssue?.status)} 
                disabled={isLoading}
                variant="default"
            >
                 {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                 حفظ التغييرات
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    