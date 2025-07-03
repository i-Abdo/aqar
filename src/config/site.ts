export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  authRequired?: boolean;
  adminRequired?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
};

export type SiteConfig = {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  mainNav: NavItem[];
  footerNav: NavItem[];
};

export const siteConfig: SiteConfig = {
  name: "دار دز",
  description: "دار دز هي منصتك المثالية لإيجاد وبيع وتأجير العقارات في الجزائر.",
  url: "https://aqari.example.com", // Replace with actual URL
  ogImage: "https://placehold.co/1200x630.png",
  mainNav: [
    {
      title: "الرئيسية", // Home
      href: "/",
    },
    {
      title: "العقارات",
      href: "/properties",
    },
    {
      title: "الأسعار", // Pricing
      href: "/pricing",
    },
    {
      title: "لوحة التحكم", // Dashboard
      href: "/dashboard",
      authRequired: true,
    },
    {
      title: "إدارة", // Admin
      href: "/admin/properties",
      authRequired: true,
      adminRequired: true,
    },
  ],
  footerNav: [
    {
      title: "شروط الخدمة", // Terms of Service
      href: "/terms",
    },
    {
      title: "سياسة الخصوصية", // Privacy Policy
      href: "/privacy",
    },
  ],
};
