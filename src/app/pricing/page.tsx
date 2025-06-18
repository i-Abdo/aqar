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
import { Metadata } from 'next';

// export const metadata: Metadata = { // Cannot be used in client component
//   title: "الأسعار - عقاري",
//   description: "اختر الخطة التي تناسب احتياجاتك في عقاري.",
// };


export default function PricingPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [currentPlanId, setCurrentPlanId] = useState<PlanId | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

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
    return <div className="text-center py-10">جاري تحميل بيانات المستخدم...</div>;
  }


  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline mb-4">خطط أسعار مرنة تناسب الجميع</h1>
        <p className="text-xl text-muted-foreground">
          اختر الخطة المثالية لك وابدأ في عرض أو إيجاد العقارات اليوم.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {predefinedPlans.map((plan) => (
          <PlanCard 
            key={plan.id} 
            plan={plan} 
            isCurrentPlan={currentPlanId === plan.id}
            onSelectPlan={handleSelectPlan}
            isLoading={isLoading}
          />
        ))}
      </div>
       <p className="text-center text-muted-foreground mt-12">
        جميع الأسعار بالدينار الجزائري (DZD). يمكنك إلغاء أو تغيير خطتك في أي وقت.
      </p>
    </div>
  );
}
