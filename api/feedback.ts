export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { topic, category, transcript, duration } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API not configured' });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a friendly communication coach. The transcript may have speech recognition errors — judge intent not exact words.

Topic: "${topic}" | Category: "${category}" | Duration: ${duration} seconds
Transcript: "${transcript}"

Return ONLY a valid JSON object with these exact keys (no markdown, no code fences):
{
  "fillers": {"um": 2, "like": 1},
  "unnecessaryWords": ["basically", "you know"],
  "clarity": {"score": 7, "reason": "One sentence reason here"},
  "pace": "good",
  "structure": "One sentence about their structure",
  "tip": "One specific actionable tip",
  "encouragement": "One warm closing sentence"
}

pace must be exactly one of: "too fast", "good", "too slow"
Return ONLY the JSON, nothing else.`
            }]
          }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Gemini error');
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!raw) throw new Error('No response from Gemini');

    let feedback;
    try {
      const clean = raw.replace(/```json|```/g, '').trim();
      feedback = JSON.parse(clean);
    } catch {
      feedback = {
        fillers: {}, unnecessaryWords: [],
        clarity: { score: 5, reason: 'Could not parse response' },
        pace: 'good', structure: 'Analysis unavailable',
        tip: 'Try speaking again for better analysis',
        encouragement: 'Keep practicing!'
      };
    }
    res.status(200).json(feedback);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate feedback' });
  }
}
