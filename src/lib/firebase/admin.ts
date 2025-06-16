
import * as admin from 'firebase-admin';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';

let authInstance: Auth | undefined = undefined;
let firestoreInstance: Firestore | undefined = undefined;

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKeyEnv = process.env.FIREBASE_PRIVATE_KEY;

console.log('[Admin SDK] Attempting to initialize Firebase Admin SDK in admin.ts...');
console.log(`[Admin SDK] FIREBASE_PROJECT_ID: ${projectId ? 'Loaded' : 'MISSING'}`);
console.log(`[Admin SDK] FIREBASE_CLIENT_EMAIL: ${clientEmail ? 'Loaded' : 'MISSING'}`);
console.log(`[Admin SDK] FIREBASE_PRIVATE_KEY: ${privateKeyEnv ? 'Loaded (exists)' : 'MISSING'}`);

if (projectId && clientEmail && privateKeyEnv) {
  const privateKey = privateKeyEnv.replace(/\\n/g, '\n');
  try {
    if (admin.apps.length === 0) {
      console.log('[Admin SDK] No existing Firebase Admin app found. Initializing a new one...');
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      });
      console.log('[Admin SDK] New Firebase Admin app initialized successfully.');
    } else {
      console.log(`[Admin SDK] Existing Firebase Admin app(s) found: ${admin.apps.length}. Will use the existing one.`);
    }
    
    // Get the (now hopefully) initialized app
    const appToUse = admin.apps[0] || admin.app(); // prefer existing or get default initialized
    
    authInstance = admin.auth(appToUse);
    firestoreInstance = admin.firestore(appToUse);
    console.log('[Admin SDK] Firebase Auth and Firestore services obtained successfully.');

  } catch (error: any) {
    console.error('[Admin SDK] CRITICAL ERROR during Firebase Admin SDK initialization or service retrieval:', error.message, error.code ? `(Code: ${error.code})` : '');
    authInstance = undefined;
    firestoreInstance = undefined;
  }
} else {
  const missingVars: string[] = [];
  if (!projectId) missingVars.push('FIREBASE_PROJECT_ID');
  if (!clientEmail) missingVars.push('FIREBASE_CLIENT_EMAIL');
  if (!privateKeyEnv) missingVars.push('FIREBASE_PRIVATE_KEY');
  console.warn(`[Admin SDK] CRITICAL: Not all Firebase Admin SDK environment variables are set. Missing: ${missingVars.join(', ')}. Firebase Admin features will be disabled.`);
  authInstance = undefined;
  firestoreInstance = undefined;
}

export const auth = authInstance;
export const db = firestoreInstance;

if (auth === undefined) {
  console.warn('[Admin SDK] Exporting UNDEFINED `auth` service from admin.ts. This indicates Firebase Admin SDK did not initialize correctly.');
} else {
  console.log('[Admin SDK] Exporting DEFINED `auth` service from admin.ts.');
}

if (db === undefined) {
  console.warn('[Admin SDK] Exporting UNDEFINED `db` (Firestore) service from admin.ts.');
} else {
  console.log('[Admin SDK] Exporting DEFINED `db` (Firestore) service from admin.ts.');
}
