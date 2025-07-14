
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
import { Loader2, Eye, EyeOff } from "lucide-react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, type AuthError } from 'firebase/auth';
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
import { Separator } from "@/components/ui/separator";
import * as Sentry from "@sentry/nextjs";

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
        <path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657	C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.222,0-9.641-3.219-11.303-7.553l-6.571,4.819C9.656,39.663,16.318,44,24,44z"></path>
        <path fill="#1565c0" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238	C42.018,35.258,44,30.036,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);


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
    return {
      score: 0,
      text: "قصيرة جداً",
      color: "bg-destructive", // Red
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
        <Progress 
          value={(strength.score / 4) * 100} 
          className="h-2 flex-1"
          indicatorClassName={strength.color}
        />
        <span className="text-xs text-muted-foreground w-20 text-center font-medium">{strength.text}</span>
      </div>
      {strength.score < 3 && (
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

  const handleAuthError = (error: AuthError) => {
    let errorMessage = "حدث خطأ ما. الرجاء المحاولة مرة أخرى.";
    let shouldReportToSentry = true;

    // These are expected user errors, not application bugs.
    const expectedErrorCodes = [
        'auth/email-already-in-use',
        'auth/user-not-found',
        'auth/wrong-password',
        'auth/invalid-credential',
        'auth/popup-closed-by-user',
        'auth/account-exists-with-different-credential'
    ];
    
    if (expectedErrorCodes.includes(error.code)) {
        shouldReportToSentry = false; // Don't report expected errors.
    }

    switch (error.code) {
        case 'auth/email-already-in-use':
            errorMessage = 'هذا البريد الإلكتروني مستخدم بالفعل في حساب آخر.';
            break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
            break;
        case 'auth/popup-closed-by-user':
            errorMessage = 'تم إغلاق نافذة تسجيل الدخول. يرجى المحاولة مرة أخرى.';
            break;
        case 'auth/account-exists-with-different-credential':
            errorMessage = 'يوجد حساب بالفعل بنفس البريد الإلكتروني ولكن بطريقة تسجيل دخول مختلفة (مثلاً، البريد وكلمة المرور). حاول تسجيل الدخول بالطريقة الأخرى.';
            break;
        default:
            if (error.message.includes('network')) {
                errorMessage = 'فشل الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت.';
                shouldReportToSentry = false; // Network errors are not app bugs.
            }
            break;
    }
    
    if (shouldReportToSentry) {
        Sentry.captureException(error, {
            extra: { context: "Authentication Form Error" }
        });
        console.error("Unexpected authentication error:", error);
    }
    
    toast({
        title: "خطأ في المصادقة",
        description: errorMessage,
        variant: "destructive",
    });
  };

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

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
        const userCredential = await signInWithPopup(firebaseAuth, provider);
        const gUser = userCredential.user;

        const userDocRef = doc(db, "users", gUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
            // New user, create document
            await setDoc(userDocRef, {
                uid: gUser.uid,
                email: gUser.email,
                displayName: gUser.displayName,
                photoURL: gUser.photoURL,
                planId: "free",
                isAdmin: false,
                trustLevel: 'normal' as UserTrustLevel,
                newsletter: true,
                createdAt: serverTimestamp(),
            });
            await setDoc(doc(db, "all-emails", gUser.uid), { email: gUser.email, createdAt: serverTimestamp() });
            await setDoc(doc(db, "subscribers", gUser.uid), { email: gUser.email, createdAt: serverTimestamp() });
        }
        
        toast({ title: "تم تسجيل الدخول بنجاح!" });
        const redirectPath = new URLSearchParams(window.location.search).get('redirect') || "/dashboard";
        router.push(redirectPath);
    } catch (error: any) {
        handleAuthError(error);
    } finally {
        setIsLoading(false);
    }
  };


  const onSubmit = async (values: AuthFormValues) => {
    if (mode === "signup") {
      const signupValues = values as z.infer<typeof signupSchema>;
      if (passwordStrength.score < 2) { 
        setIsWeakPasswordDialogOpen(true);
        return;
      }
      await performSignup(signupValues);
    } else { 
        setIsLoading(true);
        try {
            const loginValues = values as z.infer<typeof loginSchema>;
            const userCredential = await signInWithEmailAndPassword(firebaseAuth, loginValues.email, loginValues.password);
            
            const userRef = doc(db, "users", userCredential.user.uid);
            const allEmailsRef = doc(db, "all-emails", userCredential.user.uid);
            const subscriberRef = doc(db, "subscribers", userCredential.user.uid);

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
        <div className="space-y-4">
            <Button variant="default" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                <span className="ml-2">متابعة باستخدام جوجل</span>
            </Button>

            <div className="flex items-center gap-4">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">أو</span>
                <Separator className="flex-1" />
            </div>

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
                          !!form.formState.errors.agreeToTerms && "text-destructive"
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

              <Button type="submit" variant="default" className="w-full transition-shadow duration-300 hover:shadow-neon-primary" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "login" ? "تسجيل الدخول بالبريد الإلكتروني" : "إنشاء حساب بالبريد الإلكتروني"}
              </Button>
            </form>
        </div>
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

    