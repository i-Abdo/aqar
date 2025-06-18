
'use server';

import { collection, query, where, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client'; 

interface DismissNotificationsResult {
  success: boolean;
  message: string;
  dismissedCount?: number;
}

export async function dismissAllUserDashboardNotifications(userId: string): Promise<DismissNotificationsResult> {
  if (!userId) {
    return { success: false, message: "معرف المستخدم مطلوب." };
  }

  const batch = writeBatch(db);
  let actualDismissedCount = 0;

  try {
    // Property Appeals to dismiss
    const appealsQuery = query(
      collection(db, "property_appeals"),
      where("ownerUserId", "==", userId),
      where("appealStatus", "in", ["resolved_deleted", "resolved_kept_archived", "resolved_published"]),
      where("dismissedByOwner", "!=", true) 
    );
    const appealsSnapshot = await getDocs(appealsQuery);
    appealsSnapshot.forEach(docSnap => {
      batch.update(docSnap.ref, { 
        dismissedByOwner: true, 
        updatedAt: serverTimestamp() 
      });
      actualDismissedCount++;
    });
    
    // User Issues to dismiss
    const issuesQuery = query(
      collection(db, "user_issues"),
      where("userId", "==", userId),
      where("status", "in", ["in_progress", "resolved"]),
      where("dismissedByOwner", "!=", true) 
    );
    const issuesSnapshot = await getDocs(issuesQuery);
    issuesSnapshot.forEach(docSnap => {
      batch.update(docSnap.ref, { 
        dismissedByOwner: true, 
        updatedAt: serverTimestamp() 
      });
      actualDismissedCount++;
    });

    if (actualDismissedCount > 0) {
      await batch.commit();
      return { 
          success: true, 
          message: `تم مسح ${actualDismissedCount} إشعارًا بنجاح.`,
          dismissedCount: actualDismissedCount
      };
    } else {
        return { success: true, message: "لا توجد إشعارات جديدة لمسحها.", dismissedCount: 0 };
    }

  } catch (error) {
    console.error("Error dismissing user dashboard notifications:", error);
    return { success: false, message: "حدث خطأ أثناء مسح الإشعارات." };
  }
}
