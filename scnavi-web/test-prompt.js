const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8');
const apiKey = env.match(/GEMINI_API_KEY=(.*)/)[1].trim();

const ai = new GoogleGenAI({ apiKey });

async function test() {
  try {
    const prompt = `You are an expert OCR and registrar schedule parser.
Extract all class schedules from the attached Certificate of Registration (COR).
Return ONLY a valid JSON array of objects, with no markdown formatting and no surrounding backticks.
Format each object EXACTLY like this:
{
  "subject": "Course Title (e.g. Software Design)",
  "code": "Course Code (e.g. SDES401)",
  "days": "Days (e.g. Mon/Thu or Wed)",
  "time": "Time slot (e.g. 10:30 AM – 12:00 PM)",
  "room": "Room (e.g. ECB 18)",
  "instructor": "Instructor Name"
}`;

    // Testing with just the prompt (no image) to see what it defaults to
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            {
                role: 'user',
                parts: [
                    { text: prompt }
                ]
            }
        ]
    });
    
    console.log("Response text type:", typeof response.text);
    console.log("Response text value:", response.text);
    
    const responseText = response.text || "[]";
    const cleanedText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    console.log("Cleaned text:\n", cleanedText);
    
    try {
        const parsed = JSON.parse(cleanedText);
        console.log("Parsed JSON:", parsed);
    } catch (e) {
        console.log("Failed to parse JSON!");
    }

  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
