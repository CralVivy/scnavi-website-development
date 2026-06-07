import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import * as admin from 'firebase-admin';

// Dictionary of known abbreviations to official names (stored in lowercase for case-insensitive lookup)
const COURSE_ALIASES: Record<string, string> = {
  "bs computer engineering": "Bachelor of Science in Computer Engineering",
  "bs cpe": "Bachelor of Science in Computer Engineering",
  "bscpe": "Bachelor of Science in Computer Engineering",
  "bscpe computer engineering": "Bachelor of Science in Computer Engineering",
  "bs-cpe": "Bachelor of Science in Computer Engineering",
};

// Helper function to normalize and parse instructor names
function normalizeName(rawName: string) {
  const name = rawName.trim();
  if (name.includes(',')) {
    const parts = name.split(',');
    const lastName = parts[0].trim().toLowerCase();
    const firstNameToken = parts[1].trim().split(/\s+/)[0].replace(/\./g, '').trim().toLowerCase();
    return { lastName, firstNameToken };
  } else {
    const tokens = name.split(/\s+/);
    if (tokens.length === 1) {
      return { lastName: tokens[0].toLowerCase(), firstNameToken: "" };
    } else {
      const lastName = tokens[tokens.length - 1].toLowerCase();
      const firstNameToken = tokens[0].toLowerCase();
      return { lastName, firstNameToken };
    }
  }
}

// Check if two name strings refer to the same instructor (heuristic)
function isNameMatch(name1: string, name2: string) {
  const n1 = normalizeName(name1);
  const n2 = normalizeName(name2);
  
  if (n1.lastName !== n2.lastName) return false;
  if (n1.firstNameToken === "" || n2.firstNameToken === "") return true;
  return n1.firstNameToken.startsWith(n2.firstNameToken) || n2.firstNameToken.startsWith(n1.firstNameToken);
}

// Helper function to commit batch updates in chunks of 500 to stay within Firestore limits
async function commitBatchInChunks(
  db: admin.firestore.Firestore,
  operations: { ref: admin.firestore.DocumentReference; data: any }[]
) {
  const chunkSize = 500;
  for (let i = 0; i < operations.length; i += chunkSize) {
    const batch = db.batch();
    const chunk = operations.slice(i, i + chunkSize);
    chunk.forEach((op) => {
      batch.update(op.ref, op.data);
    });
    await batch.commit();
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    if (!decodedToken.admin) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    let usersMigrated = 0;
    let schedulesMigrated = 0;

    // 1. Normalize User Courses
    const usersSnap = await adminDb.collection("users").get();
    const userOperations: { ref: admin.firestore.DocumentReference; data: any }[] = [];
    
    usersSnap.forEach((doc) => {
      const data = doc.data();
      const currentCourse = data.course;
      
      if (currentCourse) {
        const normalized = currentCourse.trim().toLowerCase();
        if (COURSE_ALIASES[normalized]) {
          userOperations.push({
            ref: doc.ref,
            data: { course: COURSE_ALIASES[normalized] }
          });
          usersMigrated++;
        }
      }
    });

    if (userOperations.length > 0) {
      await commitBatchInChunks(adminDb, userOperations);
    }

    // 2. Normalize Schedule Instructors
    const schedulesSnap = await adminDb.collection("schedules").get();
    const scheduleOperations: { ref: admin.firestore.DocumentReference; data: any }[] = [];

    // To normalize instructors, we first need to collect all unique instructor names per subject
    const subjectInstructors: Record<string, Set<string>> = {};

    schedulesSnap.forEach((doc) => {
      const data = doc.data();
      const entries = data.entries || [];
      
      entries.forEach((e: any) => {
        if (!e.subject || !e.instructor) return;
        const subj = e.subject.trim().toUpperCase();
        if (!subjectInstructors[subj]) {
          subjectInstructors[subj] = new Set();
        }
        subjectInstructors[subj].add(e.instructor.trim());
      });
    });

    // Determine the mapping from short name to longest name per subject
    const instructorMaps: Record<string, Record<string, string>> = {};

    for (const subject in subjectInstructors) {
      const names = Array.from(subjectInstructors[subject]);
      const mapping: Record<string, string> = {};
      
      names.forEach(shortName => {
        let bestMatch = shortName;
        names.forEach(potentialLongName => {
          if (potentialLongName.length > bestMatch.length && isNameMatch(shortName, potentialLongName)) {
            bestMatch = potentialLongName;
          }
        });
        
        if (bestMatch !== shortName) {
          mapping[shortName] = bestMatch;
        }
      });
      
      if (Object.keys(mapping).length > 0) {
        instructorMaps[subject] = mapping;
      }
    }

    // Apply the mapping to schedules
    schedulesSnap.forEach((doc) => {
      const data = doc.data();
      let entries = data.entries || [];
      let updated = false;
      
      entries = entries.map((e: any) => {
        if (!e.subject || !e.instructor) return e;
        const subj = e.subject.trim().toUpperCase();
        const instr = e.instructor.trim();
        
        if (instructorMaps[subj] && instructorMaps[subj][instr]) {
          updated = true;
          return { ...e, instructor: instructorMaps[subj][instr] };
        }
        return e;
      });

      if (updated) {
        scheduleOperations.push({
          ref: doc.ref,
          data: { entries }
        });
        schedulesMigrated++;
      }
    });

    if (scheduleOperations.length > 0) {
      await commitBatchInChunks(adminDb, scheduleOperations);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Normalized ${usersMigrated} users and ${schedulesMigrated} schedules.` 
    });

  } catch (err: any) {
    console.error("Normalization Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
