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
    const prompt = `You are a friendly communication coach. The user was given this topic: ${topic} from category: ${category}. They spoke for ${duration} seconds. Here is their transcript: "${transcript}". Give feedback on: 1) Filler words used (list them with count), 2) Clarity (score out of 10 with one line reason), 3) Pace (too fast / good / too slow), 4) Structure (did they open, elaborate, and close properly?), 5) One specific actionable tip to improve, 6) One encouraging closing line. Keep tone friendly and constructive.`;
    
    const response = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fillers: { type: Type.STRING },
            clarity: { type: Type.STRING },
            pace: { type: Type.STRING },
            structure: { type: Type.STRING },
            tip: { type: Type.STRING },
            encouragement: { type: Type.STRING },
          },
          required: ["fillers", "clarity", "pace", "structure", "tip", "encouragement"],
        },
      },
    });
    
    const text = response.text || "{}";
    return res.status(200).json(JSON.parse(text));
  } catch (error: any) {
    console.error("Gemini Feedback Generation Error:", error);
    return res.status(500).json({ error: error.message || 'Failed to generate feedback' });
  }
}
