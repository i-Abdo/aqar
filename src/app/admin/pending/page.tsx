
"use client";

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Loader2, CheckCircle, XCircle, Archive, UserCog, UserCheck, UserX, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { collection, getDocs, doc, updateDoc, query, where, orderBy, Timestamp, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Property, CustomUser, UserTrustLevel } from "@/types";
import Link from "next/link";
import Image from "next/image";
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
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface PendingProperty extends Property {
  ownerEmail?: string;
  ownerCurrentTrustLevel?: UserTrustLevel;
}

const trustLevelTranslations: Record<UserTrustLevel, string> = {
  normal: 'عادي',
  untrusted: 'غير موثوق',
  blacklisted: 'قائمة سوداء',
};

export default function AdminPendingPropertiesPage() {
  const [pendingProperties, setPendingProperties] = useState<PendingProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<PendingProperty | null>(null);
  
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDeleteDialogOpen, setIsRejectDeleteDialogOpen] = useState(false);
  const [isRejectArchiveDialogOpen, setIsRejectArchiveDialogOpen] = useState(false);
  const [isTrustLevelDialogOpen, setIsTrustLevelDialogOpen] = useState(false);

  const [rejectionReason, setRejectionReason] = useState("");
  const [targetUserTrustLevel, setTargetUserTrustLevel] = useState<UserTrustLevel>('normal'); // Default for trust level dialog

  const { toast } = useToast();

  const fetchPendingProperties = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, "properties"), where("status", "==", "pending"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const propsDataPromises = querySnapshot.docs.map(async (docSnap) => {
        const data = docSnap.data() as Property;
        let ownerEmail: string | undefined = undefined;
        let ownerCurrentTrustLevel: UserTrustLevel | undefined = undefined;

        if (data.userId) {
          const userRef = doc(db, "users", data.userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data() as CustomUser;
            ownerEmail = userData.email;
            ownerCurrentTrustLevel = userData.trustLevel || 'normal';
          }
        }
        return {
          id: docSnap.id,
          ...data,
          createdAt: (data.createdAt as unknown as Timestamp)?.toDate ? (data.createdAt as unknown as Timestamp).toDate() : new Date(data.createdAt as any),
          updatedAt: (data.updatedAt as unknown as Timestamp)?.toDate ? (data.updatedAt as unknown as Timestamp).toDate() : new Date(data.updatedAt as any),
          ownerEmail,
          ownerCurrentTrustLevel,
        } as PendingProperty;
      });
      const resolvedPropsData = await Promise.all(propsDataPromises);
      setPendingProperties(resolvedPropsData);
    } catch (error) {
      console.error("Error fetching pending properties:", error);
      toast({ title: "خطأ", description: "لم نتمكن من تحميل العقارات قيد المراجعة.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingProperties();
  }, []);

  const openApproveDialog = (property: PendingProperty) => {
    setSelectedProperty(property);
    setIsApproveDialogOpen(true);
  };

  const openRejectDeleteDialog = (property: PendingProperty) => {
    setSelectedProperty(property);
    setRejectionReason("");
    setIsRejectDeleteDialogOpen(true);
  };
  
  const openRejectArchiveDialog = (property: PendingProperty) => {
    setSelectedProperty(property);
    setIsRejectArchiveDialogOpen(true);
  };

  const openTrustLevelDialog = (property: PendingProperty) => {
    setSelectedProperty(property);
    setTargetUserTrustLevel(property.ownerCurrentTrustLevel || 'normal');
    setIsTrustLevelDialogOpen(true);
  };

  const handleApproveProperty = async () => {
    if (!selectedProperty) return;
    setIsLoading(true);
    try {
      const propRef = doc(db, "properties", selectedProperty.id);
      await updateDoc(propRef, { status: 'active', updatedAt: Timestamp.now() });

      toast({ title: "تمت الموافقة", description: `تمت الموافقة على العقار "${selectedProperty.title}" وتغيير حالته إلى نشط.` });
      fetchPendingProperties();
    } catch (error) {
      console.error("Error approving property:", error);
      toast({ title: "خطأ", description: "فشل الموافقة على العقار.", variant: "destructive" });
    } finally {
      setIsLoading(false);
      setIsApproveDialogOpen(false);
      setSelectedProperty(null);
    }
  };

  const handleConfirmRejection = async (actionType: 'delete' | 'archive') => {
    if (!selectedProperty) return;
    if (actionType === 'delete' && !rejectionReason.trim()) {
      toast({ title: "خطأ", description: "سبب الرفض (الحذف) مطلوب.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const propRef = doc(db, "properties", selectedProperty.id);
      const propUpdate: Partial<Property> = { updatedAt: Timestamp.now() };
      if (actionType === 'delete') {
        propUpdate.status = 'deleted';
        propUpdate.deletionReason = rejectionReason;
      } else { // archive
        propUpdate.status = 'archived';
      }
      await updateDoc(propRef, propUpdate);
      
      toast({ title: "تم رفض العقار", description: `تم ${actionType === 'delete' ? 'حذف' : 'أرشفة'} العقار "${selectedProperty.title}".` });
      fetchPendingProperties();
    } catch (error) {
      console.error(`Error rejecting property (${actionType}):`, error);
      toast({ title: "خطأ", description: `فشل ${actionType === 'delete' ? 'حذف' : 'أرشفة'} العقار.`, variant: "destructive" });
    } finally {
      setIsLoading(false);
      if (actionType === 'delete') {
        setIsRejectDeleteDialogOpen(false);
        setRejectionReason("");
      } else {
        setIsRejectArchiveDialogOpen(false);
      }
      setSelectedProperty(null);
    }
  };
  
  const handleChangeUserTrustLevel = async () => {
    if (!selectedProperty || !selectedProperty.userId) { // Ensure userId exists
        toast({ title: "خطأ", description: "معرف المستخدم مفقود للعقار المحدد.", variant: "destructive" });
        return;
    }
    setIsLoading(true);
    try {
        const userRef = doc(db, "users", selectedProperty.userId);
        await updateDoc(userRef, { trustLevel: targetUserTrustLevel, updatedAt: Timestamp.now() });
        toast({ title: "تم تحديث التصنيف", description: `تم تحديث تصنيف مالك العقار "${selectedProperty.title}" إلى "${trustLevelTranslations[targetUserTrustLevel]}".` });
        fetchPendingProperties(); 
    } catch (error) {
        console.error("Error changing user trust level:", error);
        toast({ title: "خطأ", description: "فشل تحديث تصنيف المستخدم.", variant: "destructive" });
    } finally {
        setIsLoading(false);
        setIsTrustLevelDialogOpen(false);
        setSelectedProperty(null);
    }
  };


  if (isLoading && pendingProperties.length === 0) {
    return <div className="flex justify-center items-center py-10"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">مراجعة العقارات المعلقة</h1>
      <Card className="shadow-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">صورة</TableHead>
              <TableHead>العنوان</TableHead>
              <TableHead>مالك العقار (Email)</TableHead>
              <TableHead>تصنيف المالك الحالي</TableHead>
              <TableHead>تاريخ الإرسال</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingProperties.map((prop) => (
              <TableRow key={prop.id}>
                <TableCell>
                  <Image 
                    src={prop.imageUrls?.[0] || "https://placehold.co/50x50.png"} 
                    alt={prop.title} 
                    width={50} 
                    height={50} 
                    className="rounded object-cover"
                    data-ai-hint="house exterior"
                  />
                </TableCell>
                <TableCell className="font-medium max-w-[200px] truncate" title={prop.title}>{prop.title}</TableCell>
                <TableCell className="max-w-[150px] truncate" title={prop.ownerEmail || prop.userId}>{prop.ownerEmail || prop.userId}</TableCell>
                <TableCell>
                    <Badge variant={prop.ownerCurrentTrustLevel === 'blacklisted' ? 'destructive' : prop.ownerCurrentTrustLevel === 'untrusted' ? 'secondary' : 'default'}>
                        {prop.ownerCurrentTrustLevel ? trustLevelTranslations[prop.ownerCurrentTrustLevel] : 'غير محدد'}
                    </Badge>
                </TableCell>
                <TableCell className="text-xs">{new Date(prop.createdAt).toLocaleDateString('ar-DZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">فتح القائمة</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>إجراءات المراجعة</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => window.open(`/properties/${prop.id}`, '_blank')}><Eye className="mr-2 h-4 w-4" /> عرض العقار</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => openApproveDialog(prop)} className="text-green-600 focus:text-green-700 focus:bg-green-500/10">
                        <CheckCircle className="mr-2 h-4 w-4" /> تنشيط العقار
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openRejectDeleteDialog(prop)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash2 className="mr-2 h-4 w-4" /> حذف العقار
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openRejectArchiveDialog(prop)}>
                        <Archive className="mr-2 h-4 w-4" /> أرشفة العقار
                      </DropdownMenuItem>
                       <DropdownMenuSeparator />
                       <DropdownMenuItem onClick={() => openTrustLevelDialog(prop)} disabled={!prop.userId}>
                         <UserCog className="mr-2 h-4 w-4" /> تغيير تصنيف المالك
                       </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {pendingProperties.length === 0 && !isLoading && (
          <p className="text-center text-muted-foreground p-6">لا توجد عقارات قيد المراجعة حاليًا.</p>
        )}
      </Card>

      {/* Approve Dialog */}
      <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد تنشيط العقار</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد أنك تريد تنشيط العقار "{selectedProperty?.title}"؟ سيتم تغيير حالة العقار إلى "نشط".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedProperty(null)}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleApproveProperty} disabled={isLoading}>
              {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
              تنشيط
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject (Delete) Dialog */}
      <AlertDialog open={isRejectDeleteDialogOpen} onOpenChange={(open) => {
          setIsRejectDeleteDialogOpen(open);
          if(!open) { setSelectedProperty(null); setRejectionReason("");}
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف العقار</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم تغيير حالة العقار "{selectedProperty?.title}" إلى "محذوف". الرجاء إدخال سبب الحذف.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input 
            placeholder="سبب الحذف (مثال: مخالفة الشروط، معلومات مضللة)" 
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="my-2"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleConfirmRejection('delete')} disabled={isLoading || !rejectionReason.trim()}>
              {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
              تأكيد الحذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject (Archive) Dialog */}
      <AlertDialog open={isRejectArchiveDialogOpen} onOpenChange={(open) => {
          setIsRejectArchiveDialogOpen(open);
          if(!open) setSelectedProperty(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>أرشفة العقار</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم تغيير حالة العقار "{selectedProperty?.title}" إلى "مؤرشف".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleConfirmRejection('archive')} disabled={isLoading}>
              {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
              تأكيد الأرشفة
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change User Trust Level Dialog */}
      <AlertDialog open={isTrustLevelDialogOpen} onOpenChange={(open) => {
          setIsTrustLevelDialogOpen(open);
          if(!open) setSelectedProperty(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تغيير تصنيف مالك العقار</AlertDialogTitle>
            <AlertDialogDescription>
              تغيير تصنيف مالك العقار "{selectedProperty?.title}" (المستخدم: {selectedProperty?.ownerEmail || selectedProperty?.userId}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 space-y-2">
            <Label htmlFor="trustLevelChangeDialog">التصنيف الجديد</Label>
            <Select value={targetUserTrustLevel} onValueChange={(value) => setTargetUserTrustLevel(value as UserTrustLevel)}>
                <SelectTrigger id="trustLevelChangeDialog">
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
            <AlertDialogAction onClick={handleChangeUserTrustLevel} disabled={isLoading || !selectedProperty?.userId}>
                {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2"/>}
                تحديث التصنيف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}


    