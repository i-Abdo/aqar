
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';
import React from "react";
import { Phone, Briefcase, Gavel, Ruler, Camera, Hammer, Truck, Shield, PaintBrush, Building } from "lucide-react";
import Link from "next/link";

const ContactDialog = dynamic(() =>
  import('@/components/layout/ContactDialog').then((mod) => mod.ContactDialog)
);

const services = [
  {
    icon: Gavel,
    title: "محامون وموثقون",
    description: "خبراء لضمان صحة العقود والمعاملات القانونية بكل شفافية وأمان."
  },
  {
    icon: Ruler,
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
    description: "لنقل أثاثك وممتلكاتك بأمان وسرعة إلى منزلك الجديد."
  },
  {
    icon: Shield,
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

const ServiceCard = ({ icon: Icon, title, description, onContactClick }: { icon: React.ElementType, title: string, description: string, onContactClick: () => void }) => (
  <Card className="text-center h-full flex flex-col group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
    <CardHeader className="items-center flex-grow">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-primary/10 border-2 border-primary/20 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-10 h-10 text-primary" />
      </div>
      <CardTitle className="text-xl font-headline group-hover:text-primary transition-colors">{title}</CardTitle>
      <CardDescription className="mt-2">{description}</CardDescription>
    </CardHeader>
    <CardContent>
       <div className="mt-4 p-3 rounded-md bg-secondary/50 text-center">
            <p className="text-sm text-muted-foreground mb-2">لإضافة خدمتكم هنا يرجى التواصل معنا</p>
            <Button onClick={onContactClick} variant="outline_primary" size="sm">
                <Phone size={16} className="ml-2 rtl:mr-2 rtl:ml-0" />
                تواصل معنا
            </Button>
        </div>
    </CardContent>
  </Card>
);


export default function ServicesPage() {
  const [isContactDialogOpen, setIsContactDialogOpen] = React.useState(false);

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-6xl mx-auto shadow-xl">
          <CardHeader className="text-center">
            <Briefcase className="mx-auto h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-4xl font-headline text-primary">
              دليل الخدمات العقارية
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground mt-2">
              كل ما تحتاجه في مكان واحد. اكتشف قائمة من المهنيين الموثوقين لمساعدتك في كل مراحل عمليتك العقارية.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-8">
            {services.map((service) => (
              <ServiceCard 
                key={service.title} 
                icon={service.icon} 
                title={service.title} 
                description={service.description} 
                onContactClick={() => setIsContactDialogOpen(true)}
              />
            ))}
          </CardContent>
        </Card>
      </div>
      {isContactDialogOpen && <ContactDialog isOpen={isContactDialogOpen} onOpenChange={setIsContactDialogOpen} />}
    </>
  );
}
