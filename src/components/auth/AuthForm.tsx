
"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, Check, X } from "lucide-react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth as firebaseAuth, db } from '@/lib/firebase/client';
import { doc, setDoc, serverTimestamp, updateDoc, deleteDoc, getDoc } from "firebase/firestore";
import type { UserTrustLevel } from "@/types";
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

const baseSchema = z.object({
  email: z.string().email({ message: "البريد الإلكتروني غير صالح." }),
  password: z.string().min(6, { message: "يجب أن تكون كلمة المرور 6 أحرف على الأقل." }),
});

const signupSchema = baseSchema.extend({
  confirmPassword: z.string().min(6, { message: "يجب أن تكون كلمة المرور 6 أحرف على الأقل." }),
  subscribeToNewsletter: z.boolean().default(true),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "يجب الموافقة على الشروط والأحكام لإكمال التسجيل.",
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "كلمتا المرور غير متطابقتين.",
  path: ["confirmPassword"],
});

const loginSchema = baseSchema.extend({
  subscribeToNewsletter: z.boolean().default(true),
});

interface AuthFormProps {
  mode: "login" | "signup";
}

type AuthFormValues = z.infer<typeof signupSchema> | z.infer<typeof loginSchema>;

interface PasswordStrengthResult {
  score: number; // 0-4
  text: string;
  color: string;
  criteria: {
    length: boolean;
    lowercase: boolean;
    uppercase: boolean;
    number: boolean;
    specialChar: boolean;
  };
}

const calculatePasswordStrength = (password: string): PasswordStrengthResult => {
  let score = 0;
  const criteria = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    specialChar: /[^A-Za-z0-9]/.test(password),
  };

  if (criteria.length) score++;
  if (criteria.lowercase && criteria.uppercase) score++;
  if (criteria.number) score++;
  if (criteria.specialChar) score++;

  let text = "ضعيفة جداً";
  let color = "bg-destructive"; // Red

  if (score === 1) {
    text = "ضعيفة";
    color = "bg-destructive";
  } else if (score === 2) {
    text = "متوسطة";
    color = "bg-yellow-500";
  } else if (score === 3) {
    text = "قوية";
    color = "bg-green-500";
  } else if (score >= 4) {
    text = "قوية جداً";
    color = "bg-green-500";
  }
  
  if (password.length > 0 && password.length < 6) {
    return {
      score: 0,
      text: "قصيرة جداً",
      color: "bg-destructive",
      criteria: { ...criteria, length: false },
    };
  }

  if (password.length === 0) {
    return { score: 0, text: "", color: "bg-transparent", criteria };
  }

  return { score, text, color, criteria };
};

const PasswordStrengthIndicator = ({ strength }: { strength: PasswordStrengthResult }) => {
  if (!strength.text) return null;

  return (
    <div className="space-y-2 pt-2">
      <div className="flex items-center gap-2">
        <Progress value={(strength.score / 4) * 100} className={`h-2 flex-1 [&>div]:${strength.color}`} />
        <span className="text-xs text-muted-foreground w-20 text-center font-medium">{strength.text}</span>
      </div>
       {strength.score < 4 && (
        <p className="text-xs text-muted-foreground">
          لتقوية كلمة السر، استخدم حروفًا وأرقامًا ورموزًا.
        </p>
      )}
    </div>
  );
};


