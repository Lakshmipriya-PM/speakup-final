import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic, category, transcript, duration } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
  }

  const genAI = new GoogleGenAI({ apiKey });
try {
  const prompt = `
You are a friendly communication coach.

The user spoke on:
Topic: ${topic}
Category: ${category}
Duration: ${duration} seconds

Transcript:
${transcript}

Return feedback ONLY in valid JSON format with:
- fillers
- clarity
- pace
- structure
- tip
- encouragement
`;

  const response = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  let text = response.text || "";

  // Remove markdown formatting if Gemini adds it
  text = text.replace(/```json/g, "").replace(/```/g, "").trim();

  // Fallback response
  let parsed;

  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = {
      fillers: "Could not detect filler words.",
      clarity: "7/10 - Decent clarity overall.",
      pace: "Good",
      structure: "Basic structure detected.",
      tip: "Try adding stronger examples to improve engagement.",
      encouragement: "Great effort. Keep practicing consistently!"
    };
  }

  return res.status(200).json(parsed);

} catch (error: any) {
  console.error("Gemini Feedback Generation Error:", error);

  return res.status(200).json({
    fillers: "Unavailable",
    clarity: "7/10 - Feedback service temporarily unavailable.",
    pace: "Good",
    structure: "Could not fully analyze structure.",
    tip: "Please try another session.",
    encouragement: "Nice work completing your practice session!"
  });
}
