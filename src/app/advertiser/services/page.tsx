
"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, Phone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


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
    const [serviceAds, setServiceAds] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const form = useForm<ServiceAdFormValues>({
        resolver: zodResolver(serviceAdSchema),
        defaultValues: {
            title: "",
            serviceType: undefined,
            wilaya: undefined,
            description: "",
            imageUrl: "",
            phoneNumber: "",
            whatsappNumber: "",
            facebookUrl: "",
            instagramUrl: "",
        },
    });

    const onSubmit = async (data: ServiceAdFormValues) => {
        setIsSubmitting(true);
        console.log("Submitting service ad:", data);
        // Placeholder for actual submission logic
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
            title: "تم إضافة الإعلان بنجاح!",
            description: "سيظهر إعلانك في صفحة دليل الخدمات.",
        });
        setIsSubmitting(false);
        setIsDialogOpen(false);
        form.reset();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold font-headline">إدارة إعلانات الخدمات</h1>
                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            إضافة إعلان خدمة جديد
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>إضافة إعلان خدمة جديد</DialogTitle>
                            <DialogDescription>
                                املأ التفاصيل أدناه لنشر خدمتك في دليل الخدمات العقارية.
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
                                     <Controller
                                        name="serviceType"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger id="serviceType"><SelectValue placeholder="اختر نوع الخدمة" /></SelectTrigger>
                                                <SelectContent>
                                                    {serviceTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {form.formState.errors.serviceType && <p className="text-sm text-destructive">{form.formState.errors.serviceType.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="wilaya">الولاية</Label>
                                     <Controller
                                        name="wilaya"
                                        control={form.control}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger id="wilaya"><SelectValue placeholder="اختر الولاية" /></SelectTrigger>
                                                <SelectContent>
                                                    {wilayas.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {form.formState.errors.wilaya && <p className="text-sm text-destructive">{form.formState.errors.wilaya.message}</p>}
                                </div>
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
                                    {isSubmitting ? "جاري الإضافة..." : "إضافة إعلان الخدمة"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>إعلانات الخدمات الحالية</CardTitle>
                </CardHeader>
                <CardContent>
                    {serviceAds.length === 0 ? (
                        <p className="text-muted-foreground">لا توجد إعلانات خدمات لعرضها. ابدأ بإضافة إعلان جديد.</p>
                    ) : (
                        <div>
                            {/* Table or list of service ads will go here */}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
