require('dotenv').config({path: './.env'});
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function run() {
  try {
    const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = client.getGenerativeModel({ model: 'gemini-3.6-flash', generationConfig: { responseMimeType: 'application/json', temperature: 0.7 } });
    
    const prompt = `You are an expert social media copywriter and algorithm specialist.
Rewrite the following post optimized specifically for LinkedIn.
Your goal is: Improve clarity and engagement.

ORIGINAL POST:
"Testing this out"

Provide your response strictly in the following JSON format:
{
  "goal": "professional",
  "rewrittenText": "The fully rewritten content here, preserving line breaks appropriately.",
  "improvementNotes": "A short, 1-2 sentence explanation of what you changed and why."
}`;

    const res = await model.generateContent(prompt);
    console.log("Gemini Success:", res.response.text().trim());
  } catch (e) {
    console.error("Gemini Error:", e.message);
  }
}
run();
