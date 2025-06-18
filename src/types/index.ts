
import type { User as FirebaseUser } from 'firebase/auth';

export interface CustomUser extends FirebaseUser {
  planId?: PlanId;
  isAdmin?: boolean;
}

export type PlanId = 'free' | 'vip' | 'vip_plus_plus';

export interface Plan {
  id: PlanId;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  maxListings: number;
  imageLimitPerProperty: number;
  aiAssistantAccess: boolean;
  cta: string;
}

export interface Property {
  id: string;
  userId: string;
  title: string;
  price: number;
  rooms: number;
  bathrooms: number;
  wilaya: string; // Algerian state/province
  city: string;
  neighborhood?: string;
  address?: string;
  phoneNumber?: string; // Added phone number
  filters: {
    water: boolean;
    electricity: boolean;
    internet: boolean;
    gas: boolean; // Added gas as it's common
    contract: boolean; // Assuming this means a formal contract is available
  };
  imageUrls: string[]; // URLs from Cloudinary or placeholder
  description: string;
  status: 'active' | 'pending' | 'deleted' | 'archived'; // Pending for admin approval maybe?
  deletionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LocationData {
  wilayas: { code: string; name: string }[];
  // Cities might be dependent on Wilaya, fetched dynamically or a large static list
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
  reporterEmail: string; // For easier display for admin
  reason: ReportReason;
  comments: string;
  reportedAt: Date;
  status: 'new' | 'under_review' | 'resolved' | 'dismissed';
  adminNotes?: string;
}
