
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { Property, Plan, PropertyAppeal, TransactionType, PropertyTypeEnum } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Edit3, Trash2, PlusCircle, AlertTriangle, ShieldQuestion, Eye, Tag, Home as HomeIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from '@/components/ui/textarea';
import { submitPropertyAppeal } from '@/actions/propertyAppealActions';
import { formatDisplayPrice } from '@/lib/utils';

const PROPERTY_APPEAL_COOLDOWN_MS = 24 * 60 * 60000; // 24 hours

const transactionTypeTranslations: Record<TransactionType, string> = {
  sale: "للبيع",
  rent: "للكراء",
};

const propertyTypeShortTranslations: Record<PropertyTypeEnum, string> = {
  land: "أرض",
  villa: "فيلا",
  house: "بيت",
  apartment: "شقة",
  office: "مكتب",
  warehouse: "مستودع",
  shop: "حانوت",
  other: "آخر",
};


function PropertyListItemCard({ property, onDelete, onArchive }: { property: Property, onDelete: (id: string, reason: string) => void, onArchive: (id: string, reason: string) => void }) {
  const [deleteReason, setDeleteReason] = useState("");
  const [archiveReason, setArchiveReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isAppealing, setIsAppealing] = useState(false);
  const [lastAppealTime, setLastAppealTime] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user && property.status === 'archived') {
      const storedTime = localStorage.getItem(`lastAppealTime_${user.uid}_${property.id}`);
      if (storedTime) {
        setLastAppealTime(parseInt(storedTime, 10));
      }
    }
  }, [user, property.id, property.status]);

  const canAppeal = () => {
    if (property.status !== 'archived') return false;
    return Date.now() - lastAppealTime > PROPERTY_APPEAL_COOLDOWN_MS;
  };

  const handleDeleteWithReason = async () => {
    if (!deleteReason.trim()) {
      toast({ title: "سبب الحذف مطلوب", description: "يرجى إدخال سبب لحذف العقار.", variant: "destructive"});
      return;
    }
    setIsDeleting(true);
    await onDelete(property.id, deleteReason);
    setIsDeleting(false);
  };

  const handleArchiveWithReason = async () => {
    if (!archiveReason.trim()) {
      toast({ title: "سبب الأرشفة مطلوب", description: "يرجى إدخال سبب لأرشفة العقار.", variant: "destructive"});
      return;
    }
    setIsArchiving(true);
    await onArchive(property.id, archiveReason);
    setIsArchiving(false);
  };

  const handleAppeal = async () => {
    if (!user) {
        toast({ title: "خطأ", description: "يجب تسجيل الدخول لتقديم طعن.", variant: "destructive" });
        return;
    }
    if (!canAppeal()) {
        const timeLeftMs = PROPERTY_APPEAL_COOLDOWN_MS - (Date.now() - lastAppealTime);
        const hoursLeft = Math.ceil(timeLeftMs / (60 * 60000));
        toast({ title: "محاولة متكررة", description: `لقد قدمت طعنًا على هذا العقار مؤخرًا. يرجى الانتظار حوالي ${hoursLeft} ساعة.`, variant: "destructive" });
        return;
    }

    setIsAppealing(true);
    const result = await submitPropertyAppeal({
        propertyId: property.id,
        propertyTitle: property.title,
        ownerUserId: user.uid,
        ownerEmail: user.email || "غير متوفر",
        propertyArchivalReason: property.archivalReason || "---"
    });
    if (result.success) {
        toast({ title: "تم إرسال الطعن", description: result.message });
        const currentTime = Date.now();
        setLastAppealTime(currentTime);
        localStorage.setItem(`lastAppealTime_${user.uid}_${property.id}`, currentTime.toString());
    } else {
        toast({ title: "خطأ في إرسال الطعن", description: result.message, variant: "destructive" });
    }
    setIsAppealing(false);
  };


  const getStatusDisplay = () => {
    switch (property.status) {
      case 'active': return { text: 'نشط', color: 'text-green-600' };
      case 'pending': return { text: 'قيد المراجعة', color: 'text-yellow-600' };
      case 'deleted': return { text: 'محذوف', color: 'text-red-600' };
      case 'archived': return { text: 'متوقف', color: 'text-orange-600' };
      default: return { text: property.status, color: 'text-muted-foreground' };
    }
  };
  const statusDisplay = getStatusDisplay();

  const actionButtons = [];

  if (property.status !== 'deleted' && property.status !== 'archived') {
    actionButtons.push(
      <Button key="edit" variant="outline" size="sm" asChild className="transition-smooth w-full hover:shadow-sm">
        <Link href={`/dashboard/properties/${property.id}/edit`}> <Edit3 size={16} className="ml-1 rtl:ml-0 rtl:mr-1"/> تعديل</Link>
      </Button>
    );
    actionButtons.push(
      <AlertDialog key="delete">
        <AlertDialogTrigger asChild>
          <Button variant="destructive_outline" size="sm" className="transition-smooth w-full hover:shadow-sm"><Trash2 size={16} className="ml-1 rtl:ml-0 rtl:mr-1"/> حذف</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد أنك تريد حذف هذا العقار؟ سيتم نقله إلى المحذوفات. الرجاء إدخال سبب الحذف.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="سبب الحذف (مثال: تم البيع، خطأ في الإدخال)"
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            className="my-2"
            rows={3}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWithReason} disabled={isDeleting || !deleteReason.trim()}>
              {isDeleting && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  } else if (property.status === 'deleted') {
    actionButtons.push(
      <AlertDialog key="archive">
        <AlertDialogTrigger asChild>
            <Button variant="outline_secondary" size="sm" className="w-full transition-smooth hover:shadow-sm">أرشفة العقار</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>تأكيد الأرشفة</AlertDialogTitle>
                <AlertDialogDescription>
                    هل أنت متأكد أنك تريد أرشفة هذا العقار؟ الرجاء إدخال سبب الأرشفة.
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
                <AlertDialogAction onClick={handleArchiveWithReason} disabled={isArchiving || !archiveReason.trim()}>
                    {isArchiving && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                    أرشفة
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    );
  } else if (property.status === 'archived') {
    actionButtons.push(
     <Button key="appeal" onClick={handleAppeal} variant="outline_primary" size="sm" disabled={isAppealing || !canAppeal()} className="w-full transition-smooth hover:shadow-sm">
        {isAppealing ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <ShieldQuestion size={16} className="ml-1 rtl:ml-0 rtl:mr-1"/>}
        {isAppealing ? "جاري إرسال الطعن..." : "طعن"}
     </Button>
    );
  }
  
  const gridColsClass = actionButtons.length === 0 ? 'hidden' : 
                        actionButtons.length === 1 ? 'grid-cols-1' : 
                        actionButtons.length === 2 ? 'grid-cols-2' : 'grid-cols-2';


  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <Link 
        href={`/properties/${property.id}`} 
        className="flex flex-col flex-grow cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary focus:rounded-t-lg"
      >
          <CardHeader className="p-0 group-hover:opacity-90 transition-opacity relative h-48">
            <Image
              src={property.imageUrls?.[0] || "https://placehold.co/400x250.png"}
              alt={property.title}
              fill
              style={{objectFit:"cover"}}
              className="rounded-t-lg"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              data-ai-hint="house exterior"
            />
             <div className="absolute top-2 right-2 flex gap-1">
                {property.transactionType && (
                  <Badge variant="default" className="text-xs opacity-90 group-hover:opacity-100 transition-opacity">
                    {transactionTypeTranslations[property.transactionType]}
                  </Badge>
                )}
                {property.propertyType && (
                  <Badge variant="secondary" className="text-xs opacity-90 group-hover:opacity-100 transition-opacity">
                    {propertyTypeShortTranslations[property.propertyType]}
                    {property.propertyType === 'other' && property.otherPropertyType ? ` (${property.otherPropertyType.substring(0,10)})` : ''}
                  </Badge>
                )}
            </div>
          </CardHeader>
          <CardContent className="p-4 flex-grow group-hover:bg-muted/20 transition-colors">
            <CardTitle className="text-xl font-headline mb-1 truncate group-hover:text-primary transition-colors" title={property.title}>{property.title}</CardTitle>
            <p className="text-lg font-semibold text-green-600 mb-2">{formatDisplayPrice(property.price)}</p>
            <p className="text-sm text-muted-foreground mb-1 truncate">{property.wilaya}, {property.city}</p>
            <div className="text-sm text-muted-foreground">الحالة: <span className={`font-medium ${statusDisplay.color}`}>{statusDisplay.text}</span></div>
            {property.status === 'archived' && (
                <p className="text-xs text-muted-foreground mt-1">سبب التوقيف: {property.archivalReason || "---"}</p>
            )}
            {property.status === 'deleted' && property.deletionReason && (
                <p className="text-xs text-muted-foreground mt-1">سبب الحذف: {property.deletionReason}</p>
            )}
          </CardContent>
      </Link>
      {actionButtons.length > 0 && (
        <CardFooter className={`p-4 border-t grid ${gridColsClass} gap-2`}>
          {actionButtons.map(button => button)}
        </CardFooter>
      )}
    </Card>
  );
}

export default PropertyListItemCard;

    