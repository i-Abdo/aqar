
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
import { Progress } from "@/components/ui/progress";
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
import { cn } from "@/lib/utils";

const PROFILE_UPDATE_COOLDOWN_MS = 60000; // 1 minute
const MAX_PASSWORD_ATTEMPTS = 3;
const PASSWORD_ATTEMPT_LOCKOUT_MS = 5 * 60000; // 5 minutes

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

interface PasswordStrengthResult {
  score: number; // 0-4
  text: string;
  color: string;
}

const calculatePasswordStrength = (password: string): PasswordStrengthResult => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  let text = "ضعيفة";
  let color = "bg-destructive"; // Red for weak

  if (score === 2) {
    text = "متوسطة";
    color = "bg-orange-500"; // Orange for medium
  } else if (score >= 3) {
    text = "قوية";
    color = "bg-green-500"; // Green for strong
  }
  
  if (password.length > 0 && password.length < 6) {
    return { score: 0, text: "قصيرة جداً", color: "bg-destructive" };
  }
  if (password.length === 0) {
    return { score: 0, text: "", color: "bg-transparent" };
  }

  return { score, text, color };
};

const PasswordStrengthIndicator = ({ strength }: { strength: PasswordStrengthResult }) => {
  if (!strength.text) return null;
  return (
    <div className="space-y-2 pt-2">
      <div className="flex items-center gap-2">
        <Progress value={(strength.score / 4) * 100} className="h-2 flex-1" indicatorClassName={strength.color} />
        <span className="text-xs text-muted-foreground w-20 text-center font-medium">{strength.text}</span>
      </div>
      {strength.score < 3 && <p className="text-xs text-muted-foreground">لتقوية كلمة السر، استخدم حروفًا وأرقامًا ورموزًا.</p>}
    </div>
  );
};


