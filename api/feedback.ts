import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
  const prompt = `
  Analyze this speaking practice response.

  Topic: ${topic}
  Category: ${category}
  Duration: ${duration} seconds

  Transcript:
  ${transcript}

  Return:
  - clarity score out of 10
  - speaking pace
  - filler words
  - structure feedback
  - one improvement tip
  - one motivational line
  `;

  const response = await genAI.models.generateContent({
    model: "gemini-1.5-flash-8b",
    contents: prompt,
  });

  const text = response.text || "";

  return res.status(200).json({
    clarity: "7/10",
    pace: "Good",
    fillers: text,
    structure: text,
    tip: "Keep practicing consistently.",
    encouragement: "You're improving with every session."
  });

} catch (error: any) {
  console.error("Gemini Error:", error);

  return res.status(200).json({
    clarity: "Retry Needed",
    pace: "Unknown",
    fillers: "Unable to analyze",
    structure: "Feedback generation failed",
    tip: "Please try again.",
    encouragement: "Keep practicing."
  });
}
