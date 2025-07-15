
import { z } from "zod";
import type { User as FirebaseUser } from 'firebase/auth';

export type UserTrustLevel = 'normal' | 'untrusted' | 'blacklisted';
export type UserRole = 'advertiser' | 'admin'; 

export interface CustomUser extends FirebaseUser {
  planId?: PlanId;
  isAdmin?: boolean;
  trustLevel?: UserTrustLevel;
  roles?: UserRole[]; 
  newsletter?: boolean;
  createdAt?: any; 
}

export type PlanId = 'free' | 'vip' | 'vip_plus_plus';

export interface Plan {
  id: PlanId;
  name: string;
  description?: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  maxListings: number;
  imageLimitPerProperty: number;
  aiAssistantAccess: boolean;
  cta: string;
}

export type TransactionType = 'sale' | 'rent';
export type PropertyTypeEnum = 'land' | 'villa' | 'house' | 'apartment' | 'office' | 'warehouse' | 'shop' | 'other';

export interface Property {
  id: string;
  userId: string;
  title: string;
  price: number;
  transactionType: TransactionType;
  propertyType: PropertyTypeEnum;
  otherPropertyType?: string;
  rooms: number;
  bathrooms: number;
  length?: number; 
  width?: number;  
  area?: number;   
  wilaya: string; 
  city: string;
  neighborhood?: string;
  address?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  filters: {
    water: boolean;
    electricity: boolean;
    internet: boolean;
    gas: boolean;
    contract: boolean;
  };
  imageUrls: string[];
  videoUrl?: string;
  description: string;
  status: 'active' | 'pending' | 'deleted' | 'archived';
  deletionReason?: string;
  archivalReason?: string; 
  createdAt: any; 
  updatedAt: any; 
  viewCount?: number;
  googleMapsLink?: string;
}

export interface SerializableProperty extends Omit<Property, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

export enum ReportReason {
  MISLEADING_INFO = "معلومات مضللة",
  SCAM_FRAUD = "احتيال أو نصب",
  INAPPROPRIATE_CONTENT = "محتوى غير لائق",
  PROPERTY_UNAVAILABLE = "العقار غير متوفر",
  SOLD_RENTED = "تم بيعه/تأجيره",
  OTHER = "سبب آخر",
}

export interface Report {
  id: string;
  propertyId: string;
  propertyTitle: string;
  reporterUserId: string;
  reporterEmail: string;
  reason: ReportReason;
  comments: string;
  reportedAt: Date;
  status: 'new' | 'under_review' | 'resolved' | 'dismissed';
  adminNotes?: string;
  updatedAt?: Date;
  dismissedByReporter?: boolean;
}

export interface UserIssue {
  id: string;
  userId: string;
  userEmail: string;
  message: string;
  submittedAt: Date;
  status: 'new' | 'in_progress' | 'resolved';
  adminNotes?: string;
  updatedAt?: Date;
  propertyId?: string; 
  propertyTitle?: string; 
  dismissedByOwner?: boolean;
}

export type AppealStatus = 'new' | 'under_review' | 'resolved_deleted' | 'resolved_kept_archived' | 'resolved_published';
export type AdminAppealDecisionType = 'delete' | 'keep_archived' | 'publish';

export interface PropertyAppeal {
  id: string;
  propertyId: string;
  propertyTitle: string;
  ownerUserId: string;
  ownerEmail: string;
  submittedAt: Date; 
  appealStatus: AppealStatus;
  adminDecision?: AdminAppealDecisionType;
  adminNotes?: string; 
  adminDecisionAt?: Date; 
  propertyArchivalReason?: string; 
  dismissedByOwner?: boolean;
  updatedAt?: Date;
}

export enum ServiceAdStatus {
  Active = 'active',
  Paused = 'paused',
  Pending = 'pending'
}

export interface ServiceAd {
  id: string;
  advertiserId: string;
  advertiserEmail: string;
  title: string;
  serviceType: string;
  wilaya: string;
  description: string;
  imageUrl: string;
  phoneNumber: string;
  whatsappNumber?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  createdAt: any;
  status: ServiceAdStatus;
  views: number;
  clicks: number;
}

export enum GeneralAdStatus {
  Active = 'active',
  Paused = 'paused',
  Pending = 'pending'
}

export interface GeneralAd {
  id: string;
  advertiserId: string;
  advertiserEmail: string;
  title: string;
  text: string;
  imageUrl: string;
  buttonText: string;
  buttonUrl: string;
  createdAt: any;
  status: GeneralAdStatus;
  views: number;
  clicks: number;
}


