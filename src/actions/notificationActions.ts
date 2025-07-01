
'use server';

import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client'; 

interface DismissNotificationResult {
  success: boolean;
  message: string;
}

export async function dismissSingleNotification(
  notificationId: string,
  notificationType: 'appeal' | 'issue' | 'report'
): Promise<DismissNotificationResult> {
  if (!notificationId || !notificationType) {
    return { success: false, message: "معلومات الإشعار غير كاملة." };
  }

  let collectionName: string;
  let fieldToUpdate: string;

  switch (notificationType) {
    case 'appeal':
      collectionName = 'property_appeals';
      fieldToUpdate = 'dismissedByOwner';
      break;
    case 'issue':
      collectionName = 'user_issues';
      fieldToUpdate = 'dismissedByOwner';
      break;
    case 'report':
      collectionName = 'reports';
      fieldToUpdate = 'dismissedByReporter';
      break;
    default:
      return { success: false, message: "نوع الإشعار غير صالح." };
  }

  try {
    const notificationRef = doc(db, collectionName, notificationId);
    await updateDoc(notificationRef, {
      [fieldToUpdate]: true,
      updatedAt: serverTimestamp(),
    });
    return { success: true, message: "تم إخفاء الإشعار بنجاح." };
  } catch (error) {
    console.error("Error dismissing single notification:", error);
    return { success: false, message: "حدث خطأ أثناء إخفاء الإشعار." };
  }
}
