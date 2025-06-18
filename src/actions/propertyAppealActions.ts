
'use server';

import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { PropertyAppeal, AppealStatus } from '@/types';

interface SubmitPropertyAppealInput {
  propertyId: string;
  propertyTitle: string;
  ownerUserId: string;
  ownerEmail: string;
  propertyArchivalReason: string;
}

export async function submitPropertyAppeal(input: SubmitPropertyAppealInput): Promise<{ success: boolean; message: string }> {
  if (!input.propertyId || !input.ownerUserId) {
    return { success: false, message: "معلومات العقار أو المالك غير كاملة." };
  }

  try {
    const appealData: Omit<PropertyAppeal, 'id' | 'submittedAt' | 'appealStatus' | 'adminDecisionAt'> = {
      propertyId: input.propertyId,
      propertyTitle: input.propertyTitle,
      ownerUserId: input.ownerUserId,
      ownerEmail: input.ownerEmail,
      propertyArchivalReason: input.propertyArchivalReason,
    };

    const appealDataWithTimestampAndStatus = {
      ...appealData,
      appealStatus: 'new' as AppealStatus,
      submittedAt: serverTimestamp() as Timestamp,
    };

    await addDoc(collection(db, 'property_appeals'), appealDataWithTimestampAndStatus);
    return { success: true, message: "تم إرسال طعنك بنجاح. سيتم مراجعته من قبل الإدارة." };
  } catch (error) {
    console.error("Error submitting property appeal:", error);
    return { success: false, message: "حدث خطأ أثناء إرسال الطعن. يرجى المحاولة مرة أخرى." };
  }
}
