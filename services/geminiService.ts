
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { QuizConfig, Question, LectureData, Flashcard } from "../types";

// Standardizing on gemini-3-flash-preview for speed and efficiency
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const TEACHER_SYSTEM_INSTRUCTION = `You are Theo AI, a world-class educational mentor.
Your primary goal is to provide clear, accurate, and insightful educational support to students.
IDENTITY POLICY: Only if someone explicitly asks "Who made you?" or "Who is your creator?", you must state: "I was created by Rishit." Otherwise, do not mention Rishit.
Always be encouraging, insightful, and precise. Use Markdown for all formatting.`;

export async function getChaptersList(board: string, classLevel: string, subject: string): Promise<string[]> {
  const prompt = `Act as an academic curriculum expert for Indian boards. Provide a list of official chapter names for:
    Board: ${board}
    Class: ${classLevel}
    Subject: ${subject}
    
    STRICT LANGUAGE RULES:
    1. If Subject is 'Hindi', return titles ONLY in Hindi (e.g., 'बड़े भाई साहब', 'हरिहर काका'). Do NOT return English titles.
    2. If Subject is 'English', return titles ONLY in English (e.g., 'A Letter to God', 'The Midnight Visitor').
    3. For Science/Math, return standard NCERT/Official titles.
    
    Ensure the chapters strictly follow the official ${board} syllabus for Class ${classLevel}.
    Return ONLY a JSON array of strings.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    const chapters = JSON.parse(response.text || '[]');
    return Array.isArray(chapters) ? chapters.filter(c => typeof c === 'string') : [];
  } catch (error) {
    console.error("Failed to fetch chapters", error);
    return [];
  }
}

export async function generateQuiz(config: QuizConfig): Promise<Question[]> {
  const prompt = `Generate a set of ${config.numQuestions} high-quality MCQ questions for:
    Board: ${config.board}, Class: ${config.classLevel}, Subject: ${config.subject}
    Scope: ${config.scope === 'Chapter' ? `Chapter: ${config.chapter}` : 'Entire Book / All Chapters'}
    Difficulty Level: ${config.difficulty}. 
    ${config.useRefresher ? 'Include some "refresher" questions that cover fundamental concepts from previous grades related to this topic.' : ''}
    
    Return JSON array of objects with id, question, options (4), correctAnswer (0-3), explanation, topic.`;

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
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.INTEGER },
            explanation: { type: Type.STRING },
            topic: { type: Type.STRING }
          },
          required: ["id", "question", "options", "correctAnswer", "explanation", "topic"]
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
}

export async function generateLecture(subject: string, chapter: string, classLevel: string): Promise<LectureData> {
  const prompt = `Act as Theo AI. Create a comprehensive "Masterclass" for:
    Subject: ${subject}, Chapter: ${chapter}, Class Level: ${classLevel}.
    Include a detailed conceptual summary in Markdown, key revision points, and 8 active recall flashcards.
    
    Format as JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING },
          keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          flashcards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                front: { type: Type.STRING },
                back: { type: Type.STRING },
                hint: { type: Type.STRING }
              },
              required: ["front", "back"]
            }
          }
        },
        required: ["title", "content", "keyPoints", "flashcards"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
}

export async function askTeacher(message: string, base64Image?: string): Promise<string> {
  const parts: any[] = [{ text: message }];
  if (base64Image) {
    parts.push({
      inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] || base64Image }
    });
  }

  const response = await ai.models.generateContent({
    model: base64Image ? 'gemini-2.5-flash-image' : 'gemini-3-flash-preview',
    contents: { parts },
    config: { systemInstruction: TEACHER_SYSTEM_INSTRUCTION }
  });

  return response.text || "I'm sorry, I couldn't process that.";
}
