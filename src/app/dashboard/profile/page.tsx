
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, UserCircle, Edit3, LockKeyhole } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateProfile, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { auth as firebaseAuth } from "@/lib/firebase/client";
import { plans } from "@/config/plans";

const profileFormSchema = z.object({
  displayName: z
    .string()
    .min(2, { message: "الاسم يجب أن يكون حرفين على الأقل." })
    .max(50, { message: "الاسم طويل جدًا (الحد الأقصى 50 حرفًا)." })
    .optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmNewPassword: z.string().optional(),
})
.superRefine((data, ctx) => {
    // If any password field is filled, validate all password fields
    if (data.currentPassword || data.newPassword || data.confirmNewPassword) {
        if (!data.currentPassword) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "كلمة المرور الحالية مطلوبة لتغيير كلمة المرور.",
                path: ["currentPassword"],
            });
        }
        if (!data.newPassword || data.newPassword.length < 6) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل.",
                path: ["newPassword"],
            });
        } else if (data.newPassword === data.currentPassword) {
             ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية.",
                path: ["newPassword"],
            });
        }
        if (data.newPassword !== data.confirmNewPassword) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "كلمتا المرور الجديدتان غير متطابقتين.",
                path: ["confirmNewPassword"],
            });
        }
    }
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [currentPlanName, setCurrentPlanName] = React.useState("...");

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  React.useEffect(() => {
    if (user) {
      form.reset({ 
        displayName: user.displayName || "",
        currentPassword: "", // Always clear password fields on load
        newPassword: "",
        confirmNewPassword: "",
       });
      const planDetails = plans.find(p => p.id === (user.planId || 'free'));
      setCurrentPlanName(planDetails?.name || "غير محدد");
    }
  }, [user, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user || !firebaseAuth.currentUser) {
      toast({ title: "خطأ", description: "المستخدم غير مسجل الدخول.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    let displayNameUpdated = false;
    let passwordUpdated = false;

    try {
      // Update Display Name if changed
      if (form.formState.dirtyFields.displayName && data.displayName !== user.displayName) {
        await updateProfile(firebaseAuth.currentUser, {
          displayName: data.displayName || user.displayName || "", 
        });
        displayNameUpdated = true;
      }

      // Update Password if fields are filled and valid (superRefine handles actual validation)
      if (data.newPassword && data.currentPassword && data.confirmNewPassword) {
        const credential = EmailAuthProvider.credential(user.email!, data.currentPassword);
        await reauthenticateWithCredential(firebaseAuth.currentUser, credential);
        await updatePassword(firebaseAuth.currentUser, data.newPassword);
        passwordUpdated = true;
      }

      if (displayNameUpdated && passwordUpdated) {
        toast({ title: "تم تحديث الملف الشخصي وكلمة المرور بنجاح!" });
      } else if (displayNameUpdated) {
        toast({ title: "تم تحديث اسم العرض بنجاح!" });
      } else if (passwordUpdated) {
        toast({ title: "تم تحديث كلمة المرور بنجاح!" });
      } else if (!form.formState.isDirty) {
         toast({ title: "لا توجد تغييرات لحفظها."});
      }
      
      // Reset form to clear dirty state and password fields
       form.reset({
        displayName: data.displayName || user.displayName || "",
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });

    } catch (error: any) {
      console.error("Error updating profile:", error);
      let description = "حدث خطأ ما. يرجى المحاولة مرة أخرى.";
      if (error.code === 'auth/wrong-password') {
        description = "كلمة المرور الحالية غير صحيحة.";
      } else if (error.code === 'auth/weak-password') {
        description = "كلمة المرور الجديدة ضعيفة جدًا (يجب أن تكون 6 أحرف على الأقل).";
      } else if (error.code === 'auth/requires-recent-login') {
        description = "تتطلب هذه العملية تسجيل دخول حديث. الرجاء تسجيل الخروج ثم الدخول مرة أخرى والمحاولة.";
      }
      toast({
        title: "خطأ في تحديث الملف الشخصي",
        description: description,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-20rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">جاري تحميل بيانات الملف الشخصي...</p>
      </div>
    );
  }

  if (!user) {
    return <p className="text-center text-muted-foreground">الرجاء تسجيل الدخول لعرض ملفك الشخصي.</p>;
  }
  
  const userInitials = user.displayName ? user.displayName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : "U");

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold font-headline text-center">ملفي الشخصي</h1>
      
      <Card className="shadow-xl">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader className="text-center">
            <div className="relative mx-auto w-24 h-24 mb-4">
              <Avatar className="w-24 h-24 text-3xl border-4 border-primary/50 shadow-md">
                 <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User Avatar"} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="mt-2">{form.watch("displayName") || user.displayName || "المستخدم"}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="flex items-center gap-1">
                <UserCircle size={18} /> اسم العرض
              </Label>
              <Input
                id="displayName"
                {...form.register("displayName")}
                placeholder="أدخل اسم العرض الخاص بك"
              />
              {form.formState.errors.displayName && (
                <p className="text-sm text-destructive">{form.formState.errors.displayName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>البريد الإلكتروني (غير قابل للتعديل)</Label>
              <Input value={user.email || ""} readOnly disabled className="bg-muted/50"/>
            </div>

            <div className="space-y-2">
              <Label>الخطة الحالية</Label>
              <Input value={currentPlanName} readOnly disabled className="bg-muted/50" />
            </div>

            <hr className="my-6 border-border" />
            
            <h3 className="text-lg font-semibold flex items-center gap-2"><LockKeyhole size={20}/>تغيير كلمة المرور</h3>
            <CardDescription>اترك الحقول التالية فارغة إذا كنت لا ترغب في تغيير كلمة المرور.</CardDescription>

            <div className="space-y-2">
              <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
              <Input
                id="currentPassword"
                type="password"
                {...form.register("currentPassword")}
                placeholder="••••••••"
              />
              {form.formState.errors.currentPassword && (
                <p className="text-sm text-destructive">{form.formState.errors.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
              <Input
                id="newPassword"
                type="password"
                {...form.register("newPassword")}
                placeholder="••••••••"
              />
              {form.formState.errors.newPassword && (
                <p className="text-sm text-destructive">{form.formState.errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">تأكيد كلمة المرور الجديدة</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                {...form.register("confirmNewPassword")}
                placeholder="••••••••"
              />
              {form.formState.errors.confirmNewPassword && (
                <p className="text-sm text-destructive">{form.formState.errors.confirmNewPassword.message}</p>
              )}
            </div>

          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full transition-smooth hover:shadow-md" 
              disabled={isSubmitting || !form.formState.isDirty}
            >
              {isSubmitting ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              ) : (
                <Edit3 size={18} className="ml-2 rtl:ml-0 rtl:mr-2"/>
              )}
              {isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
    

    