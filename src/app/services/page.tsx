
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Metadata } from "next";
import { Briefcase, Building, Gavel, Hammer, PaintBrush, ShieldCheck, Truck, Camera, DraftingCompass } from "lucide-react";
import Link from 'next/link';

export const metadata: Metadata = {
  title: "خدمات عقارية موصى بها - عقاري",
  description: "ابحث عن أفضل المهنيين والخدمات لمساعدتك في كل خطوة من رحلتك العقارية، من المحامين إلى شركات النقل.",
};

export default function ServicesPage() {
  // We are not using a dynamic list anymore to avoid component rendering issues.
  // Each card will be hardcoded for simplicity and to guarantee a fix.

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <Briefcase className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4 text-primary">
          دليل الخدمات العقارية
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          كل ما تحتاجه في مكان واحد. اكتشف قائمة من المهنيين الموثوقين لمساعدتك في كل مراحل عمليتك العقارية.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        
        {/* Card 1: Lawyers */}
        <Card className="group shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center flex flex-col">
          <CardHeader className="items-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-primary/10 border-2 border-primary/20 group-hover:bg-primary/20 transition-colors">
                <Gavel className="w-10 h-10 text-primary" />
              </div>
            <CardTitle className="text-xl font-headline group-hover:text-primary transition-colors">محامون وموثقون</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <CardDescription>لضمان صحة العقود والمعاملات القانونية بكل شفافية وأمان.</CardDescription>
          </CardContent>
        </Card>

        {/* Card 2: Architects */}
        <Card className="group shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center flex flex-col">
          <CardHeader className="items-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-primary/10 border-2 border-primary/20 group-hover:bg-primary/20 transition-colors">
                <DraftingCompass className="w-10 h-10 text-primary" />
              </div>
            <CardTitle className="text-xl font-headline group-hover:text-primary transition-colors">مهندسون معماريون</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <CardDescription>لتصميم منزل أحلامك أو الإشراف على مشاريع البناء والتجديد.</CardDescription>
          </CardContent>
        </Card>
        
        {/* Card 3: Photographers */}
        <Card className="group shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center flex flex-col">
          <CardHeader className="items-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-primary/10 border-2 border-primary/20 group-hover:bg-primary/20 transition-colors">
                <Camera className="w-10 h-10 text-primary" />
              </div>
            <CardTitle className="text-xl font-headline group-hover:text-primary transition-colors">مصورون محترفون</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <CardDescription>لإبراز جمال عقارك بصور وفيديوهات احترافية تجذب المشترين.</CardDescription>
          </CardContent>
        </Card>

        {/* Card 4: Contractors */}
        <Card className="group shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center flex flex-col">
          <CardHeader className="items-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-primary/10 border-2 border-primary/20 group-hover:bg-primary/20 transition-colors">
                <Hammer className="w-10 h-10 text-primary" />
              </div>
            <CardTitle className="text-xl font-headline group-hover:text-primary transition-colors">شركات أشغال ومقاولات</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <CardDescription>لتنفيذ أعمال البناء، الترميم، أو التجديدات بجودة عالية.</CardDescription>
          </CardContent>
        </Card>

        {/* Card 5: Movers */}
        <Card className="group shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center flex flex-col">
          <CardHeader className="items-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-primary/10 border-2 border-primary/20 group-hover:bg-primary/20 transition-colors">
                <Truck className="w-10 h-10 text-primary" />
              </div>
            <CardTitle className="text-xl font-headline group-hover:text-primary transition-colors">خدمات نقل الأثاث</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <CardDescription>لنقل أثاثك بأمان وسرعة إلى منزلك الجديد دون عناء.</CardDescription>
          </CardContent>
        </Card>

        {/* Card 6: Insurance */}
        <Card className="group shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center flex flex-col">
          <CardHeader className="items-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-primary/10 border-2 border-primary/20 group-hover:bg-primary/20 transition-colors">
                <ShieldCheck className="w-10 h-10 text-primary" />
              </div>
            <CardTitle className="text-xl font-headline group-hover:text-primary transition-colors">شركات تأمين العقار</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <CardDescription>لحماية استثمارك العقاري من أي مخاطر مستقبلية غير متوقعة.</CardDescription>
          </CardContent>
        </Card>

        {/* Card 7: Interior Design */}
        <Card className="group shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center flex flex-col">
          <CardHeader className="items-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-primary/10 border-2 border-primary/20 group-hover:bg-primary/20 transition-colors">
                <PaintBrush className="w-10 h-10 text-primary" />
              </div>
            <CardTitle className="text-xl font-headline group-hover:text-primary transition-colors">تصميم داخلي وديكور</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <CardDescription>لإضافة لمسة فنية وجمالية لمساحاتك وتحويلها إلى مكان فريد.</CardDescription>
          </CardContent>
        </Card>

        {/* Card 8: Property Management */}
        <Card className="group shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center flex flex-col">
          <CardHeader className="items-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-primary/10 border-2 border-primary/20 group-hover:bg-primary/20 transition-colors">
                <Building className="w-10 h-10 text-primary" />
              </div>
            <CardTitle className="text-xl font-headline group-hover:text-primary transition-colors">إدارة الممتلكات</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <CardDescription>للمهتمين بالاستثمار، نوفر خدمات إدارة العقارات المؤجرة بكفاءة.</CardDescription>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-12 bg-secondary/50 border-primary/20 text-center py-8">
        <CardHeader>
            <CardTitle className="text-2xl font-headline">هل أنت مقدم خدمة؟</CardTitle>
            <CardDescription className="text-base text-muted-foreground max-w-xl mx-auto mt-2">
                هل ترغب في عرض خدماتك أمام آلاف المستخدمين المهتمين بالعقارات؟ تواصل معنا لمعرفة كيف يمكنك الانضمام إلى دليلنا.
            </CardDescription>
        </CardHeader>
        <CardContent>
             <Link href="/#contact-us" className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                تواصل معنا الآن
            </Link>
        </CardContent>
      </Card>
    </div>
  );
}
