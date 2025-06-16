import * as admin from 'firebase-admin';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';

let authInstance: Auth | undefined;
let firestoreInstance: Firestore | undefined;

if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const projectId = process.env.FIREBASE_PROJECT_ID;

    if (!privateKey || !clientEmail || !projectId) {
        console.error('Firebase admin SDK environment variables (FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_PROJECT_ID) are not fully set. Initialization will be skipped.');
    } else {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: projectId,
            clientEmail: clientEmail,
            privateKey: privateKey,
          }),
        });
    }
  } catch (error) {
    console.error('Firebase admin initialization error during initializeApp:', error);
  }
}

// Attempt to get auth and firestore instances only if an app exists
// This handles both cases: app initialized now, or app already existed.
if (admin.apps.length > 0) {
    try {
        authInstance = admin.auth();
        firestoreInstance = admin.firestore();
    } catch (e) {
        console.error("Error getting admin auth/firestore instances after app initialization check:", e);
        // authInstance and firestoreInstance will remain undefined.
        // Code using them must handle this possibility.
    }
} else {
    console.warn("Firebase admin app was not initialized. Auth and Firestore services will not be available. Check environment variables and initialization logs.");
}

export { authInstance as auth, firestoreInstance as firestore };
export default admin;
