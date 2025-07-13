
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Metadata } from "next";
import { Briefcase, Gavel, DraftingCompass, Camera, Hammer, Truck, ShieldCheck, PaintBrush, Building } from "lucide-react";

export const metadata: Metadata = {
  title: "خدمات عقارية موصى بها - عقاري",
  description: "ابحث عن أفضل المهنيين والخدمات لمساعدتك في كل خطوة من رحلتك العقارية، من المحامين إلى شركات النقل.",
};

export default function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <Briefcase className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-4xl font-headline text-primary">
            دليل الخدمات العقارية
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            كل ما تحتاجه في مكان واحد. اكتشف قائمة من المهنيين الموثوقين لمساعدتك في كل مراحل عمليتك العقارية.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 px-4 md:px-8">
          <Accordion type="single" collapsible className="w-full">
            
            <AccordionItem value="lawyers">
              <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                <div className="flex items-center gap-3">
                  <Gavel className="text-primary" />
                  <span>محامون وموثقون</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 text-base leading-relaxed text-foreground/90 pr-4 border-r-2 border-primary">
                <p className="text-muted-foreground">
                  خبراء لضمان صحة العقود والمعاملات القانونية بكل شفافية وأمان. يساعدونك في مراجعة الأوراق الرسمية وتسجيل الممتلكات.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="architects">
              <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                <div className="flex items-center gap-3">
                  <DraftingCompass className="text-primary" />
                  <span>مهندسون معماريون</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 text-base leading-relaxed text-foreground/90 pr-4 border-r-2 border-primary">
                <p className="text-muted-foreground">
                  لتصميم منزل أحلامك أو الإشراف على مشاريع البناء والتجديد. يقدمون حلولاً مبتكرة لتحقيق أقصى استفادة من المساحات.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="photographers">
              <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                <div className="flex items-center gap-3">
                  <Camera className="text-primary" />
                  <span>مصورون محترفون</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 text-base leading-relaxed text-foreground/90 pr-4 border-r-2 border-primary">
                <p className="text-muted-foreground">
                  لإبراز جمال عقارك بصور وفيديوهات احترافية تجذب المشترين والمهتمين، وتزيد من فرص البيع أو الإيجار.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="contractors">
              <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                <div className="flex items-center gap-3">
                  <Hammer className="text-primary" />
                  <span>شركات أشغال ومقاولات</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 text-base leading-relaxed text-foreground/90 pr-4 border-r-2 border-primary">
                <p className="text-muted-foreground">
                  لتنفيذ أعمال البناء، الترميم، أو التجديدات بجودة عالية والتزام بالمواعيد.
                </p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="movers">
              <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                <div className="flex items-center gap-3">
                  <Truck className="text-primary" />
                  <span>خدمات نقل الأثاث</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 text-base leading-relaxed text-foreground/90 pr-4 border-r-2 border-primary">
                <p className="text-muted-foreground">
                  لنقل أثاثك وممتلكاتك بأمان وسرعة إلى منزلك الجديد دون عناء أو قلق.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="insurance">
              <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-primary" />
                  <span>شركات تأمين العقار</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 text-base leading-relaxed text-foreground/90 pr-4 border-r-2 border-primary">
                <p className="text-muted-foreground">
                  لحماية استثمارك العقاري من أي مخاطر مستقبلية غير متوقعة مثل الحرائق أو الكوارث الطبيعية.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="interior-design">
              <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                <div className="flex items-center gap-3">
                  <PaintBrush className="text-primary" />
                  <span>تصميم داخلي وديكور</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 text-base leading-relaxed text-foreground/90 pr-4 border-r-2 border-primary">
                <p className="text-muted-foreground">
                  لإضافة لمسة فنية وجمالية لمساحاتك وتحويلها إلى مكان فريد يعكس ذوقك الشخصي.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="management">
              <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                <div className="flex items-center gap-3">
                  <Building className="text-primary" />
                  <span>إدارة الممتلكات</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 text-base leading-relaxed text-foreground/90 pr-4 border-r-2 border-primary">
                <p className="text-muted-foreground">
                  للمهتمين بالاستثمار، نوفر خدمات إدارة العقارات المؤجرة بكفاءة، من تحصيل الإيجار إلى الصيانة.
                </p>
              </AccordionContent>
            </AccordionItem>
            
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
