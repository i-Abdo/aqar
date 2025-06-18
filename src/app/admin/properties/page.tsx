
"use client";

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Archive, Eye, Loader2, RefreshCcwDot, UserCog, UserCheck, UserX, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { collection, getDocs, doc, updateDoc, query, orderBy, Timestamp, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Property, UserTrustLevel, CustomUser } from "@/types";
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
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';

interface AdminProperty extends Property {
  ownerEmail?: string;
  ownerCurrentTrustLevel?: UserTrustLevel;
}


const trustLevelTranslations: Record<UserTrustLevel, string> = {
  normal: 'عادي',
  untrusted: 'غير موثوق',
  blacklisted: 'قائمة سوداء',
};

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<AdminProperty | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [isTrustLevelDialogOpen, setIsTrustLevelDialogOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [archiveReason, setArchiveReason] = useState(""); // New state for archive reason
  const [targetUserTrustLevel, setTargetUserTrustLevel] = useState<UserTrustLevel>('normal');
  const { toast } = useToast();

  const fetchAllProperties = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, "properties"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const propsDataPromises = querySnapshot.docs.map(async (docSnap) => {
        const data = docSnap.data() as Property;
        let ownerEmail: string | undefined = undefined;
        let ownerCurrentTrustLevel: UserTrustLevel | undefined = 'normal';

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
        } as AdminProperty;
      });
      const resolvedPropsData = await Promise.all(propsDataPromises);
      setProperties(resolvedPropsData);
    } catch (error) {
      console.error("Error fetching all properties:", error);
      toast({ title: "خطأ", description: "لم نتمكن من تحميل العقارات.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchAllProperties();
  }, []);

  const openDeleteDialog = (property: AdminProperty) => {
    setSelectedProperty(property);
    setDeleteReason("");
    setIsDeleteDialogOpen(true);
  };

  const openArchiveDialog = (property: AdminProperty) => {
    setSelectedProperty(property);
    setArchiveReason(""); // Reset archive reason
    setIsArchiveDialogOpen(true);
  };

  const openTrustLevelDialog = (property: AdminProperty) => {
    setSelectedProperty(property);
    setTargetUserTrustLevel(property.ownerCurrentTrustLevel || 'normal');
    setIsTrustLevelDialogOpen(true);
  };

  const handleSoftDeleteProperty = async () => {
    if (!selectedProperty || !deleteReason.trim()) {
      toast({title: "خطأ", description: "سبب الحذف مطلوب.", variant: "destructive"});
      return;
    }
    setIsLoading(true);
    try {
      const propRef = doc(db, "properties", selectedProperty.id);
      await updateDoc(propRef, { status: 'deleted', deletionReason: deleteReason, archivalReason: "", updatedAt: Timestamp.now() });
      toast({ title: "تم الحذف", description: `تم نقل العقار "${selectedProperty.title}" إلى المحذوفات.` });
      fetchAllProperties(); // Refresh list
    } catch (error) {
      toast({ title: "خطأ", description: "فشل حذف العقار.", variant: "destructive" });
    } finally {
        setIsLoading(false);
        setIsDeleteDialogOpen(false);
        setSelectedProperty(null);
        setDeleteReason("");
    }
  };

  const handleArchiveProperty = async () => {
    if (!selectedProperty || !archiveReason.trim()) { // Check for archive reason
      toast({title: "خطأ", description: "سبب الأرشفة مطلوب.", variant: "destructive"});
      return;
    }
    setIsLoading(true);
    try {
      const propRef = doc(db, "properties", selectedProperty.id);
      await updateDoc(propRef, { status: 'archived', archivalReason: archiveReason, deletionReason: "", updatedAt: Timestamp.now() });
      toast({ title: "تمت الأرشفة", description: `تم أرشفة العقار "${selectedProperty.title}".` });
      fetchAllProperties(); // Refresh list
    } catch (error) {
      toast({ title: "خطأ", description: "فشل أرشفة العقار.", variant: "destructive" });
    } finally {
        setIsLoading(false);
        setIsArchiveDialogOpen(false);
        setSelectedProperty(null);
        setArchiveReason(""); // Reset archive reason
    }
  };

  const handleReactivateProperty = async (property: AdminProperty) => {
    setIsLoading(true);
    try {
        const propRef = doc(db, "properties", property.id);
        await updateDoc(propRef, { status: 'active', deletionReason: "", archivalReason: "", updatedAt: Timestamp.now() });
        toast({ title: "تمت إعادة التنشيط", description: `تم إعادة تنشيط العقار "${property.title}". (تصنيف المالك لم يتغير)` });
        fetchAllProperties(); // Refresh list
    } catch (error) {
        console.error("Error reactivating property:", error);
        toast({ title: "خطأ", description: "فشل إعادة تنشيط العقار.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  const handleChangeUserTrustLevel = async () => {
    if (!selectedProperty || !selectedProperty.userId) {
        toast({ title: "خطأ", description: "معرف المستخدم مفقود للعقار المحدد.", variant: "destructive" });
        return;
    }
    setIsLoading(true);
    try {
        const userRef = doc(db, "users", selectedProperty.userId);
        await updateDoc(userRef, { trustLevel: targetUserTrustLevel, updatedAt: Timestamp.now() });
        toast({ title: "تم تحديث التصنيف", description: `تم تحديث تصنيف مالك العقار "${selectedProperty.title}" إلى "${trustLevelTranslations[targetUserTrustLevel]}".` });
        fetchAllProperties();
    } catch (error) {
        console.error("Error changing user trust level:", error);
        toast({ title: "خطأ", description: "فشل تحديث تصنيف المستخدم.", variant: "destructive" });
    } finally {
        setIsLoading(false);
        setIsTrustLevelDialogOpen(false);
        setSelectedProperty(null);
    }
  };


  if (isLoading && properties.length === 0) {
    return <div className="flex justify-center items-center py-10"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  const getStatusVariant = (status: Property['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'deleted': return 'destructive';
      case 'archived': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">إدارة جميع العقارات</h1>
      <Card className="shadow-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">صورة</TableHead>
              <TableHead>العنوان</TableHead>
              <TableHead>السعر</TableHead>
              <TableHead>المالك (Email)</TableHead>
              <TableHead>تصنيف المالك</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>تاريخ الإنشاء</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.map((prop) => (
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
                <TableCell>{prop.price.toLocaleString()} د.ج</TableCell>
                <TableCell className="max-w-[150px] truncate" title={prop.ownerEmail || prop.userId}>{prop.ownerEmail || prop.userId}</TableCell>
                <TableCell>
                  <Badge variant={prop.ownerCurrentTrustLevel === 'blacklisted' ? 'destructive' : prop.ownerCurrentTrustLevel === 'untrusted' ? 'secondary' : 'default'}>
                      {prop.ownerCurrentTrustLevel ? trustLevelTranslations[prop.ownerCurrentTrustLevel] : 'غير محدد'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(prop.status)}>
                    {prop.status === 'active' ? 'نشط' :
                     prop.status === 'pending' ? 'قيد المراجعة' :
                     prop.status === 'deleted' ? 'محذوف' :
                     prop.status === 'archived' ? 'مؤرشف' : prop.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(prop.createdAt).toLocaleDateString('ar-DZ')}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">فتح القائمة</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>إجراءات العقار</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => window.open(`/properties/${prop.id}`, '_blank')}><Eye className="mr-2 h-4 w-4" /> عرض التفاصيل</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {prop.status === 'pending' && (
                        <DropdownMenuItem onClick={() => handleReactivateProperty(prop)} className="text-green-600 focus:text-green-700 focus:bg-green-500/10">
                            <CheckCircle className="mr-2 h-4 w-4" /> تفعيل العقار
                        </DropdownMenuItem>
                      )}
                      {(prop.status === 'deleted' || prop.status === 'archived') && (
                        <DropdownMenuItem onClick={() => handleReactivateProperty(prop)} className="text-green-600 focus:text-green-700 focus:bg-green-500/10">
                          <RefreshCcwDot className="mr-2 h-4 w-4" /> إعادة تنشيط
                        </DropdownMenuItem>
                      )}
                      {prop.status !== 'deleted' && prop.status !== 'archived' && prop.status !== 'pending' && (
                        <DropdownMenuItem onClick={() => openDeleteDialog(prop)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                          <Trash2 className="mr-2 h-4 w-4" /> حذف (نقل للمحذوفات)
                        </DropdownMenuItem>
                      )}
                       {(prop.status === 'active' || prop.status === 'pending') && (
                        <DropdownMenuItem onClick={() => openArchiveDialog(prop)}>
                          <Archive className="mr-2 h-4 w-4" /> أرشفة
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>إجراءات المالك</DropdownMenuLabel>
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
         {properties.length === 0 && !isLoading && <p className="text-center text-muted-foreground p-6">لا توجد عقارات لعرضها.</p>}
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if(!open) { setSelectedProperty(null); setDeleteReason(""); }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد أنك تريد حذف العقار "{selectedProperty?.title}"؟ سيتم نقل العقار إلى قائمة المحذوفات.
              الرجاء إدخال سبب الحذف. (تصنيف المالك لن يتغير).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="سبب الحذف (مثال: مخالفة الشروط، طلب المالك)"
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            className="my-2"
            rows={3}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleSoftDeleteProperty} disabled={isLoading || !deleteReason.trim()}>
                {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2"/>}
                حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Dialog */}
      <AlertDialog open={isArchiveDialogOpen} onOpenChange={(open) => {
          setIsArchiveDialogOpen(open);
          if(!open) setSelectedProperty(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الأرشفة</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد أنك تريد أرشفة العقار "{selectedProperty?.title}"؟ الرجاء إدخال سبب الأرشفة. (تصنيف المالك لن يتغير).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="سبب الأرشفة (مثال: العقار لم يعد متوفرًا مؤقتًا، يحتاج لتحديثات)"
            value={archiveReason}
            onChange={(e) => setArchiveReason(e.target.value)}
            className="my-2"
            rows={3}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchiveProperty} disabled={isLoading || !archiveReason.trim()}>
                {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2"/>}
                أرشفة
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
              <br/>
              التصنيف الحالي: {selectedProperty?.ownerCurrentTrustLevel ? trustLevelTranslations[selectedProperty.ownerCurrentTrustLevel] : 'غير محدد'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 space-y-2">
            <Label htmlFor="trustLevelChange">التصنيف الجديد</Label>
            <Select value={targetUserTrustLevel} onValueChange={(value) => setTargetUserTrustLevel(value as UserTrustLevel)}>
                <SelectTrigger id="trustLevelChange">
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
