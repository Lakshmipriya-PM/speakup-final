import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { category } = req.body;
  
  if (!category) {
    return res.status(400).json({ error: 'Category is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
  }

  const genAI = new GoogleGenAI({ apiKey });

  try {
    const prompt = `You are a friendly peer. Give me one conversational, simple, yet thought-provoking speaking prompt for the category: ${category}. It should sound like something a friend would ask in a casual chat. Use everyday English that a college student or young professional would easily understand. Return only the question or statement as a single sentence. No quotes, no intro.`;
    
    const response = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt
    });
    
    const text = response.text?.trim();

    return res.status(200).json({ topic: text || "Talk about the future of technology." });
  } catch (error: any) {
    console.error("Gemini Topic Generation Error:", error);
    return res.status(500).json({ error: error.message || 'Failed to generate topic' });
  }
}
