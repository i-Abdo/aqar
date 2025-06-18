
import type { User as FirebaseUser } from 'firebase/auth';

export type UserTrustLevel = 'normal' | 'untrusted' | 'blacklisted';

export interface CustomUser extends FirebaseUser {
  planId?: PlanId;
  isAdmin?: boolean;
  trustLevel?: UserTrustLevel;
  createdAt?: any; // To store Firestore Timestamp
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
  length?: number; // الطول
  width?: number;  // العرض
  area?: number;   // المساحة
  wilaya: string; // Algerian state/province
  city: string;
  neighborhood?: string;
  address?: string;
  phoneNumber?: string;
  filters: {
    water: boolean;
    electricity: boolean;
    internet: boolean;
    gas: boolean;
    contract: boolean;
  };
  imageUrls: string[];
  description: string;
  status: 'active' | 'pending' | 'deleted' | 'archived';
  deletionReason?: string;
  archivalReason?: string; 
  createdAt: Date;
  updatedAt: Date;
  firebaseStudioTestField?: string;
}

export interface LocationData {
  wilayas: { code: string; name: string }[];
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
  propertyId?: string; // Added for property-specific issues
  propertyTitle?: string; // Added for property-specific issues
}

// For Property Appeal System
export type AppealStatus = 'new' | 'under_review' | 'resolved_deleted' | 'resolved_kept_archived' | 'resolved_published';
export type AdminAppealDecisionType = 'delete' | 'keep_archived' | 'publish';

export interface PropertyAppeal {
  id: string;
  propertyId: string;
  propertyTitle: string;
  ownerUserId: string;
  ownerEmail: string;
  submittedAt: Date; // Firestore Timestamp
  appealStatus: AppealStatus;
  adminDecision?: AdminAppealDecisionType;
  adminNotes?: string; // General notes from admin for their decision
  adminDecisionAt?: Date; // Firestore Timestamp
  propertyArchivalReason?: string; // Store the reason why property was archived
}

