
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
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [archiveReason, setArchiveReason] = useState(""); 
  const [targetUserTrustLevel, setTargetUserTrustLevel] = useState<UserTrustLevel>('normal');

  const { toast } = useToast();
  const { refreshAdminNotifications } = useAuth();

  const fetchPendingProperties = async () => {
    setIsLoading(true);
    try {
        const q = query(collection(db, "properties"), where("status", "==", "pending"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const propsData = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Property));

        if (propsData.length === 0) {
            setPendingProperties([]);
            setIsLoading(false);
            return;
        }

        const userIds = [...new Set(propsData.map(p => p.userId).filter(Boolean))];
        const usersMap = new Map<string, { email?: string; trustLevel?: UserTrustLevel }>();

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
                    usersMap.set(userDoc.id, { email: userData.email, trustLevel: userData.trustLevel || 'normal' });
                });
            });
        }

        const resolvedPropsData = propsData.map(prop => {
            const ownerInfo = prop.userId ? usersMap.get(prop.userId) : undefined;
            return {
                ...prop,
                createdAt: (prop.createdAt as unknown as Timestamp)?.toDate ? (prop.createdAt as unknown as Timestamp).toDate() : new Date(prop.createdAt as any),
                updatedAt: (prop.updatedAt as unknown as Timestamp)?.toDate ? (prop.updatedAt as unknown as Timestamp).toDate() : new Date(prop.updatedAt as any),
                ownerEmail: ownerInfo?.email,
                ownerCurrentTrustLevel: ownerInfo?.trustLevel,
            } as PendingProperty;
        });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setArchiveReason(""); 
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
      toast({ title: "تمت الموافقة", description: `تمت الموافقة على العقار "${selectedProperty.title}" وتغيير حالته إلى نشط. (تصنيف المالك لم يتغير)` });
      await fetchPendingProperties();
      await refreshAdminNotifications();
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
      toast({ title: "خطأ", description: "سبب الحذف (الرفض) مطلوب.", variant: "destructive" });
      return;
    }
    if (actionType === 'archive' && !archiveReason.trim()) { 
      toast({ title: "خطأ", description: "سبب الأرشفة (الرفض) مطلوب.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const propRef = doc(db, "properties", selectedProperty.id);
      const propUpdate: Partial<Property> = { updatedAt: Timestamp.now() };
      if (actionType === 'delete') {
        propUpdate.status = 'deleted';
        propUpdate.deletionReason = rejectionReason;
        propUpdate.archivalReason = ""; 
      } else { 
        propUpdate.status = 'archived';
        propUpdate.archivalReason = archiveReason;
        propUpdate.deletionReason = ""; 
      }
      await updateDoc(propRef, propUpdate);
      toast({ title: "تم رفض العقار", description: `تم ${actionType === 'delete' ? 'حذف' : 'أرشفة'} العقار "${selectedProperty.title}". (تصنيف المالك لم يتغير)` });
      await fetchPendingProperties();
      await refreshAdminNotifications();
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
        setArchiveReason(""); 
      }
      setSelectedProperty(null);
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
        await fetchPendingProperties(); // No need to refresh global admin count here as it's not directly related to 'new' items count
    } catch (error) {
        console.error("Error changing user trust level:", error);
        toast({ title: "خطأ", description: "فشل تحديث تصنيف المستخدم.", variant: "destructive" });
    } finally {
        setIsLoading(false);
        setIsTrustLevelDialogOpen(false);
        setSelectedProperty(null);
    }
  };
  
  const renderDropdownMenu = (prop: PendingProperty) => (
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
                  <UserCog className="mr-2 h-4 w-4" /> تغيير تصنيف المالك فقط
              </DropdownMenuItem>
          </DropdownMenuContent>
      </DropdownMenu>
  );


  if (isLoading) {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">مراجعة العقارات المعلقة</h1>
            <Card className="shadow-xl">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[60px]"><Skeleton className="h-5 w-10" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                            <TableHead className="text-right"><Skeleton className="h-5 w-16" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-12 w-12 rounded" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
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
      <h1 className="text-3xl font-bold font-headline">مراجعة العقارات المعلقة</h1>

      {/* Mobile View: Cards */}
      <div className="md:hidden space-y-4">
        {pendingProperties.map((prop) => (
            <Card key={prop.id} className="shadow-md">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3 flex-1 overflow-hidden pr-2">
                            <Image
                                src={prop.imageUrls?.[0] || "https://placehold.co/50x50.png"}
                                alt={prop.title}
                                width={50}
                                height={50}
                                className="rounded-md object-cover"
                                data-ai-hint="house exterior"
                            />
                            <CardTitle className="text-base truncate" title={prop.title}>{prop.title}</CardTitle>
                        </div>
                        {renderDropdownMenu(prop)}
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div>
                        <p className="font-semibold text-xs text-muted-foreground">مالك العقار</p>
                        <p className="truncate" title={prop.ownerEmail || prop.userId}>{prop.ownerEmail || prop.userId}</p>
                    </div>
                     <div>
                        <p className="font-semibold text-xs text-muted-foreground">تصنيف المالك الحالي</p>
                        <Badge variant={prop.ownerCurrentTrustLevel === 'blacklisted' ? 'destructive' : prop.ownerCurrentTrustLevel === 'untrusted' ? 'secondary' : 'default'}>
                            {prop.ownerCurrentTrustLevel ? trustLevelTranslations[prop.ownerCurrentTrustLevel] : 'غير محدد'}
                        </Badge>
                     </div>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                    تاريخ الإرسال: {new Date(prop.createdAt).toLocaleDateString('ar-DZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </CardFooter>
            </Card>
        ))}
      </div>


      {/* Desktop View: Table */}
      <Card className="shadow-xl hidden md:block">
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
                    {renderDropdownMenu(prop)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {pendingProperties.length === 0 && !isLoading && (
          <p className="text-center text-muted-foreground p-6">لا توجد عقارات قيد المراجعة حاليًا.</p>
        )}
      </Card>

      <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد تنشيط العقار</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد أنك تريد تنشيط العقار "{selectedProperty?.title}"؟ سيتم تغيير حالة العقار إلى "نشط".
              (تصنيف المالك لن يتغير).
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

      <AlertDialog open={isRejectDeleteDialogOpen} onOpenChange={(open) => {
          setIsRejectDeleteDialogOpen(open);
          if(!open) { setSelectedProperty(null); setRejectionReason("");}
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف العقار</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم تغيير حالة العقار "{selectedProperty?.title}" إلى "محذوف". الرجاء إدخال سبب الحذف.
              (تصنيف المالك لن يتغير).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="سبب الحذف (مثال: مخالفة الشروط، معلومات مضللة)"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="my-2"
            rows={3}
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

      <AlertDialog open={isRejectArchiveDialogOpen} onOpenChange={(open) => {
          setIsRejectArchiveDialogOpen(open);
          if(!open) setSelectedProperty(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>أرشفة العقار</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم تغيير حالة العقار "{selectedProperty?.title}" إلى "مؤرشف". الرجاء إدخال سبب الأرشفة.
              (تصنيف المالك لن يتغير).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="سبب الأرشفة (مثال: العقار لم يعد متاحًا مؤقتًا)"
            value={archiveReason}
            onChange={(e) => setArchiveReason(e.target.value)}
            className="my-2"
            rows={3}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleConfirmRejection('archive')} disabled={isLoading || !archiveReason.trim()}>
              {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
              تأكيد الأرشفة
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
