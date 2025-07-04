
import type { User as FirebaseUser } from 'firebase/auth';

export type UserTrustLevel = 'normal' | 'untrusted' | 'blacklisted';

export interface CustomUser extends FirebaseUser {
  planId?: PlanId;
  isAdmin?: boolean;
  trustLevel?: UserTrustLevel;
  newsletter?: boolean;
  createdAt?: any; // To store Firestore Timestamp
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
  description: string;
  status: 'active' | 'pending' | 'deleted' | 'archived';
  deletionReason?: string;
  archivalReason?: string; 
  createdAt: Date;
  updatedAt: Date;
  viewCount?: number;
  googleMapsLink?: string;
  firebaseStudioTestField?: string;
}

// A version of Property where Timestamps are serialized to strings
export interface SerializableProperty extends Omit<Property, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
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
  dismissedByReporter?: boolean; // Added
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
  dismissedByOwner?: boolean; // Added
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
  dismissedByOwner?: boolean; // Added
  updatedAt?: Date; // Added
}
