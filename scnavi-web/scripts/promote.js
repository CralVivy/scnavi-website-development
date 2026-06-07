const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const app = initializeApp({
  credential: cert(serviceAccount)
});

const auth = getAuth(app);
const db = getFirestore(app);

const targetEmail = 'lloydarielbajada.deputo24@bicol-u.edu.ph';

async function promote() {
  try {
    const userRecord = await auth.getUserByEmail(targetEmail);
    await auth.setCustomUserClaims(userRecord.uid, { admin: true });
    await db.collection('users').doc(userRecord.uid).set({ role: 'admin' }, { merge: true });
    console.log(`Successfully promoted ${targetEmail} to admin`);
  } catch(e) {
    console.error('Error promoting user:', e.message);
  }
}

promote();