export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isWeakPasswordDialogOpen, setIsWeakPasswordDialogOpen] = React.useState(false);

  const togglePasswordVisibility = () => setShowPassword(prev => !prev);

  const currentSchema = mode === 'signup' ? signupSchema : loginSchema;

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      email: "",
      password: "",
      ...(mode === 'signup' && {
        confirmPassword: "",
        subscribeToNewsletter: true,
        agreeToTerms: false,
      }),
      ...(mode === 'login' && {
        subscribeToNewsletter: true,
      }),
    },
  });
  
  const passwordValue = form.watch("password");
  const passwordStrength = React.useMemo(() => calculatePasswordStrength(passwordValue), [passwordValue]);
  const agreeToTermsValue = form.watch("agreeToTerms");

  const performSignup = async (values: z.infer<typeof signupSchema>) => {
    setIsLoading(true);
    try {
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, values.email, values.password);
        
        await setDoc(doc(db, "users", userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: values.email,
          planId: "free",
          isAdmin: false,
          trustLevel: 'normal' as UserTrustLevel,
          newsletter: values.subscribeToNewsletter,
          createdAt: serverTimestamp(),
        });
        
        await setDoc(doc(db, "all-emails", userCredential.user.uid), {
            email: values.email,
            createdAt: serverTimestamp(),
        });

        if (values.subscribeToNewsletter) {
            await setDoc(doc(db, "subscribers", userCredential.user.uid), {
                email: values.email,
                createdAt: serverTimestamp(),
            });
        }

        toast({ title: "تم إنشاء الحساب بنجاح!", description: "جاري توجيهك إلى لوحة التحكم..." });
        router.push("/dashboard");
    } catch (error: any) {
        handleAuthError(error);
    } finally {
        setIsLoading(false);
        setIsWeakPasswordDialogOpen(false);
    }
  };

  const handleAuthError = (error: any) => {
    console.error("Authentication error:", error);
    const errorMessage = error.code === 'auth/email-already-in-use' ? 'هذا البريد الإلكتروني مستخدم بالفعل.'
                        : error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
                        : 'حدث خطأ ما. الرجاء المحاولة مرة أخرى.';
    toast({
      title: "خطأ في المصادقة",
      description: errorMessage,
      variant: "destructive",
    });
  }

  const onSubmit = async (values: AuthFormValues) => {
    if (mode === "signup") {
      const signupValues = values as z.infer<typeof signupSchema>;
      if (passwordStrength.score < 2) { // Weak password threshold (score 0 or 1)
        setIsWeakPasswordDialogOpen(true);
        return;
      }
      await performSignup(signupValues);
    } else { // Login mode
        setIsLoading(true);
        try {
            const loginValues = values as z.infer<typeof loginSchema>;
            const userCredential = await signInWithEmailAndPassword(firebaseAuth, loginValues.email, loginValues.password);
            
            const userRef = doc(db, "users", userCredential.user.uid);
            const allEmailsRef = doc(db, "all-emails", userCredential.user.uid);
            const subscriberRef = doc(db, "subscribers", userCredential.user.uid);

            // Add email to all-emails if not present
            const allEmailsSnap = await getDoc(allEmailsRef);
            if (!allEmailsSnap.exists()) {
                await setDoc(allEmailsRef, { email: loginValues.email, createdAt: serverTimestamp() });
            }

            if (loginValues.subscribeToNewsletter) {
                await updateDoc(userRef, { newsletter: true });
                await setDoc(subscriberRef, { email: loginValues.email, createdAt: serverTimestamp() }, { merge: true });
            } else {
                await updateDoc(userRef, { newsletter: false });
                await deleteDoc(subscriberRef);
            }

            toast({ title: "تم تسجيل الدخول بنجاح!" });
            const redirectPath = new URLSearchParams(window.location.search).get('redirect') || "/dashboard";
            router.push(redirectPath);
        } catch (error: any) {
            handleAuthError(error);
        } finally {
            setIsLoading(false);
        }
    }
  };
  
  const handleProceedWithWeakPassword = async () => {
    const values = form.getValues() as z.infer<typeof signupSchema>;
    await performSignup(values);
  };

  return (
    <>
    <Card className="w-full shadow-2xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-headline">
          {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب جديد"}
        </CardTitle>
        <CardDescription>
          {mode === "login"
            ? "أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى حسابك."
            : "املأ النموذج أدناه لإنشاء حسابك."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@mail.com"
              {...form.register("email")}
              className="text-right"
              aria-invalid={form.formState.errors.email ? "true" : "false"}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="********"
                {...form.register("password")}
                className="text-right pl-10"
                aria-invalid={form.formState.errors.password ? "true" : "false"}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 left-0 h-full px-3 text-muted-foreground"
                aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            )}
            {mode === "signup" && passwordValue && (
              <PasswordStrengthIndicator strength={passwordStrength} />
            )}
          </div>

          {mode === "signup" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                 <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="********"
                      {...form.register("confirmPassword")}
                      className="text-right pl-10"
                      aria-invalid={form.formState.errors.confirmPassword ? "true" : "false"}
                    />
                     <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 left-0 h-full px-3 text-muted-foreground"
                        aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                 </div>
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">{form.formState.errors.confirmPassword?.message}</p>
                )}
              </div>
              <div className="items-top flex space-x-2 rtl:space-x-reverse">
                <Controller
                  name="subscribeToNewsletter"
                  control={form.control}
                  render={({ field }) => (
                    <Checkbox
                      id="subscribeToNewsletter"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="subscribeToNewsletter"
                    className="text-sm font-normal cursor-pointer"
                  >
                    أوافق على استلام رسائل بريد إلكتروني حول التحديثات والعروض.
                  </Label>
                </div>
              </div>
              <div className="items-top flex space-x-2 rtl:space-x-reverse">
                <Controller
                  name="agreeToTerms"
                  control={form.control}
                  render={({ field }) => (
                    <Checkbox
                      id="agreeToTerms"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-invalid={!!form.formState.errors.agreeToTerms}
                    />
                  )}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="agreeToTerms"
                    className={cn(
                      "text-sm font-normal cursor-pointer",
                      !agreeToTermsValue && "text-muted-foreground"
                    )}
                  >
                    أوافق على{" "}
                    <Link
                      href="/terms"
                      className="underline hover:text-primary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      الشروط والأحكام
                    </Link>
                  </Label>
                  {form.formState.errors.agreeToTerms && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.agreeToTerms?.message}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {mode === "login" && (
            <div className="items-top flex space-x-2 rtl:space-x-reverse">
                <Controller
                    name="subscribeToNewsletter"
                    control={form.control}
                    render={({ field }) => (
                    <Checkbox
                        id="subscribeToNewsletterLogin"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                    />
                    )}
                />
                <div className="grid gap-1.5 leading-none">
                    <Label
                    htmlFor="subscribeToNewsletterLogin"
                    className="text-sm font-normal cursor-pointer"
                    >
                    أوافق على استلام رسائل بريد إلكتروني حول التحديثات والعروض.
                    </Label>
                </div>
            </div>
          )}

          {mode === 'login' && (
            <p className="text-center text-xs text-muted-foreground pt-2">
                بالنقر على "تسجيل الدخول"، فإنك توافق على{" "}
                <Link href="/terms" className="underline hover:text-primary">
                    شروط الاستخدام
                </Link>
                .
            </p>
          )}

          <Button type="submit" className="w-full transition-smooth hover:shadow-md" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "login" ? "تسجيل الدخول" : "إنشاء الحساب"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-2">
        <p className="text-sm text-muted-foreground">
          {mode === "login" ? "ليس لديك حساب؟" : "هل لديك حساب بالفعل؟"}
          <Button variant="link" asChild className="text-primary">
            <Link href={mode === "login" ? "/signup" : "/login"}>
              {mode === "login" ? "إنشاء حساب" : "تسجيل الدخول"}
            </Link>
          </Button>
        </p>
      </CardFooter>
    </Card>

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
                <AlertDialogAction onClick={handleProceedWithWeakPassword} disabled={isLoading}>
                    {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                    أنا أعي وأوافق، تسجيل على أية حال
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
