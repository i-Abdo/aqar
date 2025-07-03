"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, Star, Zap, Crown, CheckCircle, ArrowUpCircle, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { plans } from "@/config/plans";
import type { Plan, PlanId } from "@/types";
import { Badge } from "@/components/ui/badge";
import { add } from 'date-fns';
import { PlanCard } from '@/components/pricing/PlanCard'; 
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export default function SubscriptionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user) {
      const planDetails = plans.find(p => p.id === (user.planId || 'free'));
      setCurrentPlan(planDetails || null);

      // Simulate subscription end date for display purposes
      if (user.createdAt && user.planId !== 'free') {
        // Assuming monthly subscription for now
        const endDate = add(new Date(user.createdAt), { months: 1 });
        setSubscriptionEndDate(endDate);
      } else {
        setSubscriptionEndDate(null);
      }
    }
  }, [user, authLoading]);

  const recommendedPlan = useMemo(() => {
    if (!currentPlan) return null;
    if (currentPlan.id === 'free') {
      return plans.find(p => p.id === 'vip');
    }
    if (currentPlan.id === 'vip') {
      return plans.find(p => p.id === 'vip_plus_plus');
    }
    return null; // User is on the highest plan
  }, [currentPlan]);

  const handleSelectPlan = async (planId: PlanId) => {
    if (!user) {
      toast({ title: "الرجاء تسجيل الدخول", description: "يجب عليك تسجيل الدخول لاختيار خطة.", variant: "destructive" });
      router.push("/login");
      return;
    }
    if (planId === currentPlan?.id) {
      toast({ title: "ملاحظة", description: "هذه هي خطتك الحالية." });
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, payment processing would happen here.
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { planId: planId });
      
      const newPlan = plans.find(p => p.id === planId);
      setCurrentPlan(newPlan || null);

      toast({ title: "تم تحديث الخطة بنجاح!", description: `لقد تم اشتراكك في خطة ${newPlan?.name}.` });
      
    } catch (error) {
      console.error("Error updating plan:", error);
      toast({ title: "خطأ", description: "لم نتمكن من تحديث خطتك. الرجاء المحاولة مرة أخرى.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };


  if (authLoading || !currentPlan) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-20rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const PlanIcon = currentPlan.id === 'free' ? Star : currentPlan.id === 'vip' ? Zap : Crown;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-headline">إدارة الاشتراك</h1>
        <p className="text-muted-foreground mt-1">
          عرض تفاصيل خطتك الحالية وترقيتها للوصول إلى ميزات أقوى.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Current Plan Card */}
        <Card className="shadow-xl sticky top-24">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-headline flex items-center gap-2">
                <PlanIcon className="text-primary" />
                <span>خطتك الحالية</span>
              </CardTitle>
              <Badge variant="outline_primary">{currentPlan.name}</Badge>
            </div>
            <CardDescription>
              {currentPlan.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptionEndDate ? (
              <div className="p-3 rounded-md bg-secondary text-center mb-4">
                <p className="text-sm text-muted-foreground">ينتهي اشتراكك في:</p>
                <p className="font-bold text-primary">
                  {subscriptionEndDate.toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            ) : (
                 <div className="p-3 rounded-md bg-secondary text-center mb-4">
                    <p className="text-sm text-muted-foreground">أنت حاليًا على الخطة المجانية.</p>
                </div>
            )}
            <h4 className="font-semibold mb-3">الميزات المضمنة:</h4>
            <ul className="space-y-3">
              {currentPlan.features.map((feature, index) => {
                const hasCheck = feature.endsWith(" ✓") || feature.endsWith(" ✓✓");
                const hasCross = feature.endsWith(" ✕");
                const Icon = hasCheck ? CheckCircle : XCircle;
                const iconColor = hasCheck ? "text-green-500" : "text-destructive/70";
                const textColor = hasCross ? "text-muted-foreground line-through" : "text-foreground";
                const textElement = feature.replace(/ (✓|✓✓|✕)$/, '').trim();

                return (
                  <li key={index} className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                    <span className={textColor}>{textElement}</span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
           <CardFooter>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/pricing">مقارنة جميع الخطط</Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Upgrade Suggestion Card */}
        {recommendedPlan ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-headline text-center flex items-center justify-center gap-2">
                <ArrowUpCircle className="text-accent"/>
                انتقل إلى المستوى التالي!
            </h2>
            <PlanCard
              plan={recommendedPlan}
              isCurrentPlan={false}
              isFeatured={recommendedPlan.id === 'vip'}
              onSelectPlan={handleSelectPlan}
              isLoading={isLoading}
            />
          </div>
        ) : (
          <Card className="shadow-xl flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
             <Crown className="h-16 w-16 mb-4" />
             <CardTitle className="text-2xl font-headline">أنت في القمة!</CardTitle>
             <CardDescription className="text-primary-foreground/80 mt-2">
                لديك أفضل خطة متاحة لدينا. شكرًا لكونك جزءًا من عائلتنا المميزة.
             </CardDescription>
          </Card>
        )}
      </div>
    </div>
  );
}
