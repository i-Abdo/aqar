
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, List, FileImage } from 'lucide-react';
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function AdvertiserDashboardPage() {
    const { user, loading } = useAuth();
    
    // Placeholder stats
    const stats = {
        totalAds: 0,
        serviceAds: 0,
        generalAds: 0,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-20rem)]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">لوحة تحكم المعلنين</h1>
                <p className="text-muted-foreground mt-1">
                    مرحباً {user?.displayName || 'أيها المعلن'}! هنا يمكنك إدارة حملاتك الإعلانية.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي الإعلانات</CardTitle>
                        <BarChart className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalAds.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">مجموع كل إعلاناتك النشطة.</p>
                    </CardContent>
                </Card>
                <Card className="shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إعلانات الخدمات</CardTitle>
                        <List className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.serviceAds.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">الإعلانات التي تظهر في صفحة الخدمات.</p>
                    </CardContent>
                </Card>
                <Card className="shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">الإعلانات العامة (المنبثقة)</CardTitle>
                        <FileImage className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.generalAds.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">الإعلانات التي تظهر كنوافذ منبثقة.</p>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>ملاحظات البدء</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        استخدم القائمة الجانبية للتنقل بين أقسام إدارة الإعلانات. يمكنك إضافة إعلانات للخدمات لتظهر في دليل الخدمات، أو إضافة إعلانات عامة لتظهر للمستخدمين أثناء تصفحهم.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
