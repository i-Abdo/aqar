
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Metadata } from "next";
import { Briefcase, Building, Gavel, Hammer, PaintBrush, ShieldCheck, Truck, Camera, DraftingCompass } from "lucide-react";
import Link from 'next/link';

export const metadata: Metadata = {
  title: "خدمات عقارية موصى بها - عقاري",
  description: "ابحث عن أفضل المهنيين والخدمات لمساعدتك في كل خطوة من رحلتك العقارية، من المحامين إلى شركات النقل.",
};

const services = [
  {
    icon: Gavel,
    title: "محامون وموثقون",
    description: "لضمان صحة العقود والمعاملات القانونية بكل شفافية وأمان."
  },
  {
    icon: DraftingCompass,
    title: "مهندسون معماريون",
    description: "لتصميم منزل أحلامك أو الإشراف على مشاريع البناء والتجديد."
  },
   {
    icon: Camera,
    title: "مصورون محترفون",
    description: "لإبراز جمال عقارك بصور وفيديوهات احترافية تجذب المشترين."
  },
  {
    icon: Hammer,
    title: "شركات أشغال ومقاولات",
    description: "لتنفيذ أعمال البناء، الترميم، أو التجديدات بجودة عالية."
  },
  {
    icon: Truck,
    title: "خدمات نقل الأثاث",
    description: "لنقل أثاثك بأمان وسرعة إلى منزلك الجديد دون عناء."
  },
  {
    icon: ShieldCheck,
    title: "شركات تأمين العقار",
    description: "لحماية استثمارك العقاري من أي مخاطر مستقبلية غير متوقعة."
  },
  {
    icon: PaintBrush,
    title: "تصميم داخلي وديكور",
    description: "لإضافة لمسة فنية وجمالية لمساحاتك وتحويلها إلى مكان فريد."
  },
  {
    icon: Building,
    title: "إدارة الممتلكات",
    description: "للمهتمين بالاستثمار، نوفر خدمات إدارة العقارات المؤجرة بكفاءة."
  }
];


export default function ServicesPage() {
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
        {services.map((service, index) => {
          const ServiceIcon = service.icon;
          return (
            <Card key={index} className="group shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center flex flex-col">
              <CardHeader className="items-center">
                 <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-primary/10 border-2 border-primary/20 group-hover:bg-primary/20 transition-colors">
                    <ServiceIcon className="w-10 h-10 text-primary" />
                  </div>
                <CardTitle className="text-xl font-headline group-hover:text-primary transition-colors">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription>{service.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
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
