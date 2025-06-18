
'use server';

import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { UserIssue } from '@/types';

interface SubmitUserIssueInput {
  userId: string;
  userEmail: string;
  message: string;
  propertyId?: string;
  propertyTitle?: string;
}

export async function submitUserIssue(input: SubmitUserIssueInput): Promise<{ success: boolean; message: string }> {
  if (!input.userId || !input.userEmail || !input.message.trim()) {
    return { success: false, message: "الرجاء ملء جميع الحقول المطلوبة." };
  }
  
  if (input.message.length > 2000) {
      return { success: false, message: "الرسالة يجب ألا تتجاوز 2000 حرف." };
  }
   if (input.message.length < 20) {
      return { success: false, message: "الرسالة يجب أن تكون 20 حرفًا على الأقل." };
  }

  try {
    const issueData: Omit<UserIssue, 'id' | 'submittedAt' | 'updatedAt'> = {
      userId: input.userId,
      userEmail: input.userEmail,
      message: input.message,
      status: 'new',
      ...(input.propertyId && { propertyId: input.propertyId }),
      ...(input.propertyTitle && { propertyTitle: input.propertyTitle }),
    };

    const issueDataWithTimestamp = {
        ...issueData,
        submittedAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
    }

    await addDoc(collection(db, 'user_issues'), issueDataWithTimestamp);
    return { success: true, message: "تم إرسال رسالتك بنجاح. سيقوم المسؤول بمراجعتها." };
  } catch (error) {
    console.error("Error submitting user issue:", error);
    return { success: false, message: "حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى." };
  }
}
