
import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;
let isFirebaseAdminAppInitialized = false;

// When deployed to Firebase App Hosting, credentials are automatically discovered.
// For local development, you must set the GOOGLE_APPLICATION_CREDENTIALS
// environment variable to point to your service account key file.
// See: https://firebase.google.com/docs/admin/setup#initialize-sdk

try {
  if (!admin.apps.length) {
    admin.initializeApp();
    console.log("Firebase Admin SDK initialized successfully.");
  } else {
    admin.app(); // If already initialized, get the default app
    console.log("Firebase Admin SDK was already initialized.");
  }
  
  db = admin.firestore();
  auth = admin.auth();
  isFirebaseAdminAppInitialized = true;
} catch (error: any) {
  isFirebaseAdminAppInitialized = false;
  // It's better to check the error code to avoid hiding other potential issues.
  if (error.code === 'app/no-app') {
     console.error("Firebase Admin SDK initialization failed: App not found. This can happen in a local environment if you haven't set up GOOGLE_APPLICATION_CREDENTIALS. Server-side features requiring admin access will be disabled.");
  } else {
     console.error("Firebase Admin SDK initialization failed with an unexpected error:", error);
  }
 
  // Assign dummy objects to prevent the app from crashing on import.
  db = {} as admin.firestore.Firestore;
  auth = {} as admin.auth.Auth;
}

export { db, auth, isFirebaseAdminAppInitialized };
