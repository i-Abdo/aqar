
"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, Edit, Trash2, Archive, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { ServiceAd, ServiceAdStatus } from "@/types";
import { addDoc, collection, serverTimestamp, query, where, getDocs, doc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { DatePicker } from "@/components/ui/date-picker";
import { addDays, format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";


const serviceAdSchema = z.object({
  title: z.string().min(5, "العنوان مطلوب (5 أحرف على الأقل).").max(100),
  serviceType: z.string().min(1, "نوع الخدمة مطلوب."),
  wilaya: z.string().min(1, "الولاية مطلوبة."),
  description: z.string().min(20, "الوصف مطلوب (20 حرف على الأقل).").max(1000),
  imageUrl: z.string().url("رابط الصورة مطلوب وصالح.").min(1),
  phoneNumber: z.string().regex(/^0[567]\d{8}$/, "رقم الهاتف غير صالح."),
  whatsappNumber: z.string().regex(/^0[567]\d{8}$/, "رقم الواتساب غير صالح.").optional().or(z.literal('')),
  facebookUrl: z.string().url("رابط فيسبوك غير صالح.").optional().or(z.literal('')),
  instagramUrl: z.string().url("رابط انستقرام غير صالح.").optional().or(z.literal('')),
  expirationDate: z.date({ required_error: "تاريخ انتهاء الصلاحية مطلوب."}),
});

type ServiceAdFormValues = z.infer<typeof serviceAdSchema>;

const serviceTypes = [
  "محامون وموثقون", "مهندسون معماريون", "مصورون محترفون", 
  "شركات أشغال ومقاولات", "خدمات نقل الأثاث", "شركات تأمين العقار", 
  "تصميم داخلي وديكور", "إدارة الممتلكات"
];

const wilayas = [
  "أدرار", "الشلف", "الأغواط", "أم البواقي", "باتنة", "بجاية", "بسكرة", "بشار",
  "البليدة", "البويرة", "تمنراست", "تبسة", "تلمسان", "تيارت", "تيزي وزو", "الجزائر",
  "الجلفة", "جيجل", "سطيف", "سعيدة", "سكيكدة", "سيدي بلعباس", "عنابة", "قالمة",
  "قسنطينة", "المدية", "مستغانم", "المسيلة", "معسكر", "ورقلة", "وهران", "البيض",
  "إليزي", "برج بوعريريج", "بومرداس", "الطارف", "تندوف", "تيسمسيلت", "الوادي", "خنشلة",
  "سوق أهراس", "تيبازة", "ميلة", "عين الدفلى", "النعامة", "عين تموشنت", "غرداية", "غليزان"
];

export default function ServiceAdsPage() {
    const [activeAds, setActiveAds] = useState<ServiceAd[]>([]);
    const [archivedAds, setArchivedAds] = useState<ServiceAd[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingAd, setEditingAd] = useState<ServiceAd | null>(null);
    const [adToDelete, setAdToDelete] = useState<ServiceAd | null>(null);
    const [adToReactivate, setAdToReactivate] = useState<ServiceAd | null>(null);
    const { toast } = useToast();
    const { user } = useAuth();

    const fetchAds = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const adsQuery = query(collection(db, "service_ads"), where("advertiserId", "==", user.uid));
            const querySnapshot = await getDocs(adsQuery);
            const allAds: ServiceAd[] = [];
             querySnapshot.forEach(doc => {
                const data = doc.data();
                allAds.push({ 
                    id: doc.id,
                    ...data,
                    expirationDate: (data.expirationDate as Timestamp)?.toDate ? (data.expirationDate as Timestamp).toDate() : new Date(),
                    createdAt: (data.createdAt as Timestamp)?.toDate ? (data.createdAt as Timestamp).toDate() : new Date(),
                 } as ServiceAd);
            });
            setActiveAds(allAds.filter(ad => ad.status === ServiceAdStatus.Active));
            setArchivedAds(allAds.filter(ad => ad.status === ServiceAdStatus.Archived));
        } catch (error) {
            console.error("Error fetching service ads:", error);
            toast({ title: "خطأ", description: "لم نتمكن من تحميل الإعلانات.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchAds();
    }, [user]);

    const form = useForm<ServiceAdFormValues>({
        resolver: zodResolver(serviceAdSchema),
        defaultValues: {
            title: "", serviceType: undefined, wilaya: undefined, description: "", imageUrl: "",
            phoneNumber: "", whatsappNumber: "", facebookUrl: "", instagramUrl: "",
            expirationDate: addDays(new Date(), 30),
        },
    });

    useEffect(() => {
        if (editingAd) {
            form.reset({
                ...editingAd,
                expirationDate: new Date(editingAd.expirationDate)
            });
            setIsDialogOpen(true);
        } else {
             form.reset({
                title: "", serviceType: undefined, wilaya: undefined, description: "", imageUrl: "",
                phoneNumber: "", whatsappNumber: "", facebookUrl: "", instagramUrl: "",
                expirationDate: addDays(new Date(), 30),
            });
        }
    }, [editingAd, form]);

    const onSubmit = async (data: ServiceAdFormValues) => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            if (editingAd) {
                const adRef = doc(db, "service_ads", editingAd.id);
                await updateDoc(adRef, { ...data, status: ServiceAdStatus.Active });
                toast({ title: "تم التعديل بنجاح!" });
            } else {
                 const adData: Omit<ServiceAd, 'id'> = {
                    ...data, advertiserId: user.uid, advertiserEmail: user.email || "غير متوفر",
                    createdAt: serverTimestamp(), status: ServiceAdStatus.Active, views: 0, clicks: 0,
                };
                await addDoc(collection(db, "service_ads"), adData);
                toast({ title: "تم إضافة الإعلان بنجاح!" });
            }
            fetchAds();
            setIsDialogOpen(false);
            setEditingAd(null);
        } catch (error) {
            console.error("Error submitting service ad:", error);
            toast({ title: "خطأ", description: "فشل حفظ الإعلان.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleArchiveAd = async (adId: string) => {
        setIsSubmitting(true);
        try {
            const adRef = doc(db, "service_ads", adId);
            await updateDoc(adRef, { status: ServiceAdStatus.Archived });
            toast({ title: "تمت الأرشفة" });
            fetchAds();
        } catch (error) {
            toast({ title: "خطأ", description: "فشل أرشفة الإعلان.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleReactivateAd = async (newExpirationDate: Date) => {
        if (!adToReactivate) return;
        setIsSubmitting(true);
        try {
            const adRef = doc(db, "service_ads", adToReactivate.id);
            await updateDoc(adRef, { status: ServiceAdStatus.Active, expirationDate: Timestamp.fromDate(newExpirationDate) });
            toast({ title: "تمت إعادة التنشيط" });
            fetchAds();
        } catch (error) {
            toast({ title: "خطأ", description: "فشل إعادة تنشيط الإعلان.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
            setAdToReactivate(null);
        }
    };
    
    const handleDeleteAd = async () => {
        if (!adToDelete) return;
        setIsSubmitting(true);
        try {
            await deleteDoc(doc(db, "service_ads", adToDelete.id));
            toast({ title: "تم الحذف نهائياً" });
            fetchAds();
        } catch (error) {
             toast({ title: "خطأ", description: "فشل حذف الإعلان.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
            setAdToDelete(null);
        }
    };

    const renderAdTable = (ads: ServiceAd[], title: string, isArchivedTable = false) => (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? <Loader2 className="animate-spin" /> : ads.length === 0 ? (
                    <p className="text-muted-foreground">لا توجد إعلانات لعرضها.</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>العنوان</TableHead>
                                <TableHead>الولاية</TableHead>
                                <TableHead>المشاهدات</TableHead>
                                <TableHead>النقرات</TableHead>
                                <TableHead>تاريخ الانتهاء</TableHead>
                                <TableHead>الحالة</TableHead>
                                <TableHead>إجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ads.map(ad => (
                                <TableRow key={ad.id}>
                                    <TableCell>{ad.title}</TableCell>
                                    <TableCell>{ad.wilaya}</TableCell>
                                    <TableCell>{ad.views.toLocaleString()}</TableCell>
                                    <TableCell>{ad.clicks.toLocaleString()}</TableCell>
                                    <TableCell>{format(new Date(ad.expirationDate), "yyyy/MM/dd")}</TableCell>
                                    <TableCell><StatusBadge status={ad.status} /></TableCell>
                                    <TableCell className="space-x-2 rtl:space-x-reverse">
                                        {isArchivedTable ? (
                                            <>
                                                <Button size="icon" variant="outline" onClick={() => setAdToReactivate(ad)}><RefreshCw className="h-4 w-4" /></Button>
                                                <Button size="icon" variant="destructive_outline" onClick={() => setAdToDelete(ad)}><Trash2 className="h-4 w-4" /></Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button size="icon" variant="outline" onClick={() => setEditingAd(ad)}><Edit className="h-4 w-4" /></Button>
                                                <Button size="icon" variant="outline" onClick={() => handleArchiveAd(ad.id)}><Archive className="h-4 w-4" /></Button>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold font-headline">إدارة إعلانات الخدمات</h1>
                 <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) setEditingAd(null); }}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            {editingAd ? "تعديل إعلان الخدمة" : "إضافة إعلان خدمة جديد"}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>{editingAd ? "تعديل إعلان الخدمة" : "إضافة إعلان خدمة جديد"}</DialogTitle>
                            <DialogDescription>
                                {editingAd ? "قم بتعديل تفاصيل إعلان خدمتك." : "املأ التفاصيل أدناه لنشر خدمتك في دليل الخدمات العقارية."}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 overflow-y-auto px-1">
                             <div className="space-y-2">
                                <Label htmlFor="title">عنوان الإعلان</Label>
                                <Input id="title" {...form.register("title")} placeholder="مثال: مكتب محاماة متخصص في العقود" />
                                {form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="serviceType">نوع الخدمة</Label>
                                     <Controller name="serviceType" control={form.control} render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}><SelectTrigger id="serviceType"><SelectValue placeholder="اختر نوع الخدمة" /></SelectTrigger>
                                            <SelectContent>{serviceTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                                        </Select> )}
                                    />
                                    {form.formState.errors.serviceType && <p className="text-sm text-destructive">{form.formState.errors.serviceType.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="wilaya">الولاية</Label>
                                     <Controller name="wilaya" control={form.control} render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}><SelectTrigger id="wilaya"><SelectValue placeholder="اختر الولاية" /></SelectTrigger>
                                            <SelectContent>{wilayas.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
                                        </Select> )}
                                    />
                                    {form.formState.errors.wilaya && <p className="text-sm text-destructive">{form.formState.errors.wilaya.message}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="expirationDate">تاريخ انتهاء الصلاحية</Label>
                                <Controller name="expirationDate" control={form.control} render={({ field }) => ( <DatePicker date={field.value} setDate={field.onChange} /> )} />
                                {form.formState.errors.expirationDate && <p className="text-sm text-destructive">{form.formState.errors.expirationDate.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">وصف الخدمة</Label>
                                <Textarea id="description" {...form.register("description")} placeholder="اكتب وصفًا تفصيليًا للخدمة التي تقدمها..." rows={4}/>
                                {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="imageUrl">رابط صورة الإعلان</Label>
                                <Input id="imageUrl" {...form.register("imageUrl")} placeholder="https://example.com/image.png" dir="ltr" />
                                {form.formState.errors.imageUrl && <p className="text-sm text-destructive">{form.formState.errors.imageUrl.message}</p>}
                            </div>
                            <h3 className="font-semibold pt-4 border-t">معلومات التواصل</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber">رقم الهاتف</Label>
                                    <Input id="phoneNumber" {...form.register("phoneNumber")} placeholder="0612345678" />
                                    {form.formState.errors.phoneNumber && <p className="text-sm text-destructive">{form.formState.errors.phoneNumber.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="whatsappNumber">واتساب (اختياري)</Label>
                                    <Input id="whatsappNumber" {...form.register("whatsappNumber")} placeholder="0612345678" />
                                    {form.formState.errors.whatsappNumber && <p className="text-sm text-destructive">{form.formState.errors.whatsappNumber.message}</p>}
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="facebookUrl">فيسبوك (اختياري)</Label>
                                    <Input id="facebookUrl" {...form.register("facebookUrl")} placeholder="https://facebook.com/your-page" />
                                    {form.formState.errors.facebookUrl && <p className="text-sm text-destructive">{form.formState.errors.facebookUrl.message}</p>}
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="instagramUrl">انستقرام (اختياري)</Label>
                                    <Input id="instagramUrl" {...form.register("instagramUrl")} placeholder="https://instagram.com/your-profile" />
                                    {form.formState.errors.instagramUrl && <p className="text-sm text-destructive">{form.formState.errors.instagramUrl.message}</p>}
                                </div>
                            </div>
                            <DialogFooter className="pt-4 !mt-8">
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">إلغاء</Button>
                                </DialogClose>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isSubmitting ? "جاري الحفظ..." : "حفظ الإعلان"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            
            {renderAdTable(activeAds, "إعلانات الخدمات النشطة")}
            {renderAdTable(archivedAds, "إعلانات الخدمات المؤرشفة", true)}

            <AlertDialog open={!!adToDelete} onOpenChange={(open) => !open && setAdToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>تأكيد الحذف</AlertDialogTitle></AlertDialogHeader>
                    <AlertDialogDescription>هل أنت متأكد من حذف هذا الإعلان نهائياً؟</AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAd} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">
                           {isSubmitting ? <Loader2 className="animate-spin" /> : "حذف"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            <Dialog open={!!adToReactivate} onOpenChange={(open) => !open && setAdToReactivate(null)}>
                <DialogContent>
                     <DialogHeader><DialogTitle>إعادة تنشيط الإعلان</DialogTitle></DialogHeader>
                     <DialogDescription>الرجاء تحديد تاريخ انتهاء الصلاحية الجديد لإعادة تنشيط الإعلان.</DialogDescription>
                     <DatePickerWithReactivate onReactivate={handleReactivateAd} />
                </DialogContent>
            </Dialog>

        </div>
    );
}

const DatePickerWithReactivate = ({ onReactivate }: { onReactivate: (date: Date) => void }) => {
    const [date, setDate] = useState<Date | undefined>(addDays(new Date(), 30));
    return (
         <div className="space-y-4 py-4">
             <DatePicker date={date} setDate={setDate} />
             <Button onClick={() => date && onReactivate(date)} disabled={!date} className="w-full">
                إعادة التنشيط
             </Button>
         </div>
    )
}
