
"use client";

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
import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';
import React from "react";
import { Phone } from "lucide-react";

const ContactDialog = dynamic(() =>
  import('@/components/layout/ContactDialog').then((mod) => mod.ContactDialog)
);


// Inline SVG components
const BriefcaseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>
);
const GavelIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m14 13-8.5 8.5a2.12 2.12 0 1 1-3-3L11 10"/><path d="m15.5 7.5 3-3a2.12 2.12 0 0 1 3 3l-3 3"/><path d="m2 22 3-3"/><path d="m19 5-3 3"/></svg>
);
const RulerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/></svg>
);
const CameraIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
);
const HammerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9"/><path d="m18 15 4-4"/><path d="m21.5 11.5-1.914-1.914A2 2 0 0 0 18.172 9l-3.354 3.354a2 2 0 0 0 0 2.828l1.914 1.914a2 2 0 0 0 2.828 0l1.914-1.914a2 2 0 0 0 0-2.828Z"/></svg>
);
const TruckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 18H3c0-1.5.6-3 2-4h1"/><path d="M14 18h2"/><path d="M19 18h2c.6 0 1-.4 1-1v-3.6c0-1.4-1.4-2.4-2.8-2.4H16c-1.5 0-3 1.1-3 2.5V18c0 .6.4 1 1 1h2.5"/><path d="M8 18h1.5c.8 0 1.5.7 1.5 1.5V21a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1.5c0-.8.7-1.5 1.5-1.5Z"/><path d="M16 18h1.5c.8 0 1.5.7 1.5 1.5V21a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1.5c0-.8.7-1.5 1.5-1.5Z"/><path d="M12 11h4"/><path d="M12 8h2"/></svg>
);
const ShieldIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
);
const PaintBrushIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);
const BuildingIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
);

const AddServiceCta = ({ onClick }: { onClick: () => void }) => (
  <div className="mt-4 p-3 rounded-md bg-secondary/50 text-center">
      <p className="text-sm text-muted-foreground mb-2">لإضافة خدمتكم هنا يرجى التواصل معنا</p>
      <Button onClick={onClick} variant="outline_primary" size="sm">
          <Phone size={16} className="ml-2 rtl:mr-2 rtl:ml-0" />
          تواصل معنا
      </Button>
  </div>
);


export default function ServicesPage() {
  const [isContactDialogOpen, setIsContactDialogOpen] = React.useState(false);

  return (
    <>
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <BriefcaseIcon className="mx-auto h-12 w-12 text-primary mb-4" />
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
                  <GavelIcon className="text-primary" />
                  <span>محامون وموثقون</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 text-base leading-relaxed text-foreground/90 pr-4 border-r-2 border-primary">
                <p className="text-muted-foreground">
                  خبراء لضمان صحة العقود والمعاملات القانونية بكل شفافية وأمان. يساعدونك في مراجعة الأوراق الرسمية وتسجيل الممتلكات.
                </p>
                 <AddServiceCta onClick={() => setIsContactDialogOpen(true)} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="architects">
              <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                <div className="flex items-center gap-3">
                  <RulerIcon className="text-primary" />
                  <span>مهندسون معماريون</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 text-base leading-relaxed text-foreground/90 pr-4 border-r-2 border-primary">
                <p className="text-muted-foreground">
                  لتصميم منزل أحلامك أو الإشراف على مشاريع البناء والتجديد. يقدمون حلولاً مبتكرة لتحقيق أقصى استفادة من المساحات.
                </p>
                <AddServiceCta onClick={() => setIsContactDialogOpen(true)} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="photographers">
              <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                <div className="flex items-center gap-3">
                  <CameraIcon className="text-primary" />
                  <span>مصورون محترفون</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 text-base leading-relaxed text-foreground/90 pr-4 border-r-2 border-primary">
                <p className="text-muted-foreground">
                  لإبراز جمال عقارك بصور وفيديوهات احترافية تجذب المشترين والمهتمين، وتزيد من فرص البيع أو الإيجار.
                </p>
                <AddServiceCta onClick={() => setIsContactDialogOpen(true)} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="contractors">
              <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                <div className="flex items-center gap-3">
                  <HammerIcon className="text-primary" />
                  <span>شركات أشغال ومقاولات</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 text-base leading-relaxed text-foreground/90 pr-4 border-r-2 border-primary">
                <p className="text-muted-foreground">
                  لتنفيذ أعمال البناء، الترميم، أو التجديدات بجودة عالية والتزام بالمواعيد.
                </p>
                <AddServiceCta onClick={() => setIsContactDialogOpen(true)} />
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="movers">
              <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                <div className="flex items-center gap-3">
                  <TruckIcon className="text-primary" />
                  <span>خدمات نقل الأثاث</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 text-base leading-relaxed text-foreground/90 pr-4 border-r-2 border-primary">
                <p className="text-muted-foreground">
                  لنقل أثاثك وممتلكاتك بأمان وسرعة إلى منزلك الجديد دون عناء أو قلق.
                </p>
                <AddServiceCta onClick={() => setIsContactDialogOpen(true)} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="insurance">
              <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                <div className="flex items-center gap-3">
                  <ShieldIcon className="text-primary" />
                  <span>شركات تأمين العقار</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 text-base leading-relaxed text-foreground/90 pr-4 border-r-2 border-primary">
                <p className="text-muted-foreground">
                  لحماية استثمارك العقاري من أي مخاطر مستقبلية غير متوقعة مثل الحرائق أو الكوارث الطبيعية.
                </p>
                <AddServiceCta onClick={() => setIsContactDialogOpen(true)} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="interior-design">
              <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                <div className="flex items-center gap-3">
                  <PaintBrushIcon className="text-primary" />
                  <span>تصميم داخلي وديكور</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 text-base leading-relaxed text-foreground/90 pr-4 border-r-2 border-primary">
                <p className="text-muted-foreground">
                  لإضافة لمسة فنية وجمالية لمساحاتك وتحويلها إلى مكان فريد يعكس ذوقك الشخصي.
                </p>
                <AddServiceCta onClick={() => setIsContactDialogOpen(true)} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="management">
              <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                <div className="flex items-center gap-3">
                  <BuildingIcon className="text-primary" />
                  <span>إدارة الممتلكات</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 text-base leading-relaxed text-foreground/90 pr-4 border-r-2 border-primary">
                <p className="text-muted-foreground">
                  للمهتمين بالاستثمار، نوفر خدمات إدارة العقارات المؤجرة بكفاءة، من تحصيل الإيجار إلى الصيانة.
                </p>
                <AddServiceCta onClick={() => setIsContactDialogOpen(true)} />
              </AccordionContent>
            </AccordionItem>
            
          </Accordion>
        </CardContent>
      </Card>
    </div>
    {isContactDialogOpen && <ContactDialog isOpen={isContactDialogOpen} onOpenChange={setIsContactDialogOpen} />}
    </>
  );
}
