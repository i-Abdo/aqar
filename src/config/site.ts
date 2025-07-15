
export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  authRequired?: boolean;
  adminRequired?: boolean;
  advertiserRequired?: boolean; // New property
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
};

export type NavItemGroup = {
  title: string;
  items: NavItem[];
};


export type SiteConfig = {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  mainNav: (NavItem | NavItemGroup)[];
  footerNav: NavItem[];
};

export const siteConfig: SiteConfig = {
  name: "عقاري",
  description: "عقاري هو منصتك المثالية لإيجاد وبيع وتأجير العقارات في الجزائر.",
  url: "https://my-aqar.vercel.app", // Replace with actual URL
  ogImage: "https://res.cloudinary.com/dgz2rwp09/image/upload/f_auto,q_auto/v1751404879/aqari_properties/s732todiszp2m1nkkjif.png",
  mainNav: [
    {
      title: "الرئيسية",
      href: "/",
    },
    {
      title: "عقارات",
      items: [
        {
          title: "تصفح العقارات",
          href: "/properties",
          description: "ابحث عن منزلك المثالي بين آلاف العروض.",
        },
        {
          title: "المفضلة",
          href: "/favorites",
          description: "عرض قائمة العقارات التي قمت بحفظها.",
        },
        {
          title: "الأسعار",
          href: "/pricing",
          description: "اختر الخطة التي تناسب احتياجاتك.",
        },
      ],
    },
    {
      title: "الخدمات",
      href: "/services",
    },
    {
      title: "الدليل",
      items: [
         {
          title: "دليل عقاري",
          href: "/tips",
          description: "نصائح الخبراء لبيع وشراء العقارات.",
        },
        {
          title: "المساعدة والأسئلة الشائعة",
          href: "/faq",
          description: "احصل على إجابات لأسئلتك الأكثر شيوعًا.",
        },
      ]
    },
    {
      title: "لوحات التحكم",
      items: [
        {
          title: "لوحة التحكم",
          href: "/dashboard",
          authRequired: true,
          description: "إدارة عقاراتك وملفك الشخصي.",
        },
        {
          title: "لوحة المعلنين",
          href: "/advertiser",
          authRequired: true,
          advertiserRequired: true,
          description: "إدارة حملاتك الإعلانية.",
        },
        {
          title: "إدارة",
          href: "/admin/reports",
          authRequired: true,
          adminRequired: true,
          description: "الوصول إلى أدوات إدارة الموقع.",
        },
      ]
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
