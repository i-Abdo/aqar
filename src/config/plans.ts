
import type { Plan } from "@/types";

export const plans: Plan[] = [
  {
    id: "free",
    name: "مجاني",
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      "إمكانية نشر أكثر من عقار ✕",
      "صور تفصيلية للعقار ✕", // يعني صورة رئيسية واحدة فقط مسموحة
      "مساعد الوصف بالذكاء الاصطناعي ✕",
      "دعم محدود ✓",
    ],
    maxListings: 1,
    imageLimitPerProperty: 1, 
    aiAssistantAccess: false,
    cta: "ابدأ مجاناً",
  },
  {
    id: "vip",
    name: "VIP",
    priceMonthly: 1500,
    priceYearly: 15000,
    features: [
      "نشر عقار واحد ✓",
      "صور رئيسية ✓",
      "صور تفصيلية للعقار ✓",
      "مساعد الوصف بالذكاء الاصطناعي (محدود) ✓",
      "دعم ذو أولوية ✓",
    ],
    maxListings: 1,
    imageLimitPerProperty: 5,
    aiAssistantAccess: true,
    cta: "اختر VIP",
  },
  {
    id: "vip_plus_plus",
    name: "VIP++",
    priceMonthly: 2000,
    priceYearly: 20000,
    features: [
      "نشر عدد غير محدود من العقارات ✓",
      "صور رئيسية ✓",
      "صور تفصيلية للعقار ✓",
      "مساعد الوصف بالذكاء الاصطناعي (كامل) ✓",
      "ظهور مميز للعقارات ✓",
      "دعم فوري ✓",
    ],
    maxListings: Infinity,
    imageLimitPerProperty: 10,
    aiAssistantAccess: true,
    cta: "اختر VIP++",
  },
];
