import { AuthForm } from "@/components/auth/AuthForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "إنشاء حساب - DarDz",
  description: "أنشئ حسابًا جديدًا في DarDz.",
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
