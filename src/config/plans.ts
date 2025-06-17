
import type { Plan } from "@/types";

export const plans: Plan[] = [
  {
    id: "free",
    name: "مجاني", // Free
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      "إمكانية نشر أكثر من عقار ✕",
      "صور تفصيلية للعقار ✕",
      "مساعد الوصف بالذكاء الاصطناعي ✕",
      "دعم محدود",
    ],
    maxListings: 1,
    imageLimitPerProperty: 1, // صورة رئيسية واحدة فقط
    aiAssistantAccess: false,
    cta: "ابدأ مجاناً", // Start for free
  },
  {
    id: "vip",
    name: "VIP",
    priceMonthly: 1500, // Updated price
    priceYearly: 15000, // Assuming priceYearly is 10x monthly for consistency
    features: [
      "نشر عقار واحد", // Updated from "up to 5"
      "صور رئيسية ✓",
      "صور تفصيلية للعقار ✓", // Implies up to imageLimitPerProperty
      "مساعد الوصف بالذكاء الاصطناعي (محدود)",
      "دعم ذو أولوية",
    ],
    maxListings: 1, // Updated from 5
    imageLimitPerProperty: 5,
    aiAssistantAccess: true,
    cta: "اختر VIP", // Choose VIP
  },
  {
    id: "vip_plus_plus",
    name: "VIP++",
    priceMonthly: 2000, // Updated price
    priceYearly: 20000, // Assuming priceYearly is 10x monthly for consistency
    features: [
      "نشر عدد غير محدود من العقارات",
      "صور رئيسية ✓",
      "صور تفصيلية للعقار ✓", // Implies up to imageLimitPerProperty
      "مساعد الوصف بالذكاء الاصطناعي (كامل)",
      "ظهور مميز للعقارات",
      "دعم فوري",
    ],
    maxListings: Infinity,
    imageLimitPerProperty: 10,
    aiAssistantAccess: true,
    cta: "اختر VIP++", // Choose VIP++
  },
];
