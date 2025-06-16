
import * as admin from 'firebase-admin';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';

// Initialize to undefined by default.
// These will be the actual exported values.
let authService: Auth | undefined = undefined;
let firestoreService: Firestore | undefined = undefined;

console.log('[Admin SDK Module Load] Top of admin.ts reached.');

try {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyEnv = process.env.FIREBASE_PRIVATE_KEY;

  console.log('[Admin SDK Pre-Init Check] Checking environment variables...');
  console.log(`[Admin SDK Pre-Init Check] FIREBASE_PROJECT_ID: ${projectId ? 'Loaded' : 'MISSING'}`);
  console.log(`[Admin SDK Pre-Init Check] FIREBASE_CLIENT_EMAIL: ${clientEmail ? 'Loaded' : 'MISSING'}`);
  console.log(`[Admin SDK Pre-Init Check] FIREBASE_PRIVATE_KEY: ${privateKeyEnv ? 'Exists (length check pending)' : 'MISSING'}`);
  if (privateKeyEnv) {
    console.log(`[Admin SDK Pre-Init Check] FIREBASE_PRIVATE_KEY length: ${privateKeyEnv.length}`);
  }


  if (projectId && clientEmail && privateKeyEnv) {
    console.log('[Admin SDK Pre-Init Check] All required environment variables seem present.');
    const privateKey = privateKeyEnv.replace(/\\n/g, '\n');
    
    if (admin.apps.length === 0) {
      console.log('[Admin SDK Core-Init] No existing Firebase Admin app. Initializing...');
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      });
      console.log('[Admin SDK Core-Init] New Firebase Admin app initialized successfully.');
    } else {
      console.log(`[Admin SDK Core-Init] Existing Firebase Admin app(s) found: ${admin.apps.length}. Using existing one(s).`);
    }
    
    // Get the (now hopefully) initialized app or the first one if multiple exist
    const appToUse = admin.apps.length > 0 ? admin.apps[0]! : admin.app(); 
    
    authService = admin.auth(appToUse);
    firestoreService = admin.firestore(appToUse);
    console.log('[Admin SDK Post-Init] Firebase Auth and Firestore services obtained successfully.');

  } else {
    const missingVars: string[] = [];
    if (!projectId) missingVars.push('FIREBASE_PROJECT_ID');
    if (!clientEmail) missingVars.push('FIREBASE_CLIENT_EMAIL');
    if (!privateKeyEnv) missingVars.push('FIREBASE_PRIVATE_KEY');
    console.warn(`[Admin SDK Pre-Init Check] CRITICAL: Not all Firebase Admin SDK environment variables are set. Missing: ${missingVars.join(', ')}. Firebase Admin features will be disabled.`);
    // authService and firestoreService remain undefined
  }
} catch (error: any) {
  console.error('[Admin SDK Global Catch] CRITICAL ERROR during Firebase Admin SDK setup:', error.message, error.code ? `(Code: ${error.code})` : '', error.stack);
  // Ensure services are undefined if any error occurs during initialization
  authService = undefined;
  firestoreService = undefined;
}

export const auth = authService;
export const db = firestoreService;

if (auth === undefined) {
  console.warn('[Admin SDK Export Check] Exporting UNDEFINED `auth` service from admin.ts. This indicates Firebase Admin SDK did not initialize correctly, env vars were missing, or an error occurred.');
} else {
  console.log('[Admin SDK Export Check] Exporting DEFINED `auth` service from admin.ts.');
}

if (db === undefined) {
  console.warn('[Admin SDK Export Check] Exporting UNDEFINED `db` (Firestore) service from admin.ts.');
} else {
  console.log('[Admin SDK Export Check] Exporting DEFINED `db` (Firestore) service from admin.ts.');
}
