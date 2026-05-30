const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      let value = match[2].trim();
      // Strip surrounding quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[match[1].trim()] = value;
    }
  });
}

// Initialize Firebase Admin
let app;
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  let privateKey = process.env.FIREBASE_PRIVATE_KEY.trim();
  // Double safety: Strip surrounding quotes from privateKey if they bypassed parsing
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
    privateKey = privateKey.slice(1, -1);
  }
  
  app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
  });
  console.log("Initialized Firebase Admin with Service Account credentials.");
} else if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  app = admin.initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
  console.log("Initialized Firebase Admin with public Project ID fallback.");
  console.log("WARNING: Admin account creation/modification requires full Service Account credentials.");
  console.log("Please add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY to .env.local.");
} else {
  console.error("No Firebase configuration found in .env.local");
  process.exit(1);
}

const auth = admin.auth();
const db = admin.firestore();

const adminEmail = 'admin.bu.2026@bicol-u.edu.ph';
const adminPassword = 'admin12345';

async function bootstrapAdmin() {
  try {
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(adminEmail);
      console.log(`User ${adminEmail} already exists. Updating password and claims...`);
      userRecord = await auth.updateUser(userRecord.uid, {
        password: adminPassword,
      });
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log(`Creating new admin user for ${adminEmail}...`);
        userRecord = await auth.createUser({
          email: adminEmail,
          password: adminPassword,
          emailVerified: true,
          displayName: 'System Admin',
        });
      } else {
        throw error;
      }
    }

    // Set Custom Claim
    console.log(`Setting { admin: true } custom claim for UID: ${userRecord.uid}`);
    await auth.setCustomUserClaims(userRecord.uid, { admin: true });

    // Sync to Firestore
    console.log(`Syncing user to Firestore 'users' collection...`);
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: adminEmail,
      firstName: 'System',
      lastName: 'Admin',
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    console.log("✅ Admin account bootstrapped successfully!");
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    process.exit(0);

  } catch (err) {
    console.error("❌ Error bootstrapping admin account:");
    console.error(err);
    process.exit(1);
  }
}

bootstrapAdmin();
