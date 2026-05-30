import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import { GoogleGenAI } from '@google/genai';

// Rate limiting map: uid -> { count, date }
// In a production environment, this should be tracked in Redis or Firestore
const rateLimits = new Map<string, { count: number; date: string }>();

export async function POST(request: Request) {
  try {
    // 1. Verify Authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // 2. Enforce Rate Limiting (Max 5 parses per day)
    const today = new Date().toISOString().split('T')[0];
    const userLimit = rateLimits.get(uid) || { count: 0, date: today };
    if (userLimit.date !== today) {
      userLimit.count = 0;
      userLimit.date = today;
    }
    if (userLimit.count >= 5) {
      return NextResponse.json({ error: 'Daily parse limit reached. Please try again tomorrow.' }, { status: 429 });
    }
    
    // Increment limit (we'll save it back after successful processing)
    const newCount = userLimit.count + 1;

    // 3. Extract the file from FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    // 4. Validate File Size (Max 2MB)
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 2MB limit.' }, { status: 413 });
    }

    // 5. Validate MIME Type
    const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only PNG, JPG, and PDF are allowed.' }, { status: 415 });
    }

    // 6. Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');

    // 7. Initialize Gemini SDK
    // The SDK automatically uses process.env.GEMINI_API_KEY
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY missing from environment");
      return NextResponse.json({ error: 'Server AI configuration missing.' }, { status: 500 });
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `You are an expert OCR and registrar schedule parser.
Extract all class schedules from the attached Certificate of Registration (COR).
Return ONLY a valid JSON array of objects, with no markdown formatting and no surrounding backticks.
Format each object EXACTLY like this:
{
  "subject": "Course Title (e.g. Software Design)",
  "code": "Course Code (e.g. SDES401)",
  "days": "Days (MUST use exactly these abbreviations separated by / : Mon, Tue, Wed, Thu, Fri, Sat)",
  "time": "Time slot (e.g. 08:30 AM - 10:00 AM) - MUST be exactly HH:MM AM/PM - HH:MM AM/PM with 2-digit hours",
  "room": "Room (e.g. ECB 18)",
  "instructor": "Instructor Name"
}`;

    // 8. Call Gemini 2.5 Flash
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            {
                role: 'user',
                parts: [
                    { inlineData: { data: base64Data, mimeType: file.type } },
                    { text: prompt }
                ]
            }
        ],
        config: {
            temperature: 0.1, // Low temperature for factual extraction
        }
    });

    const responseText = response.text || "[]";
    
    // Clean up potential markdown blocks if the model ignored instructions
    let cleanedText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    // Normalization (LLM Safeguard): ensure time slots don't have stray spaces like " 09:00 AM " or "09:00AM - 10:00AM"
    // We strictly want "09:00 AM - 10:30 AM"
    // We can do a lightweight regex over the JSON string before parsing to fix common time malformations
    cleanedText = cleanedText.replace(/"time":\s*"([^"]+)"/g, (match, p1) => {
      let normalizedTime = p1.replace(/–/g, '-').split('-').map((t: string) => {
        let trimmed = t.trim();
        // Insert space before AM/PM if missing (e.g., "10:30AM" -> "10:30 AM")
        trimmed = trimmed.replace(/([0-9])([aApP][mM])/ig, '$1 $2').toUpperCase();
        return trimmed;
      }).join(' - ');
      return `"time": "${normalizedTime}"`;
    });
    
    let parsedSchedule;
    try {
      parsedSchedule = JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse Gemini output:", cleanedText);
      return NextResponse.json({ error: 'AI failed to extract a valid schedule format.' }, { status: 500 });
    }

    // Save incremented rate limit
    rateLimits.set(uid, { count: newCount, date: today });

    return NextResponse.json({ entries: parsedSchedule });

  } catch (error: any) {
    console.error('Error parsing COR:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
