
"use client";

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Loader2, MessageSquare, UserCog, UserCheck, UserX, Mail, Eye, Building } from "lucide-react"; 
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
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label"; 
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

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
  const { refreshAdminNotifications } = useAuth(); // Added

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openDetailsDialog = async (issue: UserIssue) => {
    setSelectedIssue(issue);
    setAdminNotes(issue.adminNotes || "");
    
    setIsLoading(true); 
    try {
        const userRef = doc(db, "users", issue.userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const userData = userSnap.data() as CustomUser;
            setCurrentUserDetails({ email: userData.email, trustLevel: userData.trustLevel || 'normal' });
            setTargetUserTrustLevel(userData.trustLevel || 'normal');
        } else {
            setCurrentUserDetails({ email: issue.userEmail, trustLevel: 'normal' }); 
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
      if (selectedIssue.userId && currentUserDetails?.trustLevel !== targetUserTrustLevel) {
          const userRef = doc(db, "users", selectedIssue.userId);
          await updateDoc(userRef, { trustLevel: targetUserTrustLevel, updatedAt: Timestamp.now() });
          toast({ title: "تم تحديث تصنيف المستخدم", description: `تم تغيير تصنيف المستخدم إلى ${trustLevelTranslations[targetUserTrustLevel]}.` });
      }

      const issueRef = doc(db, "user_issues", selectedIssue.id);
      const updateData: Partial<UserIssue> = { 
        adminNotes: adminNotes.trim() || "",
        updatedAt: Timestamp.now(),
        dismissedByOwner: false, // Ensure not dismissed if admin updates
      };
      if (newStatus) {
        updateData.status = newStatus;
      }
      await updateDoc(issueRef, updateData);
      
      toast({ title: "تم تحديث المشكلة", description: `تم ${newStatus ? `تغيير حالة المشكلة إلى ${issueStatusTranslations[newStatus]} و` : ""} حفظ الملاحظات.` });
      await fetchIssues();
      await refreshAdminNotifications();
      setIsDetailsDialogOpen(false);
    } catch (error) {
      console.error("Error updating issue or user trust level:", error);
      toast({ title: "خطأ", description: "فشل تحديث المشكلة أو تصنيف المستخدم.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">إدارة مشاكل المستخدمين</h1>
            <p className="text-muted-foreground">
              هذه الصفحة تعرض رسائل ومشاكل المستخدمين العامة. يمكنك مراجعتها واتخاذ الإجراءات اللازمة.
            </p>
            <Card className="shadow-xl">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                            <TableHead className="max-w-[250px]"><Skeleton className="h-5 w-48" /></TableHead>
                            <TableHead className="max-w-[200px]"><Skeleton className="h-5 w-40" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                            <TableHead className="text-right"><Skeleton className="h-5 w-24" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-20" /></TableCell>
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
      <h1 className="text-3xl font-bold font-headline">إدارة مشاكل المستخدمين</h1>
      <p className="text-muted-foreground">
        هذه الصفحة تعرض رسائل ومشاكل المستخدمين العامة. يمكنك مراجعتها واتخاذ الإجراءات اللازمة.
      </p>

      {/* Mobile View: Cards */}
      <div className="md:hidden space-y-4">
        {issues.map((issue) => (
          <Card key={issue.id} className="shadow-md">
            <CardHeader>
              <div className="flex justify-between items-start">
                  <CardTitle className="text-sm truncate flex-1 pr-2" title={issue.userEmail}>
                      {issue.userEmail}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => openDetailsDialog(issue)}>
                    <Eye className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" /> عرض
                  </Button>
              </div>
              <CardDescription className="pt-1">
                <Badge variant={issueStatusVariants[issue.status]}>
                  {issueStatusTranslations[issue.status]}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                <p className="line-clamp-2" title={issue.message}><span className="font-semibold">الرسالة:</span> {issue.message}</p>
                {issue.propertyId && issue.propertyTitle && (
                  <p className="truncate">
                    <span className="font-semibold">العقار:</span>
                    <Link href={`/properties/${issue.propertyId}`} target="_blank" className="hover:underline text-primary flex items-center gap-1">
                      <Building size={14}/> {issue.propertyTitle}
                    </Link>
                  </p>
                )}
            </CardContent>
             <CardFooter className="text-xs text-muted-foreground">
                {new Date(issue.submittedAt).toLocaleDateString('ar-DZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
             </CardFooter>
          </Card>
        ))}
      </div>

      {/* Desktop View: Table */}
      <Card className="shadow-xl hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>البريد الإلكتروني للمستخدم</TableHead>
              <TableHead className="max-w-[250px]">الرسالة</TableHead>
              <TableHead className="max-w-[200px]">العقار المعني (إن وجد)</TableHead>
              <TableHead>تاريخ الإرسال</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issues.map((issue) => (
              <TableRow key={issue.id}>
                <TableCell className="truncate" title={issue.userEmail}>{issue.userEmail}</TableCell>
                <TableCell className="text-xs max-w-[250px] truncate" title={issue.message}>{issue.message}</TableCell>
                <TableCell className="text-xs max-w-[200px] truncate">
                  {issue.propertyId && issue.propertyTitle ? (
                    <Link href={`/properties/${issue.propertyId}`} target="_blank" className="hover:underline text-primary flex items-center gap-1">
                      <Building size={14}/> {issue.propertyTitle}
                    </Link>
                  ) : (
                    "لا يوجد"
                  )}
                </TableCell>
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
              {selectedIssue?.propertyTitle && (
                <>
                  <br />
                  بخصوص العقار: <Link href={`/properties/${selectedIssue.propertyId}`} target="_blank" className="hover:underline text-primary">{selectedIssue.propertyTitle}</Link> (ID: {selectedIssue.propertyId})
                </>
              )}
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
                        <SelectItem value="new">{issueStatusTranslations.new} (جديد)</SelectItem>
                        <SelectItem value="in_progress">{issueStatusTranslations.in_progress} (تم الاستلام / قيد المعالجة)</SelectItem>
                        <SelectItem value="resolved">{issueStatusTranslations.resolved} (تم الحل)</SelectItem>
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
