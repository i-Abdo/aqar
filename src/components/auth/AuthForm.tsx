
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
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth as firebaseAuth, db } from '@/lib/firebase/client';
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import type { UserTrustLevel } from "@/types";

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

const loginSchema = baseSchema;

interface AuthFormProps {
  mode: "login" | "signup";
}

type AuthFormValues = z.infer<typeof signupSchema> | z.infer<typeof loginSchema>;


export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

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
    },
  });

  const onSubmit = async (values: AuthFormValues) => {
    setIsLoading(true);
    try {
      if (mode === "signup") {
        const signupValues = values as z.infer<typeof signupSchema>;
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, signupValues.email, signupValues.password);
        
        // Create user document in 'users' collection
        await setDoc(doc(db, "users", userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: signupValues.email,
          planId: "free",
          isAdmin: false,
          trustLevel: 'normal' as UserTrustLevel,
          newsletter: signupValues.subscribeToNewsletter,
          createdAt: serverTimestamp(),
        });
        
        // Create user email document in 'all-emails' collection
        await setDoc(doc(db, "all-emails", userCredential.user.uid), {
            email: signupValues.email,
            createdAt: serverTimestamp(),
        });

        toast({ title: "تم إنشاء الحساب بنجاح!", description: "جاري توجيهك إلى لوحة التحكم..." });
        router.push("/dashboard");
      } else {
        const loginValues = values as z.infer<typeof loginSchema>;
        await signInWithEmailAndPassword(firebaseAuth, loginValues.email, loginValues.password);
        toast({ title: "تم تسجيل الدخول بنجاح!" });
        const redirectPath = new URLSearchParams(window.location.search).get('redirect') || "/dashboard";
        router.push(redirectPath);
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      const errorMessage = error.code === 'auth/email-already-in-use' ? 'هذا البريد الإلكتروني مستخدم بالفعل.'
                          : error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
                          : 'حدث خطأ ما. الرجاء المحاولة مرة أخرى.';
      toast({
        title: "خطأ في المصادقة",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
                    className="text-sm font-normal cursor-pointer"
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
  );
}

    