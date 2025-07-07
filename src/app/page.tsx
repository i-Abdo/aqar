
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Feather, SlidersHorizontal, Sparkles, Search, Phone, KeyRound, LifeBuoy, Lightbulb, TrendingUp, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import dynamic from 'next/dynamic';
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Property } from "@/types";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { PropertyCardSkeleton } from "@/components/properties/PropertyCardSkeleton";

const ContactDialog = dynamic(() =>
  import('@/components/layout/ContactDialog').then((mod) => mod.ContactDialog)
);

export default function HomePage() {
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [popularProperties, setPopularProperties] = useState<Property[]>([]);
  const [isLoadingPopular, setIsLoadingPopular] = useState(true);
  
  useEffect(() => {
    const fetchPopularProperties = async () => {
      setIsLoadingPopular(true);
      try {
        const q = query(
          collection(db, "properties"),
          where("status", "==", "active")
        );
        const querySnapshot = await getDocs(q);
        const propsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt),
          updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate() : new Date(doc.data().updatedAt),
        } as Property));
        
        // Sort by viewCount in descending order and take the top 3
        propsData.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        const popularProps = propsData.slice(0, 3);

        setPopularProperties(popularProps);
      } catch (error) {
        console.error("Error fetching popular properties:", error);
      } finally {
        setIsLoadingPopular(false);
      }
    };

    fetchPopularProperties();
  }, []);

  const features = [
    {
      icon: Feather,
      title: "نشر سهل وسريع",
      description: "أضف عقارك في دقائق معدودة مع واجهة استخدام بسيطة وفعالة مصممة لتوفير وقتك وجهدك.",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: SlidersHorizontal,
      title: "خيارات بحث متقدمة",
      description: "جد العقار المناسب لك بسهولة باستخدام فلاتر بحث دقيقة تشمل الموقع، السعر، والمواصفات.",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Sparkles,
      title: "وصف ذكي للعقار",
      description: "استفد من مساعدنا الذكي لتحسين وصف عقارك، مما يجذب المزيد من المشترين والمهتمين.",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  const steps = [
    {
      icon: Search,
      title: "ابحث عن عقارك",
      description: "استخدم أدوات البحث القوية لتصفح آلاف العقارات المعروضة في جميع أنحاء الجزائر.",
    },
    {
      icon: Phone,
      title: "تواصل مباشرة",
      description: "تواصل بسهولة مع المالك عبر الهاتف أو وسائل التواصل الاجتماعي لترتيب زيارة.",
    },
    {
      icon: KeyRound,
      title: "أتمم الصفقة",
      description: "احصل على منزل أحلامك أو استثمر في عقارك الجديد بثقة وأمان.",
    },
  ];

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center text-center space-y-20 sm:space-y-24 md:space-y-32">
          
          <section className="relative w-full py-20 md:py-32 flex items-center justify-center text-center -mt-8">
            <div className="absolute inset-0 bg-primary/5 overflow-hidden -z-10">
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
            </div>

            <div className="relative z-10 p-4 max-w-4xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline mb-6 tracking-tight text-primary animate-in fade-in slide-in-from-bottom-4 duration-700">
                عقاري: دليلك الأول لسوق العقار
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mx-auto mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                منصتك المثالية لإيجار وبيع العقارات في الجزائر. ابحث عن منزلك المثالي أو اعرض عقارك بكل سهولة وثقة.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                <Button size="lg" asChild className="transition-smooth hover:shadow-lg transform hover:scale-105">
                  <Link href="/dashboard/properties/new">أضف عقارك الآن</Link>
                </Button>
                <Button size="lg" variant="outline_primary" asChild className="transition-smooth hover:shadow-lg transform hover:scale-105">
                  <Link href="/properties">تصفح العقارات</Link>
                </Button>
              </div>
            </div>
          </section>

          <section className="w-full">
            <h2 className="text-3xl font-bold font-headline mb-4 text-center">لماذا تختار <span className="text-primary">عقاري</span>؟</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              نحن نقدم مجموعة من الميزات المصممة لجعل تجربتك في البحث عن العقارات أو عرضها هي الأفضل على الإطلاق.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-right shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-10 duration-700" style={{ animationDelay: `${200 + index * 100}ms` }}>
                  <CardHeader>
                    <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4", feature.bgColor)}>
                      <feature.icon className={cn("w-6 h-6", feature.color)} />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

           <section className="w-full">
            <h2 className="text-3xl font-bold font-headline mb-4 text-center flex items-center justify-center gap-2">
              <TrendingUp className="text-accent"/>
              <span>العقارات الأكثر رواجًا</span>
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              اكتشف العقارات التي تحظى بأكبر قدر من الاهتمام من المستخدمين الآخرين.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingPopular
                ? Array.from({ length: 3 }).map((_, i) => <PropertyCardSkeleton key={i} />)
                : popularProperties.map(prop => <PropertyCard key={prop.id} property={prop} />)}
            </div>
            {(!isLoadingPopular && popularProperties.length === 0) && (
              <p className="text-center text-muted-foreground mt-4">لا توجد عقارات رائجة لعرضها حاليًا.</p>
            )}
          </section>

          <section className="w-full py-16 bg-secondary/30 rounded-lg">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold font-headline mb-4 text-center">كيف يعمل الموقع؟</h2>
              <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
                ثلاث خطوات بسيطة تفصلك عن عقارك القادم.
              </p>
              <div className="grid md:grid-cols-3 gap-8 text-center">
                {steps.map((step, index) => (
                  <div key={index} className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-10 duration-700" style={{ animationDelay: `${300 + index * 150}ms` }}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-primary/10 border-2 border-primary/20">
                      <step.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
          
          <section className="w-full">
            <h2 className="text-3xl font-bold font-headline mb-4 text-center">موارد إضافية لمساعدتك</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              سواء كنت بائعًا، مشتريًا، أو تبحث عن معلومات، نحن هنا لنوفر لك الدعم اللازم.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-10 duration-700 text-right" style={{ animationDelay: '400ms' }}>
                <div className="p-8 flex flex-col h-full">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-accent/10 border-2 border-accent/20">
                    <Lightbulb className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">دليلك العقاري</h3>
                  <p className="text-muted-foreground mb-6 flex-grow">
                    اكتشف نصائح الخبراء لبيع وشراء وتأجير العقارات. تعلم كيف تحقق أفضل الصفقات وتتجنب الأخطاء الشائعة.
                  </p>
                  <Button asChild size="lg" variant="outline_accent" className="mt-auto w-fit self-end">
                    <Link href="/tips">اطلع على النصائح</Link>
                  </Button>
                </div>
              </Card>

              <Card className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-10 duration-700 text-right" style={{ animationDelay: '500ms' }}>
                <div className="p-8 flex flex-col h-full">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-blue-500/10 border-2 border-blue-500/20">
                    <LifeBuoy className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">هل لديك استفسار؟</h3>
                  <p className="text-muted-foreground mb-6 flex-grow">
                    فريقنا جاهز للإجابة على جميع أسئلتك ومساعدتك في كل خطوة. لا تتردد في التواصل معنا.
                  </p>
                  <Button onClick={() => setIsContactDialogOpen(true)} size="lg" variant="outline_primary" className="mt-auto w-fit self-end">
                    تواصل معنا
                  </Button>
                </div>
              </Card>
            </div>
          </section>

          <section className="w-full py-16 md:py-20 bg-primary text-primary-foreground rounded-lg animate-in fade-in slide-in-from-bottom-12 duration-700">
            <h2 className="text-3xl font-bold font-headline mb-6">جاهز للبدء؟</h2>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              انضم إلى آلاف المستخدمين الذين يثقون في عقاري لاحتياجاتهم العقارية. أنشئ حسابك المجاني اليوم وابدأ رحلتك.
            </p>
            <Button size="lg" variant="secondary" asChild className="transition-smooth hover:shadow-lg transform hover:scale-105">
              <Link href="/signup">إنشاء حساب مجاني</Link>
            </Button>
          </section>
        </div>
      </div>
      {isContactDialogOpen && <ContactDialog isOpen={isContactDialogOpen} onOpenChange={setIsContactDialogOpen} />}
    </>
  );
}
