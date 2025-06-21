
import * as admin from 'firebase-admin';

const privateKey = process.env.FIREBASE_PRIVATE_KEY;

// Check if the app is already initialized to prevent re-initialization
if (!admin.apps.length) {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // The private key from an environment variable needs to have its newlines escaped
        // properly. The .replace() call handles this.
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    console.warn("Firebase Admin SDK not initialized. Required environment variables might be missing.");
  }
}

// Export the initialized services.
// Note: These will throw an error if the SDK was not initialized, which is the
// expected behavior if the environment is not configured correctly.
const auth = admin.auth();
const db = admin.firestore();

export { auth, db };
