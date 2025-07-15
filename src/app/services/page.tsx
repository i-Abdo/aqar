
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React from "react";
import dynamic from 'next/dynamic';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin } from "lucide-react";

const ContactDialog = dynamic(() =>
  import('@/components/layout/ContactDialog').then((mod) => mod.ContactDialog)
);

// --- SVG Icons defined as components ---

const BriefcaseIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);

const BalanceScaleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M2 6h20" />
        <path d="M12 2v20" />
        <path d="M4 10l8-4 8 4" />
        <path d="M4 18l8-4 8 4" />
    </svg>
);

const RulerIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L3 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/>
  </svg>
);

const CameraIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>
  </svg>
);

const HammerIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9"/><path d="m18 15 4-4"/><path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5Z"/>
  </svg>
);

const TruckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"/><circle cx="7" cy="18" r="2"/><path d="M9 18h6"/><circle cx="18" cy="18" r="2"/>
  </svg>
);

const ShieldIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
  </svg>
);

const PaintBucketIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18.2 11.8a4 4 0 0 0-5.6-5.6l-5.6 5.6a4 4 0 0 0 5.6 5.6Z" />
      <path d="m9.2 12.8 1.4-1.4" />
      <path d="M2 13v3c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-3" />
      <path d="M7 21v-2.1" />
      <path d="M12 21v-2.1" />
      <path d="M17 21v-2.1" />
    </svg>
);

const BuildingIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>
  </svg>
);

const PhoneIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const ServiceCard = ({ icon: Icon, title, description, onContactClick }: { icon: React.ElementType, title: string, description: string, onContactClick: () => void }) => (
  <Card className="text-center h-full flex flex-col group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
    <CardHeader className="items-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-primary/10 border-2 border-primary/20 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-10 h-10 text-primary" />
      </div>
      <CardTitle className="text-xl font-headline group-hover:text-primary transition-colors">{title}</CardTitle>
      <CardDescription className="mt-2 min-h-[40px]">{description}</CardDescription>
    </CardHeader>
    <CardContent className="flex-grow flex flex-col justify-end">
       <div className="mt-4 p-3 rounded-md bg-secondary/50 text-center">
            <p className="text-sm text-muted-foreground mb-2">لإضافة خدمتكم هنا يرجى التواصل معنا</p>
            <Button onClick={onContactClick} variant="outline_primary" size="sm">
                <PhoneIcon className="ml-2 rtl:mr-2 rtl:ml-0 h-4 w-4" />
                تواصل معنا
            </Button>
        </div>
    </CardContent>
  </Card>
);

const services = [
  { icon: BalanceScaleIcon, title: "محامون وموثقون", description: "خبراء لضمان صحة العقود والمعاملات القانونية بكل شفافية وأمان." },
  { icon: RulerIcon, title: "مهندسون معماريون", description: "لتصميم منزل أحلامك أو الإشراف على مشاريع البناء والتجديد." },
  { icon: CameraIcon, title: "مصورون محترفون", description: "لإبراز جمال عقارك بصور وفيديوهات احترافية تجذب المشترين." },
  { icon: HammerIcon, title: "شركات أشغال ومقاولات", description: "لتنفيذ أعمال البناء، الترميم، أو التجديدات بجودة عالية." },
  { icon: TruckIcon, title: "خدمات نقل الأثاث", description: "لنقل أثاثك وممتلكاتك بأمان وسرعة إلى منزلك الجديد." },
  { icon: ShieldIcon, title: "شركات تأمين العقار", description: "لحماية استثمارك العقاري من أي مخاطر مستقبلية غير متوقعة." },
  { icon: PaintBucketIcon, title: "تصميم داخلي وديكور", description: "لإضافة لمسة فنية وجمالية لمساحاتك وتحويلها إلى مكان فريد." },
  { icon: BuildingIcon, title: "إدارة الممتلكات", description: "للمهتمين بالاستثمار، نوفر خدمات إدارة العقارات المؤجرة بكفاءة." }
];

const wilayas = [
  "أدرار", "الشلف", "الأغواط", "أم البواقي", "باتنة", "بجاية", "بسكرة", "بشار",
  "البليدة", "البويرة", "تمنراست", "تبسة", "تلمسان", "تيارت", "تيزي وزو", "الجزائر",
  "الجلفة", "جيجل", "سطيف", "سعيدة", "سكيكدة", "سيدي بلعباس", "عنابة", "قالمة",
  "قسنطينة", "المدية", "مستغانم", "المسيلة", "معسكر", "ورقلة", "وهران", "البيض",
  "إليزي", "برج بوعريريج", "بومرداس", "الطارف", "تندوف", "تيسمسيلت", "الوادي", "خنشلة",
  "سوق أهراس", "تيبازة", "ميلة", "عين الدفلى", "النعامة", "عين تموشنت", "غرداية", "غليزان"
];

const ALL_WILAYAS_VALUE = "_all_wilayas_";

export default function ServicesPage() {
  const [isContactDialogOpen, setIsContactDialogOpen] = React.useState(false);
  const [selectedWilaya, setSelectedWilaya] = React.useState(ALL_WILAYAS_VALUE);

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-6xl mx-auto shadow-xl">
          <CardHeader className="text-center">
            <BriefcaseIcon className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-4xl font-headline text-primary">
              دليل الخدمات العقارية
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
              كل ما تحتاجه في مكان واحد. اكتشف قائمة من المهنيين الموثوقين لمساعدتك في كل مراحل عمليتك العقارية.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-10">
                <div className="w-full max-w-sm">
                    <Select value={selectedWilaya} onValueChange={setSelectedWilaya}>
                        <SelectTrigger className="text-base h-12">
                            <MapPin className="mr-2 ml-2 h-5 w-5 text-muted-foreground"/>
                            <SelectValue placeholder="اختر ولايتك لعرض الخدمات المتوفرة..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL_WILAYAS_VALUE}>جميع الولايات</SelectItem>
                            {wilayas.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-8">
              {services.map((service) => (
                <ServiceCard 
                  key={service.title} 
                  icon={service.icon} 
                  title={service.title} 
                  description={service.description} 
                  onContactClick={() => setIsContactDialogOpen(true)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      {isContactDialogOpen && <ContactDialog isOpen={isContactDialogOpen} onOpenChange={setIsContactDialogOpen} />}
    </>
  );
}
