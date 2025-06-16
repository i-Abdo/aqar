"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation"; // For App Router
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Firebase Auth imports - these would be used in your actual action
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth as firebaseAuth, db } from '@/lib/firebase/client'; // Assuming firebaseAuth is exported from your client setup
import { doc, setDoc } from "firebase/firestore";


const formSchema = z.object({
  email: z.string().email({ message: "البريد الإلكتروني غير صالح." }),
  password: z.string().min(6, { message: "يجب أن تكون كلمة المرور 6 أحرف على الأقل." }),
});

type AuthFormValues = z.infer<typeof formSchema>;

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: AuthFormValues) => {
    setIsLoading(true);
    try {
      if (mode === "signup") {
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, values.email, values.password);
        // Create user document in Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: values.email,
          planId: "free", // Default plan
          isAdmin: false, // Default admin status
          createdAt: new Date(),
        });
        toast({ title: "تم إنشاء الحساب بنجاح!", description: "يمكنك الآن تسجيل الدخول." });
        router.push("/login");
      } else {
        await signInWithEmailAndPassword(firebaseAuth, values.email, values.password);
        toast({ title: "تم تسجيل الدخول بنجاح!" });
        router.push("/dashboard"); // Redirect to dashboard or home
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
            <Input
              id="password"
              type="password"
              placeholder="********"
              {...form.register("password")}
              className="text-right"
              aria-invalid={form.formState.errors.password ? "true" : "false"}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>
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
