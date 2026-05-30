import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized. Bearer token missing.' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // 1. Verify the caller's identity and claims
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Only existing admins can promote others (unless this is the very first admin setup, 
    // which might require a backend script, but we assume the caller is already an admin).
    // For safety during initial testing, if no admins exist, you might want to bypass this check temporarily
    // or set the claim via a node script. We'll enforce the check here.
    if (!decodedToken.admin) {
      return NextResponse.json({ error: 'Forbidden. You do not have admin privileges to promote users.' }, { status: 403 });
    }

    const { targetEmail, newRole } = await request.json();

    if (!targetEmail || !newRole || !['admin', 'student'].includes(newRole)) {
      return NextResponse.json({ error: 'Invalid request body. Requires targetEmail and valid newRole (admin/student).' }, { status: 400 });
    }

    // 2. Get the target user by email
    const userRecord = await adminAuth.getUserByEmail(targetEmail);

    // 3. Set the custom claim
    const isAdmin = newRole === 'admin';
    await adminAuth.setCustomUserClaims(userRecord.uid, { admin: isAdmin });

    // 4. Update the user's role in the Firestore users collection to keep UI in sync
    await adminDb.collection('users').doc(userRecord.uid).set({
      role: newRole,
    }, { merge: true });

    return NextResponse.json({ message: `Successfully updated ${targetEmail} to role: ${newRole}` });

  } catch (error: any) {
    console.error('Error promoting user:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
