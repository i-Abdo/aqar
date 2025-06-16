
import * as admin from 'firebase-admin';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';

let authInstance: Auth | undefined = undefined;
let firestoreInstance: Firestore | undefined = undefined;

const privateKeyEnv = process.env.FIREBASE_PRIVATE_KEY;
const clientEmailEnv = process.env.FIREBASE_CLIENT_EMAIL;
const projectIdEnv = process.env.FIREBASE_PROJECT_ID;

console.info('Attempting to initialize Firebase Admin SDK in admin.ts...');
console.info(`FIREBASE_PROJECT_ID is ${projectIdEnv ? 'set' : 'NOT SET'}`);
console.info(`FIREBASE_CLIENT_EMAIL is ${clientEmailEnv ? 'set' : 'NOT SET'}`);
console.info(`FIREBASE_PRIVATE_KEY is ${privateKeyEnv ? 'set (length: ' + privateKeyEnv.length + ')' : 'NOT SET'}`);


if (privateKeyEnv && clientEmailEnv && projectIdEnv) {
  const privateKey = privateKeyEnv.replace(/\\n/g, '\n');
  
  if (admin.apps.length === 0) {
    try {
      console.info('No existing Firebase Admin app found. Initializing a new one...');
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectIdEnv,
          clientEmail: clientEmailEnv,
          privateKey: privateKey,
        }),
      });
      console.info('Firebase Admin SDK initialized successfully via initializeApp.');
      authInstance = admin.auth();
      firestoreInstance = admin.firestore();
      console.info('Firebase Admin Auth and Firestore services obtained.');
    } catch (initError) {
      console.error('CRITICAL: Firebase Admin SDK initialization or service retrieval error:', initError);
      authInstance = undefined;
      firestoreInstance = undefined;
    }
  } else {
    console.info('Firebase Admin SDK: An app was already initialized. Attempting to get services from existing app.');
    try {
        authInstance = admin.auth(admin.apps[0]); // Get auth from the first initialized app
        firestoreInstance = admin.firestore(admin.apps[0]); // Get firestore from the first initialized app
        console.info('Firebase Admin Auth and Firestore services obtained from existing app.');
    } catch (serviceError) {
        console.error('CRITICAL: Error getting Firebase Admin Auth/Firestore services from existing app:', serviceError);
        authInstance = undefined;
        firestoreInstance = undefined;
    }
  }
} else {
  console.warn(
    'CRITICAL: Firebase Admin SDK environment variables (FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_PROJECT_ID) are not fully set in the server environment. Firebase Admin features will be disabled. Auth service will be undefined.'
  );
  authInstance = undefined;
  firestoreInstance = undefined;
}

export const auth = authInstance;
export const db = firestoreInstance;

if (typeof auth === 'undefined') {
  console.warn('Firebase Admin `auth` service is UNDEFINED and will be exported as such from admin.ts. This means Admin SDK did not initialize correctly. Middleware authentication will likely fail or be bypassed if not handled.');
} else {
  console.info('Firebase Admin `auth` service is DEFINED and will be exported from admin.ts.');
}
if (typeof db === 'undefined') {
  console.warn('Firebase Admin `db` service is UNDEFINED and will be exported as such from admin.ts.');
} else {
  console.info('Firebase Admin `db` service is DEFINED and will be exported from admin.ts.');
}
