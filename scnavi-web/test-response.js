const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            {
                role: 'user',
                parts: [
                    { text: "Return a JSON array with one object: { \"test\": \"hello\" }" }
                ]
            }
        ]
    });
    
    console.log("Response keys:", Object.keys(response));
    console.log("response.text property:", typeof response.text);
    if (typeof response.text === 'string') {
        console.log("Content:", response.text);
    } else if (typeof response.text === 'function') {
        console.log("Content (via function):", response.text());
    } else {
        console.log("Unknown format. Raw response:", JSON.stringify(response, null, 2));
    }
  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
