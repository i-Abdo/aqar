
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

const BalanceScaleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g fill="currentColor">
      <path d="M500.609,322.275l-57.428-162.834c0.135,0.008,0.279,0.025,0.406,0.025 c39.538,0.677,49.422-20.58,54.566-27.94c7.118-10.171-7.91-20.343-15.816-13.558c-7.906,6.775-29.264,21.011-70.386,2.024 C374.874,102.875,309.87,73.098,271.92,67.399v-39c0-8.799-7.127-15.921-15.918-15.921c-8.795,0-15.922,7.122-15.922,15.921v39 c-37.95,5.699-102.953,35.476-140.031,52.593c-41.121,18.987-62.48,4.751-70.386-2.024c-7.906-6.784-22.935,3.388-15.816,13.558 c5.145,7.36,15.028,28.617,54.566,27.94c0.132,0,0.276-0.017,0.402-0.025L11.391,322.275H0 c11.497,38.025,46.804,65.736,88.595,65.736c41.786,0,77.093-27.711,88.59-65.736h-11.386l-60.355-171.134 c37.183-11.467,89.569-31.056,134.636-34.072v24.23h-8.507v267.748H218.37v23.858c-8.715,0-17.569,0-24.874,0 c-23.354,0-22.663,32.969-22.663,32.969c-19.233,0-28.85,15.101-28.85,33.648h228.033c0-18.546-9.616-33.648-28.845-33.648 c0,0,0.686-32.969-22.668-32.969c-7.305,0-16.159,0-24.874,0v-23.858h-13.203V141.3h-8.507v-24.23 c45.072,3.015,97.457,22.604,134.64,34.072l-60.358,171.134h-11.387c11.496,38.025,46.804,65.736,88.59,65.736 c41.79,0,77.098-27.711,88.594-65.736H500.609z M141.243,322.275H35.948L88.595,173L141.243,322.275z M370.758,322.275L423.41,173l52.643,149.275H370.758z" />
    </g>
  </svg>
);


const PaintBucketIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g fill="currentColor">
      <path d="M17.0408 10.6406L9.69083 3.29062L8.82083 2.42063C8.53083 2.13063 8.05083 2.13063 7.76083 2.42063C7.47083 2.71062 7.47083 3.19062 7.76083 3.48062L8.63083 4.35062L3.00083 9.98062C2.36083 10.6206 2.02083 11.2706 2.00083 11.9206C1.98083 12.6106 2.32083 13.3006 3.00083 13.9906L7.01083 18.0006C8.35083 19.3306 9.69083 19.3306 11.0208 18.0006L17.0408 11.9806C17.2408 11.7806 17.3308 11.5106 17.3108 11.2506C17.3008 11.0306 17.2008 10.8006 17.0408 10.6406Z" />
      <path d="M16 22.75H3C2.59 22.75 2.25 22.41 2.25 22C2.25 21.59 2.59 21.25 3 21.25H16C16.41 21.25 16.75 21.59 16.75 22C16.75 22.41 16.41 22.75 16 22.75Z" />
      <path d="M19.35 14.7803C19.09 14.5003 18.61 14.5003 18.35 14.7803C18.04 15.1203 16.5 16.8503 16.5 18.1703C16.5 19.4703 17.55 20.5203 18.85 20.5203C20.15 20.5203 21.2 19.4703 21.2 18.1703C21.2 16.8603 19.66 15.1203 19.35 14.7803Z" />
    </g>
  </svg>
);


const BriefcaseIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
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

const ServiceCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
  <Card className="text-center h-full flex flex-col group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
    <CardHeader className="items-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-primary/10 border-2 border-primary/20 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-10 h-10 text-primary" />
      </div>
      <CardTitle className="text-xl font-headline group-hover:text-primary transition-colors">{title}</CardTitle>
      <CardDescription className="mt-2 min-h-[40px]">{description}</CardDescription>
    </CardHeader>
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
  const [selectedWilaya, setSelectedWilaya] = React.useState<string | undefined>(undefined);

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
             <div className="w-full max-w-sm mx-auto mb-6 p-4 rounded-md bg-secondary/50 text-center">
                <p className="text-sm text-muted-foreground mb-2">لإضافة خدمتكم هنا يرجى التواصل معنا</p>
                <Button onClick={() => setIsContactDialogOpen(true)} variant="outline_primary" size="sm">
                    <PhoneIcon className="ml-2 rtl:mr-2 rtl:ml-0 h-4 w-4" />
                    تواصل معنا
                </Button>
            </div>
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

