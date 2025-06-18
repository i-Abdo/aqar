
'use server';

import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Report, ReportReason } from '@/types';
import { auth as firebaseAuth } from '@/lib/firebase/client'; // For current user

interface SubmitReportInput {
  propertyId: string;
  propertyTitle: string;
  reason: ReportReason;
  comments: string;
}

export async function submitReport(input: SubmitReportInput): Promise<{ success: boolean; message: string }> {
  const currentUser = firebaseAuth.currentUser;

  if (!currentUser) {
    return { success: false, message: "يجب تسجيل الدخول لتقديم بلاغ." };
  }

  if (!input.propertyId || !input.propertyTitle || !input.reason || !input.comments.trim()) {
    return { success: false, message: "الرجاء ملء جميع الحقول المطلوبة." };
  }
  
  if (input.comments.length > 1000) {
      return { success: false, message: "التعليقات يجب ألا تتجاوز 1000 حرف." };
  }
   if (input.comments.length < 10) {
      return { success: false, message: "التعليقات يجب أن تكون 10 أحرف على الأقل." };
  }


  try {
    const reportData: Omit<Report, 'id' | 'reportedAt' | 'updatedAt'> = {
      propertyId: input.propertyId,
      propertyTitle: input.propertyTitle,
      reporterUserId: currentUser.uid,
      reporterEmail: currentUser.email || "غير متوفر",
      reason: input.reason,
      comments: input.comments,
      status: 'new',
      // reportedAt and updatedAt will be set by serverTimestamp or now
    };

    const reportDataWithTimestamp = {
        ...reportData,
        reportedAt: serverTimestamp() as Timestamp, // Firestore will convert this
        updatedAt: serverTimestamp() as Timestamp, // Firestore will convert this
    }

    await addDoc(collection(db, 'reports'), reportDataWithTimestamp);
    return { success: true, message: "تم إرسال بلاغك بنجاح. شكراً لك." };
  } catch (error) {
    console.error("Error submitting report:", error);
    return { success: false, message: "حدث خطأ أثناء إرسال البلاغ. يرجى المحاولة مرة أخرى." };
  }
}

