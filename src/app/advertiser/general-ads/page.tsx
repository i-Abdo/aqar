
"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { GeneralAd, GeneralAdStatus } from "@/types";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

const generalAdSchema = z.object({
  title: z.string().min(5, "العنوان يجب أن يكون 5 أحرف على الأقل.").max(100, "العنوان طويل جدًا."),
  text: z.string().min(10, "النص يجب أن يكون 10 أحرف على الأقل.").max(500, "النص طويل جدًا."),
  imageUrl: z.string().url("يجب أن يكون رابط الصورة صالحًا.").min(1, "رابط الصورة مطلوب."),
  buttonText: z.string().min(2, "نص الزر قصير جدًا.").max(30, "نص الزر طويل جدًا."),
  buttonUrl: z.string().url("رابط الإحالة يجب أن يكون صالحًا.").min(1, "رابط الإحالة مطلوب."),
});

type GeneralAdFormValues = z.infer<typeof generalAdSchema>;

export default function GeneralAdsPage() {
    const [generalAds, setGeneralAds] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const { user } = useAuth();

    const form = useForm<GeneralAdFormValues>({
        resolver: zodResolver(generalAdSchema),
        defaultValues: {
            title: "",
            text: "",
            imageUrl: "",
            buttonText: "",
            buttonUrl: "",
        },
    });

    const onSubmit = async (data: GeneralAdFormValues) => {
        if (!user) {
            toast({ title: "خطأ", description: "يجب تسجيل الدخول لإضافة إعلان.", variant: "destructive" });
            return;
        }
        setIsSubmitting(true);
        try {
            const adData: Omit<GeneralAd, 'id'> = {
                ...data,
                advertiserId: user.uid,
                advertiserEmail: user.email || "غير متوفر",
                createdAt: serverTimestamp(),
                status: GeneralAdStatus.Active,
                views: 0,
                clicks: 0,
            };
            await addDoc(collection(db, "general_ads"), adData);
            toast({
                title: "تم إضافة الإعلان بنجاح!",
                description: "سيظهر إعلانك للمستخدمين أثناء تصفحهم للموقع.",
            });
            setIsSubmitting(false);
            setIsDialogOpen(false);
            form.reset();
        } catch (error) {
            console.error("Error submitting general ad:", error);
            toast({ title: "خطأ", description: "فشل إضافة الإعلان. يرجى المحاولة مرة أخرى.", variant: "destructive" });
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold font-headline">إدارة الإعلانات العامة (المنبثقة)</h1>
                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            إضافة إعلان عام جديد
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>إضافة إعلان عام جديد</DialogTitle>
                            <DialogDescription>
                                املأ التفاصيل أدناه لإنشاء إعلانك المنبثق. سيظهر هذا الإعلان للمستخدمين أثناء تصفحهم.
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
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">إلغاء</Button>
                                </DialogClose>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isSubmitting ? "جاري الإضافة..." : "إضافة الإعلان"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>الإعلانات العامة الحالية</CardTitle>
                </CardHeader>
                <CardContent>
                    {generalAds.length === 0 ? (
                        <p className="text-muted-foreground">لا توجد إعلانات عامة لعرضها. ابدأ بإضافة إعلان جديد.</p>
                    ) : (
                        <div>
                            {/* Table or list of general ads will go here */}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
