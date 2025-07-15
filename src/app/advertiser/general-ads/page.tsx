
"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
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
import { useAuth } from "@/hooks/use-auth";
import { GeneralAd, GeneralAdStatus } from "@/types";
import { addDoc, collection, serverTimestamp, query, where, getDocs, doc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { DatePicker } from "@/components/ui/date-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { addDays, format } from "date-fns";

const generalAdSchema = z.object({
  title: z.string().min(5, "العنوان يجب أن يكون 5 أحرف على الأقل.").max(100, "العنوان طويل جدًا."),
  text: z.string().min(10, "النص يجب أن يكون 10 أحرف على الأقل.").max(500, "النص طويل جدًا."),
  imageUrl: z.string().url("يجب أن يكون رابط الصورة صالحًا.").min(1, "رابط الصورة مطلوب."),
  buttonText: z.string().min(2, "نص الزر قصير جدًا.").max(30, "نص الزر طويل جدًا."),
  buttonUrl: z.string().url("رابط الإحالة يجب أن يكون صالحًا.").min(1, "رابط الإحالة مطلوب."),
  expirationDate: z.date({ required_error: "تاريخ انتهاء الصلاحية مطلوب."}),
});

type GeneralAdFormValues = z.infer<typeof generalAdSchema>;

export default function GeneralAdsPage() {
    const [activeAds, setActiveAds] = useState<GeneralAd[]>([]);
    const [archivedAds, setArchivedAds] = useState<GeneralAd[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingAd, setEditingAd] = useState<GeneralAd | null>(null);
    const [adToDelete, setAdToDelete] = useState<GeneralAd | null>(null);
    const [adToReactivate, setAdToReactivate] = useState<GeneralAd | null>(null);
    const { toast } = useToast();
    const { user } = useAuth();

    const fetchAds = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const adsQuery = query(collection(db, "general_ads"), where("advertiserId", "==", user.uid));
            const querySnapshot = await getDocs(adsQuery);
            const allAds: GeneralAd[] = [];
            querySnapshot.forEach(doc => {
                const data = doc.data();
                allAds.push({ 
                    id: doc.id,
                    ...data,
                    expirationDate: (data.expirationDate as Timestamp)?.toDate ? (data.expirationDate as Timestamp).toDate() : new Date(),
                    createdAt: (data.createdAt as Timestamp)?.toDate ? (data.createdAt as Timestamp).toDate() : new Date(),
                 } as GeneralAd);
            });
            setActiveAds(allAds.filter(ad => ad.status === GeneralAdStatus.Active));
            setArchivedAds(allAds.filter(ad => ad.status === GeneralAdStatus.Archived));
        } catch (error) {
            console.error("Error fetching general ads:", error);
            toast({ title: "خطأ", description: "لم نتمكن من تحميل الإعلانات.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAds();
    }, [user]);

    const form = useForm<GeneralAdFormValues>({
        resolver: zodResolver(generalAdSchema),
        defaultValues: {
            title: "", text: "", imageUrl: "", buttonText: "", buttonUrl: "",
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
                title: "", text: "", imageUrl: "", buttonText: "", buttonUrl: "",
                expirationDate: addDays(new Date(), 30),
            });
        }
    }, [editingAd, form]);

    const onSubmit = async (data: GeneralAdFormValues) => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            if (editingAd) {
                const adRef = doc(db, "general_ads", editingAd.id);
                await updateDoc(adRef, { ...data, status: GeneralAdStatus.Active });
                toast({ title: "تم التعديل بنجاح!" });
            } else {
                const adData: Omit<GeneralAd, 'id'> = {
                    ...data, advertiserId: user.uid, advertiserEmail: user.email || "غير متوفر",
                    createdAt: serverTimestamp(), status: GeneralAdStatus.Active, views: 0, clicks: 0,
                };
                await addDoc(collection(db, "general_ads"), adData);
                toast({ title: "تم إضافة الإعلان بنجاح!" });
            }
            fetchAds();
            setIsDialogOpen(false);
            setEditingAd(null);
        } catch (error) {
            console.error("Error submitting general ad:", error);
            toast({ title: "خطأ", description: "فشل حفظ الإعلان.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleArchiveAd = async (adId: string) => {
        setIsSubmitting(true);
        try {
            const adRef = doc(db, "general_ads", adId);
            await updateDoc(adRef, { status: GeneralAdStatus.Archived });
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
            const adRef = doc(db, "general_ads", adToReactivate.id);
            await updateDoc(adRef, { status: GeneralAdStatus.Active, expirationDate: Timestamp.fromDate(newExpirationDate) });
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
            await deleteDoc(doc(db, "general_ads", adToDelete.id));
            toast({ title: "تم الحذف نهائياً" });
            fetchAds();
        } catch (error) {
             toast({ title: "خطأ", description: "فشل حذف الإعلان.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
            setAdToDelete(null);
        }
    };


    const renderAdTable = (ads: GeneralAd[], title: string, isArchivedTable = false) => (
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
                <h1 className="text-3xl font-bold font-headline">إدارة الإعلانات العامة (المنبثقة)</h1>
                 <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) setEditingAd(null); }}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            {editingAd ? "تعديل الإعلان" : "إضافة إعلان جديد"}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{editingAd ? "تعديل الإعلان العام" : "إضافة إعلان عام جديد"}</DialogTitle>
                            <DialogDescription>
                                {editingAd ? "قم بتعديل تفاصيل إعلانك." : "املأ التفاصيل أدناه لإنشاء إعلانك المنبثق."}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">عنوان الإعلان</Label>
                                <Input id="title" {...form.register("title")} placeholder="مثال: تخفيضات الصيف الكبرى" />
                                {form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="text">نص الإعلان</Label>
                                <Textarea id="text" {...form.register("text")} placeholder="اكتب وصفًا موجزًا وجذابًا للإعلان." />
                                {form.formState.errors.text && <p className="text-sm text-destructive">{form.formState.errors.text.message}</p>}
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="imageUrl">رابط صورة الإعلان</Label>
                                <Input id="imageUrl" {...form.register("imageUrl")} placeholder="https://example.com/image.png" dir="ltr" />
                                {form.formState.errors.imageUrl && <p className="text-sm text-destructive">{form.formState.errors.imageUrl.message}</p>}
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="buttonText">النص على الزر</Label>
                                <Input id="buttonText" {...form.register("buttonText")} placeholder="مثال: تسوق الآن" />
                                {form.formState.errors.buttonText && <p className="text-sm text-destructive">{form.formState.errors.buttonText.message}</p>}
                            </div>
                              <div className="space-y-2">
                                <Label htmlFor="buttonUrl">رابط الإحالة للزر</Label>
                                <Input id="buttonUrl" {...form.register("buttonUrl")} placeholder="https://example.com/shop" dir="ltr" />
                                {form.formState.errors.buttonUrl && <p className="text-sm text-destructive">{form.formState.errors.buttonUrl.message}</p>}
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="expirationDate">تاريخ انتهاء الصلاحية</Label>
                                <Controller name="expirationDate" control={form.control} render={({ field }) => (
                                    <DatePicker date={field.value} setDate={field.onChange} />
                                 )}
                                />
                                {form.formState.errors.expirationDate && <p className="text-sm text-destructive">{form.formState.errors.expirationDate.message}</p>}
                            </div>
                            <DialogFooter>
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
            
             {renderAdTable(activeAds, "الإعلانات النشطة")}
             {renderAdTable(archivedAds, "الإعلانات المؤرشفة", true)}

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
                     <DatePicker onReactivate={handleReactivateAd} />
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
