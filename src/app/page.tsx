
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, MapPin } from "lucide-react";
import type { Metadata } from 'next';
import { db as adminDb, isFirebaseAdminAppInitialized } from '@/lib/firebase/admin';
import StatisticsSection from "@/components/home/StatisticsSection";

export const metadata: Metadata = {
  title: 'عقاري - بوابتك العقارية الشاملة في الجزائر',
  description: 'ابحث عن شقق, بيوت, أراضي, وفلل للبيع أو الكراء في جميع ولايات الجزائر. اعرض عقارك بسهولة مع عقاري.',
};

export default async function HomePage() {
  let propertyCount = 0;

  if (isFirebaseAdminAppInitialized) {
    try {
      const propertiesRef = adminDb.collection('properties').where('status', '==', 'active');
      const snapshot = await propertiesRef.count().get();
      propertyCount = snapshot.data().count;
    } catch (error) {
      console.error("Failed to fetch property count for homepage (admin SDK might be misconfigured):", error);
      propertyCount = 1250; // Fallback number on query error
    }
  } else {
    // Fallback if admin SDK is not initialized at all
    propertyCount = 1250;
  }
  

  return (
    <div className="flex flex-col items-center text-center space-y-12 overflow-x-hidden">
      
      <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center text-center rounded-lg overflow-hidden -mt-4">
        <Image
          src="https://res.cloudinary.com/dgz2rwp09/image/upload/v1716568168/modern_villa_pool_aouiss.jpg"
          alt="فيلا عصرية مع مسبح"
          fill
          className="object-cover"
          priority
          data-ai-hint="modern villa pool"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-primary-foreground p-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline mb-4 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
            أهلاً بك في <span className="text-accent">عقاري</span>
          </h1>
          <p className="text-lg md:text-xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            منصتك المثالية لإيجار وبيع العقارات في الجزائر. ابحث عن منزلك المثالي أو اعرض عقارك بكل سهولة.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Button size="lg" asChild className="transition-smooth hover:shadow-lg transform hover:scale-105">
              <Link href="/dashboard/properties/new">أضف عقارك الآن</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="transition-smooth hover:shadow-lg transform hover:scale-105 border-white text-white hover:bg-white hover:text-primary">
              <Link href="/properties">تصفح العقارات</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-16">
        <h2 
          className="text-3xl font-bold font-headline mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200"
        >
          لماذا تختار عقاري؟
        </h2>
        <div className="grid md:grid-cols-3 gap-8 text-right">
          <Card className="shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="text-green-500" />
                <span>نشر سهل وسريع</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                أضف عقارك في دقائق معدودة مع واجهة استخدام بسيطة وفعالة.
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-400">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="text-green-500" />
                <span>خيارات بحث متقدمة</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                جد العقار المناسب لك بسهولة باستخدام فلاتر بحث دقيقة.
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="text-green-500" />
                <span>وصف ذكي للعقار</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                استفد من مساعدنا الذكي لتحسين وصف عقارك وجذب المزيد من المشترين.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="w-full py-12 md:py-16">
         <Image 
            src="https://res.cloudinary.com/dgz2rwp09/image/upload/v1716568168/modern_apartment_building_exterior_nuvocs.jpg" 
            alt="Featured Property Showcase" 
            width={1200} 
            height={400} 
            className="rounded-lg shadow-xl object-cover animate-in fade-in zoom-in-95 duration-1000"
            data-ai-hint="modern apartment building"
            priority
          />
      </section>

      <StatisticsSection propertyCount={propertyCount} />

       <section className="w-full py-12 md:py-16 bg-secondary/30 rounded-lg animate-in fade-in slide-in-from-bottom-12 duration-700">
        <h2 className="text-3xl font-bold font-headline mb-6">جاهز للبدء؟</h2>
        <p className="text-lg text-muted-foreground mb-8">
          انضم إلى آلاف المستخدمين الذين يثقون في عقاري لاحتياجاتهم العقارية.
        </p>
        <Button size="lg" asChild className="transition-smooth hover:shadow-lg transform hover:scale-105">
          <Link href="/signup">إنشاء حساب مجاني</Link>
        </Button>
      </section>
    </div>
  );
}
