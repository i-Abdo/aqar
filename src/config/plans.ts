
import type { Plan } from "@/types";

export const plans: Plan[] = [
  {
    id: "free",
    name: "العادي",
    description: "مثالية للبدء واستكشاف المنصة. انشر أول عقار لك مجانًا.",
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      "نشر عقار واحد فقط",
      "صور رئيسية للعقار ✓",
      "صور تفصيلية للعقار ✕",
      "إضافة فيديو للعقار ✕",
      "إضافة الموقع على الخريطة ✕",
      "مساعد الوصف بالذكاء الاصطناعي ✕",
      "دعم ذو اولوية ✕",
    ],
    maxListings: 1,
    imageLimitPerProperty: 1, 
    aiAssistantAccess: false,
    cta: "ابدأ مجانًا",
  },
  {
    id: "vip",
    name: "VIP",
    description: "الأكثر شيوعًا للمستخدمين الجادين. احصل على أدوات متقدمة للتميز.",
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      "نشر عقار واحد فقط",
      "صور رئيسية للعقار ✓",
      "صور تفصيلية للعقار ✓",
      "إضافة فيديو للعقار ✕",
      "إضافة الموقع على الخريطة ✓",
      "مساعد الوصف بالذكاء الاصطناعي ✕",
      "دعم ذو اولوية ✓",
    ],
    maxListings: 1,
    imageLimitPerProperty: 5,
    aiAssistantAccess: false,
    cta: "اختر VIP",
  },
  {
    id: "vip_plus_plus",
    name: "VIP++",
    description: "الحل الأمثل للوكالات العقارية والمحترفين. لا حدود لطموحاتك.",
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      "نشر عدد غير محدود من العقارات ✓",
      "صور رئيسية للعقار ✓",
      "صور تفصيلية للعقار ✓",
      "إضافة فيديو للعقار ✓",
      "إضافة الموقع على الخريطة ✓",
      "مساعد الوصف بالذكاء الاصطناعي ✓",
      "دعم ذو أولوية ✓",
    ],
    maxListings: Infinity,
    imageLimitPerProperty: 10,
    aiAssistantAccess: true,
    cta: "اختر VIP++",
  },
];
