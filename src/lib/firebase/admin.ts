import * as admin from 'firebase-admin';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';

let authInstance: Auth | undefined = undefined;
let firestoreInstance: Firestore | undefined = undefined;

// These are server-side environment variables.
// Ensure they are set in your deployment environment.
const privateKeyEnv = process.env.FIREBASE_PRIVATE_KEY;
const clientEmailEnv = process.env.FIREBASE_CLIENT_EMAIL;
const projectIdEnv = process.env.FIREBASE_PROJECT_ID;

if (privateKeyEnv && clientEmailEnv && projectIdEnv) {
  const privateKey = privateKeyEnv.replace(/\\n/g, '\n');
  
  if (admin.apps.length === 0) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectIdEnv,
          clientEmail: clientEmailEnv,
          privateKey: privateKey,
        }),
      });
      console.info('Firebase Admin SDK initialized successfully.');
    } catch (initError) {
      console.error('Firebase Admin SDK initialization error:', initError);
      // authInstance and firestoreInstance will remain undefined
    }
  } else {
    console.info('Firebase Admin SDK: An app was already initialized.');
  }

  // Attempt to get services only if an app is initialized (or was previously)
  // Re-check admin.apps.length as initializeApp might have failed.
  if (admin.apps.length > 0) {
    try {
      authInstance = admin.auth();
      firestoreInstance = admin.firestore();
      console.info('Firebase Admin Auth and Firestore services obtained.');
    } catch (serviceError) {
      console.error('Error getting Firebase Admin Auth/Firestore services:', serviceError);
      authInstance = undefined; // Ensure they are reset on error
      firestoreInstance = undefined;
    }
  } else {
     console.warn('Firebase Admin SDK: No app initialized after attempting. Services not available. Initialization might have failed due to missing/incorrect credentials or other issues.');
  }

} else {
  console.warn(
    'Firebase Admin SDK environment variables (FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_PROJECT_ID) are not fully set in the server environment. Admin features will be disabled.'
  );
}

export const auth = authInstance;
export const db = firestoreInstance;
