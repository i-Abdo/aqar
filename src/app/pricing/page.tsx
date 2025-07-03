"use client";

import { useState, useEffect } from 'react';
import { PlanCard } from "@/components/pricing/PlanCard";
import { plans as predefinedPlans } from "@/config/plans";
import type { Plan, PlanId } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function PricingPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [currentPlanId, setCurrentPlanId] = useState<PlanId | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    async function fetchUserPlan() {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setCurrentPlanId(userDocSnap.data().planId || 'free');
        } else {
          setCurrentPlanId('free'); // Default if no plan found
        }
      }
    }
    if (!authLoading && user) {
      fetchUserPlan();
    }
  }, [user, authLoading]);


  const handleSelectPlan = async (planId: PlanId) => {
    if (!user) {
      toast({ title: "الرجاء تسجيل الدخول", description: "يجب عليك تسجيل الدخول لاختيار خطة.", variant: "destructive" });
      router.push("/login");
      return;
    }
    if (planId === currentPlanId) {
      toast({ title: "ملاحظة", description: "هذه هي خطتك الحالية." });
      return;
    }

    setIsLoading(true);
    try {
      // This is a placeholder for actual payment processing.
      // In a real app, you would integrate with a payment gateway here.
      // After successful payment, update the user's plan in Firestore.
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { planId: planId });
      setCurrentPlanId(planId);
      toast({ title: "تم تحديث الخطة بنجاح!", description: `لقد تم اشتراكك في خطة ${predefinedPlans.find(p => p.id === planId)?.name}.` });
      // Optionally redirect or provide further instructions
      router.push("/dashboard");
    } catch (error) {
      console.error("Error updating plan:", error);
      toast({ title: "خطأ", description: "لم نتمكن من تحديث خطتك. الرجاء المحاولة مرة أخرى.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (authLoading) {
    return (
      <div className="flex justify-center items-center py-10 min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mr-4 text-muted-foreground">جاري تحميل بيانات المستخدم...</p>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4 text-primary">
          خطة لكل احتياج
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          سواء كنت تبدأ للتو أو تدير قائمة كبيرة من العقارات، لدينا الخطة المثالية لدعم أهدافك.
        </p>
      </div>
      
      <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse mb-10">
        <Label htmlFor="billing-interval" className="font-semibold text-lg">شهري</Label>
        <Switch
          id="billing-interval"
          checked={billingInterval === 'yearly'}
          onCheckedChange={(checked) => setBillingInterval(checked ? 'yearly' : 'monthly')}
          aria-label="Toggle billing interval"
        />
        <Label htmlFor="billing-interval" className="font-semibold text-lg">
          سنوي <span className="text-sm text-green-500 font-normal">(وفر 20%)</span>
        </Label>
      </div>


      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
        {predefinedPlans.map((plan) => (
          <PlanCard 
            key={plan.id} 
            plan={plan}
            interval={billingInterval}
            isCurrentPlan={currentPlanId === plan.id}
            isFeatured={plan.id === 'vip'}
            onSelectPlan={handleSelectPlan}
            isLoading={isLoading || authLoading}
          />
        ))}
      </div>
       <p className="text-center text-muted-foreground mt-12">
        جميع الأسعار بالدينار الجزائري (DZD). يمكنك إلغاء أو تغيير خطتك في أي وقت.
      </p>
    </div>
  );
}
