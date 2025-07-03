
"use client";

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Archive, Eye, Loader2, RefreshCcwDot, UserCog, UserCheck, UserX, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { collection, getDocs, doc, updateDoc, query, orderBy, Timestamp, getDoc, where } from "firebase/firestore";
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
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDisplayPrice } from '@/lib/utils';

interface AdminProperty extends Property {
  ownerEmail?: string;
  ownerCurrentTrustLevel?: UserTrustLevel;
}


const trustLevelTranslations: Record<UserTrustLevel, string> = {
  normal: 'عادي',
  untrusted: 'غير موثوق',
  blacklisted: 'قائمة سوداء',
};

const getStatusDisplay = (status: Property['status']): { text: string; variant: "default" | "secondary" | "destructive" | "outline" } => {
    switch (status) {
      case 'active': return { text: 'نشط', variant: 'default' };
      case 'pending': return { text: 'قيد المراجعة', variant: 'secondary' };
      case 'deleted': return { text: 'محذوف', variant: 'destructive' };
      case 'archived': return { text: 'مؤرشف', variant: 'outline' };
      default: return { text: status, variant: 'secondary' };
    }
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
      // 1. Fetch all properties
      const propsQuery = query(collection(db, "properties"), orderBy("createdAt", "desc"));
      const propsSnapshot = await getDocs(propsQuery);
      const propsData = propsSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Property));

      if (propsData.length === 0) {
        setProperties([]);
        setIsLoading(false);
        return;
      }
      
      // 2. Collect unique user IDs
      const userIds = [...new Set(propsData.map(p => p.userId).filter(Boolean))];
      const usersMap = new Map<string, { email?: string; trustLevel?: UserTrustLevel }>();

      // 3. Fetch users in chunks of 30 (Firestore 'in' query limit)
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

      // 4. Combine properties with their owner's data
      const resolvedPropsData = propsData.map(prop => {
        const ownerInfo = prop.userId ? usersMap.get(prop.userId) : undefined;
        return {
          id: prop.id,
          ...prop,
          createdAt: (prop.createdAt as unknown as Timestamp)?.toDate ? (prop.createdAt as unknown as Timestamp).toDate() : new Date(prop.createdAt as any),
          updatedAt: (prop.updatedAt as unknown as Timestamp)?.toDate ? (prop.updatedAt as unknown as Timestamp).toDate() : new Date(prop.updatedAt as any),
          ownerEmail: ownerInfo?.email,
          ownerCurrentTrustLevel: ownerInfo?.trustLevel,
        } as AdminProperty;
      });
      
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const renderDropdownMenu = (prop: AdminProperty) => (
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
  );

  if (isLoading) {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">إدارة جميع العقارات</h1>
            <p className="text-muted-foreground">
              هذه الصفحة توفر نظرة شاملة على جميع العقارات في النظام. استخدمها للوصول السريع والإدارة المتقدمة.
            </p>
            <Card className="shadow-xl">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]"><Skeleton className="h-5 w-16" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                            <TableHead className="text-right"><Skeleton className="h-5 w-16" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-12 w-12 rounded" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
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
      <h1 className="text-3xl font-bold font-headline">إدارة جميع العقارات</h1>
      <p className="text-muted-foreground">
        هذه الصفحة توفر نظرة شاملة على جميع العقارات في النظام. استخدمها للوصول السريع والإدارة المتقدمة.
      </p>
      
      {/* Mobile View: Cards */}
      <div className="md:hidden space-y-4">
        {properties.map((prop) => {
            const status = getStatusDisplay(prop.status);
            return (
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
                        <CardDescription className="pt-2">
                            <Badge variant={status.variant}>{status.text}</Badge>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div>
                            <p className="font-semibold text-xs text-muted-foreground">السعر</p>
                            <p>{formatDisplayPrice(prop.price)}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-xs text-muted-foreground">المالك</p>
                            <p className="truncate" title={prop.ownerEmail || prop.userId}>{prop.ownerEmail || prop.userId}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-xs text-muted-foreground">تصنيف المالك</p>
                            <Badge variant={prop.ownerCurrentTrustLevel === 'blacklisted' ? 'destructive' : prop.ownerCurrentTrustLevel === 'untrusted' ? 'secondary' : 'default'}>
                                {prop.ownerCurrentTrustLevel ? trustLevelTranslations[prop.ownerCurrentTrustLevel] : 'غير محدد'}
                            </Badge>
                        </div>
                    </CardContent>
                    <CardFooter className="text-xs text-muted-foreground">
                        تاريخ الإنشاء: {new Date(prop.createdAt).toLocaleDateString('ar-DZ')}
                    </CardFooter>
                </Card>
            )
        })}
      </div>

      {/* Desktop View: Table */}
      <Card className="shadow-xl hidden md:block">
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
                <TableCell>{formatDisplayPrice(prop.price)}</TableCell>
                <TableCell className="max-w-[150px] truncate" title={prop.ownerEmail || prop.userId}>{prop.ownerEmail || prop.userId}</TableCell>
                <TableCell>
                  <Badge variant={prop.ownerCurrentTrustLevel === 'blacklisted' ? 'destructive' : prop.ownerCurrentTrustLevel === 'untrusted' ? 'secondary' : 'default'}>
                      {prop.ownerCurrentTrustLevel ? trustLevelTranslations[prop.ownerCurrentTrustLevel] : 'غير محدد'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusDisplay(prop.status).variant}>
                    {getStatusDisplay(prop.status).text}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(prop.createdAt).toLocaleDateString('ar-DZ')}</TableCell>
                <TableCell className="text-right">
                  {renderDropdownMenu(prop)}
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
