
"use client";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Or a redirect component, handled by useEffect
  }

  return (
    <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row lg:space-x-12 lg:space-y-0 rtl:lg:space-x-reverse">
            <aside className="lg:w-1/5 h-full lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto lg:border-r rtl:lg:border-l rtl:lg:border-r-transparent border-border py-6 lg:py-0">
                 <DashboardNav />
            </aside>
            <div className="flex-1 lg:max-w-4xl xl:max-w-5xl">
                <div className="p-1 pt-6 lg:pt-1">{children}</div>
            </div>
        </div>
    </div>
  );
}
