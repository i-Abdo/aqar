import { AuthForm } from "@/components/auth/AuthForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "تسجيل الدخول - DarDz",
  description: "سجل الدخول إلى حسابك في DarDz.",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
