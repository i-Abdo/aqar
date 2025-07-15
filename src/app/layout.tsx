
import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { AuthProvider } from '@/hooks/use-auth';
import { FavoritesProvider } from '@/hooks/use-favorites';
import { ThemeProvider } from '@/hooks/use-theme'; 
import { Almarai, Cairo } from 'next/font/google';
import { cn } from '@/lib/utils';
import { MobileNav } from '@/components/layout/MobileNav';
import { siteConfig } from '@/config/site';
import AdPopup from '@/components/ads/AdPopup';

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
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ["عقارات", "عقاري", "بيع", "شراء", "كراء", "شقق", "منازل", "أراضي", "الجزائر", "سوق العقار"],
  icons: {
    icon: "https://res.cloudinary.com/dgz2rwp09/image/upload/f_auto,q_auto/v1751599256/c5278e5396324266aff8c48d47f2026c_debzqz.png",
    shortcut: "https://res.cloudinary.com/dgz2rwp09/image/upload/f_auto,q_auto/v1751599256/c5278e5396324266aff8c48d47f2026c_debzqz.png",
    apple: "https://res.cloudinary.com/dgz2rwp09/image/upload/f_auto,q_auto/v1751599256/c5278e5396324266aff8c48d47f2026c_debzqz.png",
  },
  openGraph: {
    title: {
      default: siteConfig.name,
      template: `%s - ${siteConfig.name}`,
    },
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.description
      },
    ],
    locale: 'ar_DZ',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    card: 'summary_large_image',
    title: {
       default: siteConfig.name,
      template: `%s - ${siteConfig.name}`,
    },
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://apis.google.com" />
        <link rel="preconnect" href="https://identitytoolkit.googleapis.com" />
        <link rel="preconnect" href="https://firebase.googleapis.com" />
        <link rel="preconnect" href="https://firebaseinstallations.googleapis.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <script
            dangerouslySetInnerHTML={{
              __html: `(function(){
                function getTheme() {
                  const theme = window.localStorage.getItem('themeSetting');
                  if (theme && ['light', 'dark'].includes(theme)) {
                    return theme;
                  }
                  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }
                document.documentElement.classList.add(getTheme());
              })()`,
            }}
        />
      </head>
      <body className={cn(
          "font-body antialiased min-h-screen flex flex-col",
          fontBody.variable,
          fontHeadline.variable
        )}>
        <ThemeProvider> 
          <AuthProvider>
            <FavoritesProvider>
              <SiteHeader />
              <MobileNav />
              <main className="flex-grow">
                {children}
              </main>
              <AdPopup />
              <SiteFooter />
              <Toaster />
            </FavoritesProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
