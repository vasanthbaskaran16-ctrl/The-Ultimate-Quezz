
import { GoogleGenAI, Type } from "@google/genai";
import { Category, Difficulty, Question } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateQuestions(
  categories: Category[],
  difficulty: Difficulty,
  count: number = 10
): Promise<Question[]> {
  const categoriesList = categories.join(', ');
  
  const prompt = `Generate exactly ${count} unique and challenging quiz questions.
  Categories: ${categoriesList}
  Difficulty: ${difficulty}
  
  Ensure a mix of:
  - 70% Multiple-choice (4 options)
  - 30% True/False
  
  Each question must have a 'hint' that is helpful but cryptic, and an 'explanation' for the correct answer.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            category: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            type: { type: Type.STRING },
            question: { type: Type.STRING },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING },
            hint: { type: Type.STRING }
          },
          required: ["id", "category", "difficulty", "type", "question", "correctAnswer", "explanation", "hint"]
        }
      }
    }
  });

  try {
    const rawText = response.text || "[]";
    const questions: Question[] = JSON.parse(rawText);
    return questions.map(q => ({
      ...q,
      category: q.category as Category,
      difficulty: q.difficulty as Difficulty
    }));
  } catch (error) {
    console.error("Error parsing questions from Gemini:", error);
    return [];
  }
}

export async function getHintExplainer(question: string, correctAnswer: string): Promise<string> {
    const prompt = `Provide a short, 1-sentence cryptic hint for this quiz question: "${question}". The correct answer is "${correctAnswer}". Don't reveal the answer directly.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
    });
    return response.text || "No hint available.";
}
