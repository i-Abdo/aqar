
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import type { Metadata } from "next";

// export const metadata: Metadata = { // Similar to LoginPage, metadata better in layout or generateMetadata
//   title: "إنشاء حساب - عقاري",
//   description: "أنشئ حسابًا جديدًا في عقاري.",
// };

export default function SignupPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading || (!loading && user)) {
    // Show loader while checking auth or if user exists (and redirect is imminent)
    return (
      <div className="flex flex-col justify-center items-center min-h-[300px] text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">جاري التحقق من المصادقة...</p>
      </div>
    );
  }

  // If not loading and no user, show the signup form
  return <AuthForm mode="signup" />;
}
