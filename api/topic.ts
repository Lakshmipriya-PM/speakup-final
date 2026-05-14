import { GoogleGenAI } from "@google/genai";

const CATEGORY_DEFINITIONS: Record<string, { description: string, examples: string[] }> = {
  "Career": {
    description: "Professional life, workplace dynamics, leadership, career transitions, and networking. Focus on the 'office' or 'professional' self.",
    examples: [
      "How do you handle difficult feedback from a manager?",
      "What defines a truly toxic workplace culture?",
      "Is the standard nine-to-five workday still relevant?",
      "How has remote work changed professional boundaries?",
      "What is the most valuable soft skill in your industry?",
      "How important is a degree compared to work experience today?",
      "Describe a time you had to lead a project with no authority.",
      "Is networking more about who you know or who knows you?",
      "What's the best way to maintain work-life balance in a competitive field?",
      "How does corporate social responsibility influence your view of a company?",
      "What defines a great mentor in a professional setting?",
      "Would you rather be a small fish in a big pond or a big fish in a small pond?",
      "How has the concept of a 'company for life' evolved recently?",
      "What are the pros and cons of being a generalist vs. a specialist?",
      "How should companies approach diversity and inclusion practically?",
      "What is the impact of automation on your specific career path?",
      "How do you stay motivated during a period of professional stagnation?",
      "What's the most effective way to negotiate a salary?",
      "Is 'hustle culture' a path to success or a recipe for burnout?",
      "How do you bridge the communication gap between different generations at work?",
      "What role does emotional intelligence play in modern leadership?",
      "How do you handle a team member who isn't pulling their weight?",
      "What's the biggest challenge of transitioning to a freelance career?",
      "How do you pitch a radical new idea to a conservative board?",
      "What does 'professionalism' look like in a post-pandemic world?"
    ]
  },
  "Self Improvement": {
    description: "Personal growth, habits, mental health, learning, and self-discipline. Focus on internal mindset and individual routines.",
    examples: [
      "What is one habit that has fundamentally changed your life?",
      "How do you define personal success vs. societal success?",
      "Why is it so hard for people to admit they were wrong?",
      "What role does failure play in your personal growth?",
      "How do you protect your peace in a fast-paced world?",
      "What is the difference between being productive and being busy?",
      "How do you cultivate resilience after a major personal setback?",
      "What's one thing you've learned about yourself in the last year?",
      "Is it better to focus on fixing weaknesses or doubling down on strengths?",
      "How do you deal with the 'imposter syndrome' in a new environment?",
      "What does 'mindfulness' actually mean in your daily routine?",
      "How do you stay true to your values when they are challenged?",
      "What's the most difficult part of breaking a long-standing bad habit?",
      "How do you balance self-acceptance with the desire for growth?",
      "What is the value of spending time alone intentionally?",
      "How do you prevent external validation from controlling your happiness?",
      "What have you learned from a person who is your complete opposite?",
      "How do you manage your 'inner critic' during a difficult task?",
      "What's the most important lesson you've learned from a mistake?",
      "How do you set goals that are actually achievable and meaningful?",
      "What's your strategy for maintaining physical and mental health?",
      "How has your definition of 'happiness' changed as you've aged?",
      "What's the most courageous thing you've ever done for yourself?",
      "How do you handle the fear of being judged by others?",
      "What is the best piece of advice you have ever received?"
    ]
  },
  "Life & Relationships": {
    description: "Friendships, family, romantic partners, and community. Focus on interpersonal connections and emotional bonds.",
    examples: [
      "What makes a long-term friendship stand the test of time?",
      "How do family expectations shape your life decisions?",
      "Is it possible to have a deep connection with someone online only?",
      "How do you set boundaries with people you love?",
      "What does 'home' mean to you beyond a physical building?",
      "How do you handle the end of a friendship that you thought would last forever?",
      "What is the role of forgiveness in a healthy relationship?",
      "How do you support a friend who is going through a hard time?",
      "What’s the most important quality you look for in a partner?",
      "How has your relationship with your parents changed over time?",
      "Is it better to have many acquaintances or a few very close friends?",
      "How do you navigate cultural differences in a relationship?",
      "What's the best way to resolve a deep-seated conflict with a loved one?",
      "How does the concept of 'community' differ in cities vs. small towns?",
      "What is the impact of social media on modern dating?",
      "How do you maintain your individuality within a long-term relationship?",
      "What have your past relationships taught you about yourself?",
      "How do you define 'loyalty' in a friendship?",
      "What's the most meaningful tradition you share with your family?",
      "How do you deal with feelings of loneliness in a crowded world?",
      "What is the impact of childhood experiences on adult relationships?",
      "How do you communicate your needs effectively to your partner?",
      "What makes someone a 'good' listener in your opinion?",
      "How do you balance romantic life with friends and career?",
      "What's the most important sacrifice you've made for a relationship?"
    ]
  },
  "Technology": {
    description: "Innovation, gadgets, software, AI, and the impact of tech on humanity. Focus on tools and the future.",
    examples: [
      "Is privacy a luxury we've already lost in the digital age?",
      "How would a world without social media look today?",
      "Will AI ever be able to replicate genuine human empathy?",
      "Which technology from science fiction do you wish was real?",
      "How do you balance efficiency with human touch in tech?",
      "What is the most world-changing invention of your lifetime?",
      "Is the 'metaverse' a revolution or just a marketing hype?",
      "How do you manage your digital wellbeing in an always-connected world?",
      "Should there be a universal ethical code for AI development?",
      "Is technology making us more connected or more isolated?",
      "How has the internet changed the way we consume information?",
      "What is the future of human-computer interaction?",
      "Should internet access be considered a basic human right?",
      "How does big data influence our personal choices without us knowing?",
      "Will robots eventually take over all manual labor positions?",
      "How do we prepare the next generation for jobs that don't exist yet?",
      "What is the biggest environmental impact of our digital lifestyle?",
      "Can technology ever truly solve the problem of global inequality?",
      "How do you protect your personal data from cyber threats?",
      "Is space travel the next necessary step for technological progress?",
      "How has technology changed the way we experience music and art?",
      "Should AI-generated content be clearly labeled as such?",
      "What's the most underrated piece of technology you use daily?",
      "How does technology affect our attention spans and memory?",
      "Is the 'digital divide' between generations growing or shrinking?"
    ]
  },
  "Creativity": {
    description: "Art, expression, inspiration, hobbies, and the creative process. Focus on making things and thinking outside the box.",
    examples: [
      "Does art require a suffering artist to be meaningful?",
      "How do you overcome a total creative block?",
      "Can creativity be taught, or is it an innate talent?",
      "How does your environment influence your creative output?",
      "What is the line between inspiration and imitation in art?",
      "What role does boredom play in the creative process?",
      "Is digital art 'lesser' than traditional physical art types?",
      "How do you find your unique creative voice in a crowded world?",
      "What is the most creative solution you've ever come up with for a problem?",
      "How do you handle criticism of your creative work?",
      "Does a creative project ever truly feel 'finished' to the creator?",
      "How does collaboration change the outcome of a creative project?",
      "What's the relationship between discipline and spontaneous inspiration?",
      "How do you balance commercial success with artistic integrity?",
      "What is the value of 'useless' art in a productivity-driven society?",
      "How has the internet changed the way artists share their work?",
      "What's your favorite creative outlet and why do you love it?",
      "How do you fuel your imagination when you feel drained?",
      "Is vulnerability a core requirement for great creative expression?",
      "How do different cultures define and value creativity differently?",
      "What's the impact of AI tools on the definition of 'human' creativity?",
      "How do you stay motivated to finish a long-term creative project?",
      "What's your ritual or routine for getting into a creative state?",
      "Can a hobby be creative without producing a final product?",
      "What is the most inspiring place you have ever visited?"
    ]
  },
  "Debate": {
    description: "Controversial topics, ethics, philosophy, and societal laws. Focus on strong viewpoints and 'should we or shouldn't we' questions.",
    examples: [
      "Should basic universal income be a right or a privilege?",
      "Is space exploration worth the cost while Earth has major issues?",
      "Should social media platforms be legally responsible for user content?",
      "Is it ever ethical to sacrifice the few for the many?",
      "Should higher education be completely free for everyone?",
      "Should voting be mandatory for all citizens in a democracy?",
      "Is the death penalty ever justifiable in a modern society?",
      "Should animal testing be banned for all types of products?",
      "Should parents be allowed to choose the genetic traits of their children?",
      "Is a world without borders a utopian dream or a practical disaster?",
      "Should the government have the right to monitor private communications?",
      "Is it more important to protect free speech or prevent hate speech?",
      "Should artificial intelligence have legal rights as it becomes more advanced?",
      "Should workweeks be shortened to four days without a pay cut?",
      "Is climate change primarily the responsibility of individuals or corporations?",
      "Should the use of facial recognition technology by police be banned?",
      "Is it ethical to use performance-enhancing drugs in sports?",
      "Should some books be banned from public schools and libraries?",
      "Is it better to have a centralized or decentralized global economy?",
      "Should the wealthy be taxed at a significantly higher rate than the rest?",
      "Is absolute truth a thing, or is everything subjective?",
      "Should children be allowed to use social media before a certain age?",
      "Is public protest the most effective way to achieve social change?",
      "Should we prioritize human life over the preservation of the environment?",
      "Is the concept of 'retirement' outdated in the modern economy?"
    ]
  }
};

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
  const categoryData = CATEGORY_DEFINITIONS[category] || { description: "General conversation.", examples: [] };

  try {
    const prompt = `
      You are a specialized communication coach. Your task is to generate ONE highly targeted speaking prompt.
      
      STRICT REQUIREMENT: The prompt must fall EXACTLY within the category: "${category}".
      CATEGORY DEFINITION: ${categoryData.description}
      
      EXAMPLES OF GOOD TOPICS FOR THIS CATEGORY:
      ${categoryData.examples.slice(0, 5).map(ex => `- ${ex}`).join('\n')}
      
      GUARDRAILS:
      1. Avoid topics that belong to other categories (e.g. if category is Life & Relationships, do not talk about career, self-improvement, or technology).
      2. Keep it simple, conversational, and thought-provoking.
      3. Use everyday English that a college student or young professional would easily understand.
      4. Return ONLY the question/statement as a single sentence.
      5. Do not use quotes, introductory text, or concluding remarks.
      6. Semantic Validation: Before outputting, ask yourself "Does this topic strictly belong to ${category}?" If the answer is no, discard and try again.
    `;
    
    const response = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt
    });
    
    let text = response.text?.trim() || "";

    // Emergency Fallback if AI output is empty or glitchy
    if (!text && categoryData.examples.length > 0) {
      text = categoryData.examples[Math.floor(Math.random() * categoryData.examples.length)];
    }

    // Double check formatting (remove quotes if AI added them despite instructions)
    text = text.replace(/^"|"$/g, '').trim();

    return res.status(200).json({ topic: text });
  } catch (error: any) {
    console.error("Gemini Topic Generation Error:", error);
    // Fallback on error - picking from the rich dataset
    const fallback = categoryData.examples[Math.floor(Math.random() * categoryData.examples.length)];
    return res.status(200).json({ topic: fallback || "Talk about a skill you'd like to master and why." });
  }
}
