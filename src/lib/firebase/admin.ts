
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
  
  // Assign advertiser role on startup
  const assignInitialRoles = async () => {
    const emailToUpdate = "abdokh.me@gmail.com";
    try {
        const userRecord = await auth.getUserByEmail(emailToUpdate);
        const userDocRef = db.collection('users').doc(userRecord.uid);
        const userDoc = await userDocRef.get();

        if (userDoc.exists) {
            const userData = userDoc.data();
            const currentRoles = userData?.roles || [];
            if (!currentRoles.includes('advertiser')) {
                await userDocRef.update({
                    roles: admin.firestore.FieldValue.arrayUnion('advertiser')
                });
                console.log(`Assigned 'advertiser' role to ${emailToUpdate}`);
            }
        }
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            console.warn(`User with email ${emailToUpdate} not found. Cannot assign role.`);
        } else {
            console.error(`Error assigning initial role to ${emailToUpdate}:`, error);
        }
    }
  };
  
  // Run this only once on server startup
  if (process.env.NODE_ENV !== 'development' || !process.env.SENTECE_SERVER_STARTUP_FLAG) {
      assignInitialRoles();
      if(process.env.NODE_ENV === 'development') {
        (process.env as any).SENTECE_SERVER_STARTUP_FLAG = true;
      }
  }


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
