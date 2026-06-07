import * as admin from 'firebase-admin';

// Protect against multiple initializations in development
if (!admin.apps.length) {
  try {
    // For local development, you need these environment variables.
    // They can be obtained by generating a new private key from Firebase Console -> Project Settings -> Service Accounts.
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Replace literal \n with actual newlines in case it's stringified
          privateKey: process.env.FIREBASE_PRIVATE_KEY.trim().replace(/^["']|["']$/g, '').replace(/\\n/g, '\n'),
        }),
      });
    } else if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      // Fallback for local development token verification
      admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
      console.warn("Firebase Admin initialized with only NEXT_PUBLIC_FIREBASE_PROJECT_ID. Admin operations requiring credentials (like promoting users) will fail unless running in an emulator.");
    } else {
      // Fallback for deployed environments that use Application Default Credentials
      admin.initializeApp();
      console.warn("Firebase Admin initialized without explicit credentials. Ensure you are in a supported environment or provide FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.");
    }
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
