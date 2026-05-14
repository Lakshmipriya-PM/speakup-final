export interface Feedback {
  fillers: string;
  clarity: string;
  pace: string;
  structure: string;
  tip: string;
  encouragement: string;
}

export async function generateTopic(category: string): Promise<string> {
  try {
    const response = await fetch("/api/topic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to generate topic: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.topic || "Talk about a skill you'd like to master and why.";
  } catch (error) {
    console.error("Topic Generation Error:", error);
    throw error;
  }
}

export async function generateFeedback(
  topic: string,
  category: string,
  transcript: string,
  duration: number
): Promise<Feedback> {
  try {
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic,
        category,
        transcript,
        duration,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate feedback: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Feedback Generation Error:", error);
    throw error;
  }
}
