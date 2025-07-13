
import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;
let isFirebaseAdminAppInitialized = false;

// When deployed to Firebase App Hosting, credentials are automatically discovered.
// For local development, you must set the GOOGLE_APPLICATION_CREDENTIALS
// environment variable to point to your service account key file.
// See: https://firebase.google.com/docs/admin/setup#initialize-sdk

try {
  // Check if the app is already initialized to prevent re-initialization.
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    console.log("Firebase Admin SDK initialized successfully.");
  }
  db = admin.firestore();
  auth = admin.auth();
  isFirebaseAdminAppInitialized = true;
} catch (error) {
  isFirebaseAdminAppInitialized = false;
  console.error("Firebase Admin SDK initialization failed. This can happen in a local environment if you haven't set up GOOGLE_APPLICATION_CREDENTIALS. Server-side features requiring admin access will be disabled.");
  // Assign dummy objects to prevent the app from crashing on import.
  db = {} as admin.firestore.Firestore;
  auth = {} as admin.auth.Auth;
}

export { db, auth, isFirebaseAdminAppInitialized };
