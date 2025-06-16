import type { Plan } from "@/types";

export const plans: Plan[] = [
  {
    id: "free",
    name: "مجاني", // Free
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      "نشر عقار واحد", // List 1 property
      "صورتان لكل عقار", // 2 images per property
      "دعم محدود", // Limited support
    ],
    maxListings: 1,
    imageLimitPerProperty: 2,
    aiAssistantAccess: false,
    cta: "ابدأ مجاناً", // Start for free
  },
  {
    id: "vip",
    name: "VIP",
    priceMonthly: 1000, // Example price in DZD
    priceYearly: 10000,
    features: [
      "نشر حتى 5 عقارات", // List up to 5 properties
      "5 صور لكل عقار", // 5 images per property
      "مساعد الوصف بالذكاء الاصطناعي (محدود)", // AI Description Assistant (limited)
      "دعم ذو أولوية", // Priority support
    ],
    maxListings: 5,
    imageLimitPerProperty: 5,
    aiAssistantAccess: true, // Or limited access
    cta: "اختر VIP", // Choose VIP
  },
  {
    id: "vip_plus_plus",
    name: "VIP++",
    priceMonthly: 2500, // Example price in DZD
    priceYearly: 25000,
    features: [
      "نشر عدد غير محدود من العقارات", // List unlimited properties
      "10 صور لكل عقار", // 10 images per property
      "مساعد الوصف بالذكاء الاصطناعي (كامل)", // AI Description Assistant (full)
      "ظهور مميز للعقارات", // Featured listings
      "دعم فوري", // Instant support
    ],
    maxListings: Infinity,
    imageLimitPerProperty: 10,
    aiAssistantAccess: true,
    cta: "اختر VIP++", // Choose VIP++
  },
];
