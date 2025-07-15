
export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  authRequired?: boolean;
  adminRequired?: boolean;
  advertiserRequired?: boolean; 
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
      title: "الأسعار",
      href: "/pricing",
    },
    {
      title: "الخدمات",
      href: "/services",
    },
    {
      title: "عقارات",
      items: [
        {
          title: "تصفح العقارات",
          href: "/properties",
        },
        {
          title: "المفضلة",
          href: "/favorites",
        },
      ],
    },
    {
      title: "الدليل",
      items: [
         {
          title: "دليل عقاري",
          href: "/tips",
        },
        {
          title: "المساعدة والأسئلة الشائعة",
          href: "/faq",
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
        },
        {
          title: "لوحة المعلنين",
          href: "/advertiser",
          authRequired: true,
          advertiserRequired: true,
        },
        {
          title: "إدارة",
          href: "/admin/reports",
          authRequired: true,
          adminRequired: true,
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