export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [currentPlanName, setCurrentPlanName] = React.useState("...");
  const [lastPasswordUpdateAttempt, setLastPasswordUpdateAttempt] = React.useState<number>(0);
  const [passwordAttemptCount, setPasswordAttemptCount] = React.useState<number>(0);
  const [passwordFieldsLockedUntil, setPasswordFieldsLockedUntil] = React.useState<number>(0);
  const [isWeakPasswordDialogOpen, setIsWeakPasswordDialogOpen] = React.useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const newPasswordValue = form.watch("newPassword");
  const passwordStrength = React.useMemo(() => calculatePasswordStrength(newPasswordValue || ""), [newPasswordValue]);

  React.useEffect(() => {
    if (user) {
      form.reset({ displayName: user.displayName || "" });
      const planDetails = plans.find(p => p.id === (user.planId || 'free'));
      setCurrentPlanName(planDetails?.name || "غير محدد");

      const storedLastAttempt = localStorage.getItem(`lastPasswordUpdateAttempt_${user.uid}`);
      if (storedLastAttempt) setLastPasswordUpdateAttempt(parseInt(storedLastAttempt, 10));
      const storedAttemptCount = localStorage.getItem(`passwordAttemptCount_${user.uid}`);
      if (storedAttemptCount) setPasswordAttemptCount(parseInt(storedAttemptCount, 10));
      const storedLockout = localStorage.getItem(`passwordFieldsLockedUntil_${user.uid}`);
      if (storedLockout) setPasswordFieldsLockedUntil(parseInt(storedLockout, 10));
    }
  }, [user, form]);

  const canAttemptPasswordUpdate = () => {
    if (passwordFieldsLockedUntil > Date.now()) return false;
    return Date.now() - lastPasswordUpdateAttempt > PROFILE_UPDATE_COOLDOWN_MS;
  };

  const performSignupLogic = async (data: ProfileFormValues) => {
    if (!user || !firebaseAuth.currentUser) {
      toast({ title: "خطأ", description: "المستخدم غير مسجل الدخول.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    let displayNameUpdated = false;
    let passwordUpdated = false;

    try {
      if (form.formState.dirtyFields.displayName && data.displayName !== user.displayName) {
        await updateProfile(firebaseAuth.currentUser, { displayName: data.displayName || user.displayName || "" });
        displayNameUpdated = true;
      }

      if (data.newPassword && data.currentPassword && data.confirmNewPassword) {
         if (!canAttemptPasswordUpdate()) {
            if (passwordFieldsLockedUntil > Date.now()) {
                 toast({ title: "محاولة متكررة", description: `تم تعطيل تغيير كلمة المرور مؤقتًا. يرجى المحاولة بعد ${Math.ceil((passwordFieldsLockedUntil - Date.now()) / 60000)} دقائق.`, variant: "destructive" });
            } else {
                 toast({ title: "محاولة متكررة", description: `يرجى الانتظار قليلاً قبل محاولة تغيير كلمة المرور مرة أخرى.`, variant: "destructive" });
            }
            setIsSubmitting(false);
            return;
        }

        setLastPasswordUpdateAttempt(Date.now());
        localStorage.setItem(`lastPasswordUpdateAttempt_${user.uid}`, Date.now().toString());

        try {
            const credential = EmailAuthProvider.credential(user.email!, data.currentPassword);
            await reauthenticateWithCredential(firebaseAuth.currentUser, credential);
            await updatePassword(firebaseAuth.currentUser, data.newPassword);
            passwordUpdated = true;
            setPasswordAttemptCount(0);
            localStorage.setItem(`passwordAttemptCount_${user.uid}`, "0");
            setPasswordFieldsLockedUntil(0);
            localStorage.removeItem(`passwordFieldsLockedUntil_${user.uid}`);
        } catch (authError: any) {
            if (authError.code === 'auth/wrong-password' || authError.code === 'auth/too-many-requests') {
                const newAttemptCount = passwordAttemptCount + 1;
                setPasswordAttemptCount(newAttemptCount);
                localStorage.setItem(`passwordAttemptCount_${user.uid}`, newAttemptCount.toString());
                if (newAttemptCount >= MAX_PASSWORD_ATTEMPTS) {
                    const lockoutTime = Date.now() + PASSWORD_ATTEMPT_LOCKOUT_MS;
                    setPasswordFieldsLockedUntil(lockoutTime);
                    localStorage.setItem(`passwordFieldsLockedUntil_${user.uid}`, lockoutTime.toString());
                    toast({ title: "خطأ", description: `فشلت محاولات تغيير كلمة المرور عدة مرات. تم تعطيل الميزة لمدة ${PASSWORD_ATTEMPT_LOCKOUT_MS / 60000} دقائق.`, variant: "destructive" });
                } else {
                    toast({ title: "خطأ", description: "كلمة المرور الحالية غير صحيحة.", variant: "destructive" });
                }
            }
            throw authError; 
        }
      }

      if (displayNameUpdated && passwordUpdated) toast({ title: "تم تحديث الملف الشخصي وكلمة المرور بنجاح!" });
      else if (displayNameUpdated) toast({ title: "تم تحديث اسم العرض بنجاح!" });
      else if (passwordUpdated) toast({ title: "تم تحديث كلمة المرور بنجاح!" });
      else if (!form.formState.isDirty) toast({ title: "لا توجد تغييرات لحفظها."});
      
      form.reset({ displayName: data.displayName || user.displayName || "", currentPassword: "", newPassword: "", confirmNewPassword: "" });

    } catch (error: any) {
      console.error("Error updating profile:", error);
      let description = "حدث خطأ ما. يرجى المحاولة مرة أخرى.";
      if (error.code !== 'auth/wrong-password' && error.code !== 'auth/too-many-requests') {
        if (error.code === 'auth/weak-password') description = "كلمة المرور الجديدة ضعيفة جدًا (يجب أن تكون 6 أحرف على الأقل).";
        else if (error.code === 'auth/requires-recent-login') description = "تتطلب هذه العملية تسجيل دخول حديث. الرجاء تسجيل الخروج ثم الدخول مرة أخرى والمحاولة.";
        toast({ title: "خطأ في تحديث الملف الشخصي", description, variant: "destructive" });
      }
    } finally {
      setIsSubmitting(false);
      setIsWeakPasswordDialogOpen(false);
    }
  };

  const onSubmit = (data: ProfileFormValues) => {
    if (data.newPassword && passwordStrength.score < 2) {
      setIsWeakPasswordDialogOpen(true);
      return;
    }
    performSignupLogic(data);
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
  
  const userInitials = user.displayName ? user.displayName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : "");
  const isPasswordChangeDisabled = !canAttemptPasswordUpdate() || passwordFieldsLockedUntil > Date.now();
  let passwordLockoutMessage = "";
  if (passwordFieldsLockedUntil > Date.now()) {
    passwordLockoutMessage = `تغيير كلمة المرور معطل مؤقتًا. يرجى المحاولة بعد ${Math.ceil((passwordFieldsLockedUntil - Date.now()) / 60000)} دقائق.`;
  } else if (!canAttemptPasswordUpdate()) {
    passwordLockoutMessage = "لقد حاولت تغيير كلمة المرور مؤخرًا. يرجى الانتظار دقيقة واحدة.";
  }

  return (
    <>
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
              <Label htmlFor="displayName" className="flex items-center gap-1"><UserCircle size={18} /> اسم العرض</Label>
              <Input id="displayName" {...form.register("displayName")} placeholder="أدخل اسم العرض الخاص بك" disabled={isSubmitting} />
              {form.formState.errors.displayName && <p className="text-sm text-destructive">{form.formState.errors.displayName.message}</p>}
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
            {passwordLockoutMessage && <p className="text-sm text-destructive">{passwordLockoutMessage}</p>}
            <CardDescription>اترك الحقول التالية فارغة إذا كنت لا ترغب في تغيير كلمة المرور.</CardDescription>

            <div className="space-y-2">
              <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
              <Input id="currentPassword" type="password" {...form.register("currentPassword")} placeholder="••••••••" disabled={isSubmitting || isPasswordChangeDisabled} />
              {form.formState.errors.currentPassword && <p className="text-sm text-destructive">{form.formState.errors.currentPassword.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
              <Input id="newPassword" type="password" {...form.register("newPassword")} placeholder="••••••••" disabled={isSubmitting || isPasswordChangeDisabled} />
              {form.formState.errors.newPassword && <p className="text-sm text-destructive">{form.formState.errors.newPassword.message}</p>}
              {newPasswordValue && <PasswordStrengthIndicator strength={passwordStrength} />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">تأكيد كلمة المرور الجديدة</Label>
              <Input id="confirmNewPassword" type="password" {...form.register("confirmNewPassword")} placeholder="••••••••" disabled={isSubmitting || isPasswordChangeDisabled} />
              {form.formState.errors.confirmNewPassword && <p className="text-sm text-destructive">{form.formState.errors.confirmNewPassword.message}</p>}
            </div>

          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full transition-smooth hover:shadow-md" disabled={isSubmitting || !form.formState.isDirty || (form.formState.dirtyFields.currentPassword && isPasswordChangeDisabled)}>
              {isSubmitting ? (<Loader2 className="ml-2 h-4 w-4 animate-spin" />) : (<Edit3 size={18} className="ml-2 rtl:ml-0 rtl:mr-2"/>)}
              {isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
     <AlertDialog open={isWeakPasswordDialogOpen} onOpenChange={setIsWeakPasswordDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>كلمة المرور ضعيفة</AlertDialogTitle>
                <AlertDialogDescription>
                    كلمة المرور التي اخترتها ضعيفة وقد تكون سهلة التخمين. نوصي بشدة باستخدام كلمة مرور أقوى. هل ترغب في المتابعة على أي حال؟
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>إلغاء (اختيار كلمة أقوى)</AlertDialogCancel>
                <AlertDialogAction onClick={() => performSignupLogic(form.getValues())} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                    أنا أعي وأوافق، تسجيل على أية حال
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
    
