
"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, List, FileImage, Eye, MousePointerClick } from 'lucide-react';
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { collection, query, where, getCountFromServer, getDocs, collectionGroup } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { ServiceAd, GeneralAd } from "@/types";

interface AdStats {
  totalAds: number;
  serviceAds: number;
  generalAds: number;
  totalViews: number;
  totalClicks: number;
}

export default function AdvertiserDashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const [stats, setStats] = useState<AdStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const serviceAdsQuery = query(collection(db, 'service_ads'), where('advertiserId', '==', user.uid));
                const generalAdsQuery = query(collection(db, 'general_ads'), where('advertiserId', '==', user.uid));

                const [serviceAdsSnapshot, generalAdsSnapshot] = await Promise.all([
                    getDocs(serviceAdsQuery),
                    getDocs(generalAdsQuery),
                ]);

                const serviceAdsData = serviceAdsSnapshot.docs.map(doc => doc.data() as ServiceAd);
                const generalAdsData = generalAdsSnapshot.docs.map(doc => doc.data() as GeneralAd);

                const serviceViews = serviceAdsData.reduce((sum, ad) => sum + (ad.views || 0), 0);
                const serviceClicks = serviceAdsData.reduce((sum, ad) => sum + (ad.clicks || 0), 0);
                const generalViews = generalAdsData.reduce((sum, ad) => sum + (ad.views || 0), 0);
                const generalClicks = generalAdsData.reduce((sum, ad) => sum + (ad.clicks || 0), 0);

                setStats({
                    totalAds: serviceAdsSnapshot.size + generalAdsSnapshot.size,
                    serviceAds: serviceAdsSnapshot.size,
                    generalAds: generalAdsSnapshot.size,
                    totalViews: serviceViews + generalViews,
                    totalClicks: serviceClicks + generalClicks,
                });

            } catch (error) {
                console.error("Failed to fetch advertiser stats:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user && !authLoading) {
            fetchStats();
        }
    }, [user, authLoading]);

    if (authLoading || isLoading) {
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
                        <div className="text-2xl font-bold">{(stats?.totalAds || 0).toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">مجموع كل إعلاناتك النشطة.</p>
                    </CardContent>
                </Card>
                <Card className="shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي المشاهدات</CardTitle>
                        <Eye className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{(stats?.totalViews || 0).toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">إجمالي عدد مرات ظهور إعلاناتك.</p>
                    </CardContent>
                </Card>
                <Card className="shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي النقرات</CardTitle>
                        <MousePointerClick className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{(stats?.totalClicks || 0).toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">إجمالي عدد النقرات على إعلاناتك.</p>
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
