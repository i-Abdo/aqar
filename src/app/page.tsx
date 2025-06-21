
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, MapPin } from "lucide-react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'عقاري - بوابتك العقارية الشاملة في الجزائر',
  description: 'ابحث عن شقق، بيوت، أراضي، وفلل للبيع أو الكراء في جميع ولايات الجزائر. اعرض عقارك بسهولة مع عقاري.',
};

const popularCities = [
  { name: "الجزائر", hint: "Algiers cityscape" , image: "https://placehold.co/400x300.png" },
  { name: "وهران", hint: "Oran waterfront" , image: "https://placehold.co/400x300.png" },
  { name: "قسنطينة", hint: "Constantine bridge" , image: "https://placehold.co/400x300.png" },
  { name: "عنابة", hint: "Annaba beach" , image: "https://placehold.co/400x300.png" },
  { name: "البليدة", hint: "Blida mountains" , image: "https://placehold.co/400x300.png" },
  { name: "سطيف", hint: "Setif landmark" , image: "https://placehold.co/400x300.png" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col items-center text-center space-y-12">
      <section className="pt-12 md:pt-20">
        <h1 className="text-4xl md:text-6xl font-bold font-headline mb-6 tracking-tight">
          أهلاً بك في <span className="text-primary">عقاري</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mx-auto mb-8">
          منصتك المثالية لإيجار وبيع العقارات في الجزائر. ابحث عن منزلك المثالي أو اعرض عقارك بكل سهولة.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" asChild className="transition-smooth hover:shadow-lg transform hover:scale-105">
            <Link href="/dashboard/properties/new">أضف عقارك الآن</Link>
          </Button>
          <Button size="lg" variant="outline_primary" asChild className="transition-smooth hover:shadow-lg transform hover:scale-105">
            <Link href="/properties">تصفح العقارات</Link>
          </Button>
        </div>
      </section>

      <section className="w-full py-12 md:py-16">
        <h2 className="text-3xl font-bold font-headline mb-10">لماذا تختار عقاري؟</h2>
        <div className="grid md:grid-cols-3 gap-8 text-right">
          <Card className="shadow-lg hover:shadow-xl transition-smooth">
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
          <Card className="shadow-lg hover:shadow-xl transition-smooth">
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
          <Card className="shadow-lg hover:shadow-xl transition-smooth">
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
            src="https://placehold.co/1200x400.png" 
            alt="Featured Property Showcase" 
            width={1200} 
            height={400} 
            className="rounded-lg shadow-xl object-cover"
            data-ai-hint="modern apartment building"
            priority
          />
      </section>

      <section className="w-full py-12 md:py-16">
        <h2 className="text-3xl font-bold font-headline mb-10">أشهر المدن</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {popularCities.map((city) => (
            <Link key={city.name} href={`/properties?wilaya=${city.name}`} passHref>
              <Card className="group overflow-hidden shadow-md hover:shadow-xl transition-smooth transform hover:-translate-y-1 cursor-pointer">
                <div className="relative w-full h-40">
                  <Image
                    src={city.image}
                    alt=""
                    fill
                    style={{objectFit:"cover"}}
                    className="transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={city.hint}
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-center group-hover:text-primary transition-colors">
                    {city.name}
                  </h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

       <section className="w-full py-12 md:py-16 bg-secondary/30 rounded-lg">
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
