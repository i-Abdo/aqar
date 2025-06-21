
import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { AuthProvider } from '@/hooks/use-auth';
import { ThemeProvider } from '@/hooks/use-theme'; 
import { Almarai, Cairo } from 'next/font/google';
import { cn } from '@/lib/utils';

const fontBody = Almarai({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-body',
  display: 'swap',
});

const fontHeadline = Cairo({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-headline',
  display: 'swap',
});


export const metadata: Metadata = {
  title: 'عقاري - بوابتك العقارية الشاملة',
  description: 'عقاري - منصتك المثالية لإيجاد وبيع العقارات في الجزائر.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
      </head>
      <body className={cn(
          "font-body antialiased min-h-screen flex flex-col",
          fontBody.variable,
          fontHeadline.variable
        )}>
        <ThemeProvider> 
          <AuthProvider>
            <SiteHeader />
            <main className="flex-grow container mx-auto px-4 pb-8">
              {children}
            </main>
            <SiteFooter />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
