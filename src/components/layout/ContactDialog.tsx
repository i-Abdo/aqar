
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Mail, Instagram, Facebook } from "lucide-react";
import Link from "next/link";
import { AppLogo } from "./AppLogo";

interface ContactDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const contactLinks = [
  {
    icon: Mail,
    text: "wezonekh@gmail.com",
    href: "mailto:wezonekh@gmail.com",
    ariaLabel: "أرسل بريدًا إلكترونيًا إلى wezonekh@gmail.com",
    cta: "أرسل بريدًا"
  },
  {
    icon: Facebook,
    text: "فيسبوك",
    href: "https://www.facebook.com/Dark2115",
    ariaLabel: "تفضل بزيارة صفحتنا على فيسبوك",
    cta: "زيارة الصفحة"
  },
  {
    icon: Instagram,
    text: "انستقرام",
    href: "https://www.instagram.com/_abdo.kh/",
    ariaLabel: "تابعنا على انستقرام",
    cta: "متابعة"
  },
];


export function ContactDialog({ isOpen, onOpenChange }: ContactDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-background to-secondary text-foreground border-border shadow-2xl">
        <DialogHeader className="items-center text-center">
          <div className="mb-4">
             <AppLogo />
          </div>
          <DialogTitle className="text-3xl font-headline text-primary">تواصل معنا</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            نحن هنا لمساعدتك. اختر طريقة التواصل التي تفضلها.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 py-4">
          {contactLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <Link
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.ariaLabel}
                className="group"
              >
                <div className="flex items-center space-x-4 rtl:space-x-reverse rounded-lg border border-border/50 bg-background/50 p-4 transition-all duration-300 hover:border-primary/50 hover:bg-accent/50 hover:shadow-lg">
                   <div className="flex-shrink-0 rounded-full bg-primary/10 p-3 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                     <Icon className="h-6 w-6 text-primary" />
                   </div>
                   <div className="flex-1 text-right">
                     <p className="font-semibold text-lg text-foreground">{link.text}</p>
                     <p className="text-sm text-muted-foreground">{link.cta}</p>
                   </div>
                </div>
              </Link>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
