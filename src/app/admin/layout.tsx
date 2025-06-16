"use client";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardNav } from "@/components/dashboard/DashboardNav"; // Can reuse or create AdminNav

const adminNavItems = [ // Example, adjust as needed
  { title: "إدارة العقارات", href: "/admin/properties", icon: LayoutDashboard },
  { title: "إدارة المستخدمين", href: "/admin/users", icon: UserCircle },
  { title: "إعدادات الموقع", href: "/admin/settings", icon: Settings },
];

function AdminSidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="grid items-start gap-2">
      {adminNavItems.map((item, index) => (
        <Link
          key={index}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "justify-start text-base p-3 transition-smooth",
            pathname === item.href
              ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
              : "hover:bg-accent hover:text-accent-foreground",
          )}
        >
          <item.icon className="mr-2 h-5 w-5 rtl:mr-0 rtl:ml-2" />
          {item.title}
        </Link>
      ))}
    </nav>
  );
}


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login?redirect=/admin");
      } else if (!isAdmin) {
        router.push("/dashboard"); // Or an unauthorized page
      }
    }
  }, [user, isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
       <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive mb-2">وصول غير مصرح به</h1>
        <p className="text-muted-foreground mb-6">ليس لديك الصلاحيات اللازمة للوصول إلى هذه الصفحة.</p>
        <Button asChild>
          <Link href="/dashboard">العودة إلى لوحة التحكم</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto">
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0 rtl:lg:space-x-reverse">
            <aside className="lg:w-1/5">
                 <h2 className="text-xl font-semibold mb-4 px-3">لوحة الإدارة</h2>
                 <AdminSidebarNav />
            </aside>
            <div className="flex-1 lg:max-w-4xl xl:max-w-5xl">
                {children}
            </div>
        </div>
    </div>
  );
}

// Dummy imports for AdminSidebarNav example
import { LayoutDashboard, UserCircle, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
