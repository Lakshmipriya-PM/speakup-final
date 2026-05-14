import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { topic, category, transcript, duration } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Missing GEMINI_API_KEY",
      });
    }

    if (!transcript || transcript.trim().length < 10) {
      return res.status(200).json({
        fillers: "Not enough speech detected.",
        clarity: "5/10 - Too little speech to analyze.",
        pace: "Unknown",
        structure: "Could not determine structure.",
        tip: "Try speaking longer for better analysis.",
        encouragement: "Good start — keep practicing!",
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-8b",
    });

    const prompt = `
You are a communication coach.

Analyze this speech.

Topic: ${topic}
Category: ${category}
Duration: ${duration} seconds

Transcript:
${transcript}

Return ONLY valid JSON.

{
  "fillers": "...",
  "clarity": "...",
  "pace": "...",
  "structure": "...",
  "tip": "...",
  "encouragement": "..."
}
`;

    const result = await model.generateContent(prompt);

    const response = await result.response;

    let text = response.text();

    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);

      parsed = {
        fillers: "Could not analyze filler words.",
        clarity: "7/10 - Speech was understandable.",
        pace: "Good",
        structure: "Basic structure detected.",
        tip: "Try adding clearer examples.",
        encouragement: "Nice effort — keep improving!",
      };
    }

    return res.status(200).json(parsed);

  } catch (error: any) {
    console.error("Feedback API Error:", error);

    return res.status(200).json({
      fillers: "Unavailable",
      clarity: "7/10",
      pace: "Good",
      structure: "Analysis temporarily unavailable.",
      tip: "Please try another session.",
      encouragement: "Great job completing your session!",
    });
  }
}