const algerianPhoneNumberRegex = /^0[567]\d{8}$/;

export const propertyFormSchema = z.object({
  title: z.string().min(5, "العنوان يجب أن لا يقل عن 5 أحرف.").max(150, "العنوان طويل جدًا (الحد الأقصى 150 حرفًا)."),
  transactionType: z.enum(['sale', 'rent'], { required_error: "نوع المعاملة مطلوب." }),
  propertyType: z.enum(['land', 'villa', 'house', 'apartment', 'office', 'warehouse', 'shop', 'other'], { required_error: "نوع العقار مطلوب." }),
  otherPropertyType: z.string().max(50, "نوع العقار الآخر طويل جدًا.").optional(),
  price: z.coerce.number({invalid_type_error: "السعر يجب أن يكون رقمًا."}).positive("السعر يجب أن يكون رقمًا موجبًا.").min(1, "السعر لا يمكن أن يكون صفرًا."),
  rooms: z.coerce.number().int().min(0, "عدد الغرف لا يمكن أن يكون سالبًا."),
  bathrooms: z.coerce.number().int().min(0, "عدد الحمامات لا يمكن أن يكون سالبًا."),
  length: z.coerce.number().positive("الطول يجب أن يكون رقمًا موجبًا.").min(0.1, "الطول يجب أن يكون أكبر من صفر.").max(10000, "الطول كبير جدًا."),
  width: z.coerce.number().positive("العرض يجب أن يكون رقمًا موجبًا.").min(0.1, "العرض يجب أن يكون أكبر من صفر.").max(10000, "العرض كبير جدًا."),
  area: z.coerce.number().positive("المساحة يجب أن تكون رقمًا موجبًا.").max(1000000, "المساحة كبيرة جدًا."), // Max 1 million m^2
  wilaya: z.string().min(1, "الولاية مطلوبة."),
  city: z.string().min(2, "المدينة مطلوبة.").max(100, "اسم المدينة طويل جدًا."),
  neighborhood: z.string().max(100, "اسم الحي طويل جدًا.").optional(),
  address: z.string().max(250, "العنوان التفصيلي طويل جدًا.").optional(),
  phoneNumber: z.string()
    .min(1, "رقم الهاتف مطلوب.")
    .regex(algerianPhoneNumberRegex, {
        message: "رقم الهاتف غير صالح. يجب أن يبدأ بـ 05، 06، أو 07 ويتبعه 8 أرقام.",
    }),
  whatsappNumber: z.string().regex(algerianPhoneNumberRegex, "رقم الواتساب غير صالح. يجب أن يبدأ بـ 05، 06، أو 07 ويتبعه 8 أرقام.").optional().or(z.literal('')),
  facebookUrl: z.string().url({ message: "الرجاء إدخال رابط فيسبوك صالح." }).optional().or(z.literal('')),
  instagramUrl: z.string().url({ message: "الرجاء إدخال رابط انستقرام صالح." }).optional().or(z.literal('')),
  description: z.string().min(20, "الوصف يجب أن لا يقل عن 20 حرفًا.").max(1000, "الوصف يجب أن لا يتجاوز 1000 حرفًا."),
  filters: z.object({
    water: z.boolean().default(false),
    electricity: z.boolean().default(false),
    internet: z.boolean().default(false),
    gas: z.boolean().default(false),
    contract: z.boolean().default(false),
  }),
  googleMapsLink: z.string().url({ message: "الرجاء إدخال رابط خرائط جوجل صالح." }).optional().or(z.literal('')),
  videoUrl: z.string().url({ message: "رابط الفيديو غير صالح." }).optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  if (data.propertyType === 'other' && (!data.otherPropertyType || data.otherPropertyType.trim().length < 2)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "الرجاء تحديد نوع العقار الآخر (حرفين على الأقل).",
      path: ["otherPropertyType"],
    });
  }
  if (data.propertyType !== 'other' && data.otherPropertyType) {
    data.otherPropertyType = undefined;
  }
  if (data.propertyType === 'land' && (data.rooms > 0 || data.bathrooms > 0)) {
    if(data.rooms > 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "الأرض لا تحتوي على غرف.", path: ["rooms"]});
    if(data.bathrooms > 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "الأرض لا تحتوي على حمامات.", path: ["bathrooms"]});
  }
});

export type PropertyFormValues = z.infer<typeof propertyFormSchema>;
