
"use client";

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Archive, Eye, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Property } from "@/types";
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
import { Card } from "@/components/ui/card"; // Added import

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const { toast } = useToast();

  const fetchAllProperties = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, "properties"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const propsData = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          // Ensure dates are Date objects if they are Timestamps
          createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt),
          updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate() : new Date(doc.data().updatedAt),
      } as Property));
      setProperties(propsData);
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

  const openDeleteDialog = (property: Property) => {
    setSelectedProperty(property);
    setDeleteReason("");
    setIsDeleteDialogOpen(true);
  };

  const openArchiveDialog = (property: Property) => {
    setSelectedProperty(property);
    setIsArchiveDialogOpen(true);
  };
  
  const handleSoftDeleteProperty = async () => {
    if (!selectedProperty || !deleteReason.trim()) {
      toast({title: "خطأ", description: "سبب الحذف مطلوب.", variant: "destructive"});
      return;
    }
    try {
      const propRef = doc(db, "properties", selectedProperty.id);
      await updateDoc(propRef, { status: 'deleted', deletionReason: deleteReason, updatedAt: new Date() });
      toast({ title: "تم الحذف", description: `تم نقل العقار "${selectedProperty.title}" إلى المحذوفات.` });
      fetchAllProperties(); // Refresh
    } catch (error) {
      toast({ title: "خطأ", description: "فشل حذف العقار.", variant: "destructive" });
    }
    setIsDeleteDialogOpen(false);
    setSelectedProperty(null);
  };

  const handleArchiveProperty = async () => {
    if (!selectedProperty) return;
    try {
      const propRef = doc(db, "properties", selectedProperty.id);
      await updateDoc(propRef, { status: 'archived', updatedAt: new Date() });
      toast({ title: "تمت الأرشفة", description: `تم أرشفة العقار "${selectedProperty.title}".` });
      fetchAllProperties(); // Refresh
    } catch (error) {
      toast({ title: "خطأ", description: "فشل أرشفة العقار.", variant: "destructive" });
    }
    setIsArchiveDialogOpen(false);
    setSelectedProperty(null);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center py-10"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }
  
  const getStatusVariant = (status: Property['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'active': return 'default'; // Greenish if styled in theme
      case 'pending': return 'secondary'; // Yellowish
      case 'deleted': return 'destructive';
      case 'archived': return 'outline'; // Grayish
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
              <TableHead>المالك (ID)</TableHead>
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
                <TableCell className="max-w-[100px] truncate" title={prop.userId}>{prop.userId}</TableCell>
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
                      <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => alert(`View property ${prop.id}`)}><Eye className="mr-2 h-4 w-4" /> عرض التفاصيل</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {prop.status !== 'deleted' && prop.status !== 'archived' && (
                        <DropdownMenuItem onClick={() => openDeleteDialog(prop)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                          <Trash2 className="mr-2 h-4 w-4" /> حذف (نقل للمحذوفات)
                        </DropdownMenuItem>
                      )}
                       {prop.status === 'deleted' && (
                        <DropdownMenuItem onClick={() => openArchiveDialog(prop)}>
                          <Archive className="mr-2 h-4 w-4" /> أرشفة
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
         {properties.length === 0 && <p className="text-center text-muted-foreground p-6">لا توجد عقارات لعرضها.</p>}
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد أنك تريد حذف العقار "{selectedProperty?.title}"؟ سيتم نقل العقار إلى قائمة المحذوفات.
              الرجاء إدخال سبب الحذف.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input 
            placeholder="سبب الحذف (مثال: مخالفة الشروط، طلب المالك)" 
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            className="my-2"
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedProperty(null)}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleSoftDeleteProperty} disabled={!deleteReason.trim()}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Dialog */}
      <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الأرشفة</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد أنك تريد أرشفة العقار "{selectedProperty?.title}"؟ لا يمكن التراجع عن هذا الإجراء بسهولة.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedProperty(null)}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchiveProperty}>أرشفة</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

