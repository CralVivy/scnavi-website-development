import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { parse, isBefore, isAfter } from 'date-fns';

interface ScheduleEntry {
  uid: string;
  name: string;
  course: string;
  subject: string;
  days: string;
  time: string;
  room: string;
  instructor: string;
}

interface Conflict {
  id: string;
  room: string;
  day: string;
  entry1: ScheduleEntry;
  entry2: ScheduleEntry;
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized. Bearer token missing.' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // 1. Verify the caller's identity and claims
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    if (!decodedToken.admin) {
      return NextResponse.json({ error: 'Forbidden. You do not have admin privileges.' }, { status: 403 });
    }

    // 2. Fetch all users to map UID to name/course
    const usersSnap = await adminDb.collection("users").get();
    const userMap = new Map<string, { name: string; course: string }>();
    usersSnap.forEach((doc) => {
      const data = doc.data();
      userMap.set(doc.id, {
        name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Unknown Student',
        course: data.course || 'Unassigned',
      });
    });

    // 3. Fetch all schedules
    const schedulesSnap = await adminDb.collection("schedules").get();
    const allEntries: ScheduleEntry[] = [];

    schedulesSnap.forEach((doc) => {
      const data = doc.data();
      const userInfo = userMap.get(doc.id) || { name: 'Unknown Student', course: 'Unassigned' };
      const entries = data.entries || [];
      entries.forEach((e: any) => {
        allEntries.push({
          uid: doc.id,
          name: userInfo.name,
          course: userInfo.course,
          subject: e.subject || '',
          days: e.days || '',
          time: e.time || '',
          room: e.room || '',
          instructor: e.instructor || '',
        });
      });
    });

    // 4. Map for fast conflict detection grouped by Room
    const byRoomAndDay: Record<string, Record<string, ScheduleEntry[]>> = {};

    allEntries.forEach((entry) => {
      if (!entry.room || entry.room.toLowerCase() === 'tba') return;

      const cleanDays = entry.days.replace(/,/g, ' ').split(/\s+/).filter(Boolean);

      cleanDays.forEach(day => {
        if (!byRoomAndDay[entry.room]) byRoomAndDay[entry.room] = {};
        if (!byRoomAndDay[entry.room][day]) byRoomAndDay[entry.room][day] = [];
        byRoomAndDay[entry.room][day].push(entry);
      });
    });

    const detected: Conflict[] = [];
    const baseDate = new Date();

    // 5. Check for overlaps
    Object.keys(byRoomAndDay).forEach(room => {
      Object.keys(byRoomAndDay[room]).forEach(day => {
        const list = byRoomAndDay[room][day];
        
        for (let i = 0; i < list.length; i++) {
          for (let j = i + 1; j < list.length; j++) {
            const e1 = list[i];
            const e2 = list[j];
            
            // If it's the exact same class for different students in the same section, it's not a conflict
            if (e1.subject === e2.subject && e1.course === e2.course && e1.instructor === e2.instructor) {
              continue;
            }

            try {
              const [start1Str, end1Str] = e1.time.split("-").map(t => t.trim());
              const [start2Str, end2Str] = e2.time.split("-").map(t => t.trim());
              
              const start1 = parse(start1Str.toUpperCase(), 'hh:mm a', baseDate);
              const end1 = parse(end1Str.toUpperCase(), 'hh:mm a', baseDate);
              const start2 = parse(start2Str.toUpperCase(), 'hh:mm a', baseDate);
              const end2 = parse(end2Str.toUpperCase(), 'hh:mm a', baseDate);

              // Overlap condition: start1 < end2 && end1 > start2
              if (isBefore(start1, end2) && isAfter(end1, start2)) {
                detected.push({
                  id: `${room}-${day}-${i}-${j}`,
                  room,
                  day,
                  entry1: e1,
                  entry2: e2,
                });
              }
            } catch (e) {
              // Ignore parse errors silently
            }
          }
        }
      });
    });

    // Deduplicate conflicts
    const uniqueConflicts = detected.filter((v, i, a) => 
      a.findIndex(t => 
        t.room === v.room && t.day === v.day && 
        ((t.entry1.subject === v.entry1.subject && t.entry2.subject === v.entry2.subject) || 
         (t.entry1.subject === v.entry2.subject && t.entry2.subject === v.entry1.subject))
      ) === i
    );

    return NextResponse.json({ conflicts: uniqueConflicts });

  } catch (error: any) {
    console.error('Error running conflict detection api:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
