
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import type { Metadata } from "next";

// Metadata object needs to be defined outside the component for client components,
// or handled in a parent layout if dynamic values are needed.
// For simplicity, if static, it can remain here but won't be dynamically processed by Next.js in "use client".
// It's generally better to move static metadata to layout.tsx or use generateMetadata for dynamic.
// However, for this specific fix, we'll focus on the redirect logic.
// export const metadata: Metadata = { // This would ideally be in a layout or generateMetadata
//   title: "تسجيل الدخول - DarDz",
//   description: "سجل الدخول إلى حسابك في DarDz.",
// };

export default function LoginPage() {
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

  // If not loading and no user, show the login form
  return <AuthForm mode="login" />;
}
