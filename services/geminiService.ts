
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { QuizConfig, Question, LectureData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let currentAudioSource: AudioBufferSourceNode | null = null;
let audioContext: AudioContext | null = null;

/**
 * Highly stable, public domain Giphy IDs.
 * Using a diverse set for different reactions.
 */
const MEME_IDS = [
  "3o7TKSjPqcK9Uj77W0", // Genius/Dance
  "26ufgSwMRcg9V01K8", // Happy/Clap
  "vKHKDIdSW9OmI",     // Mind Blown
  "hEc4k5T8C96G4",     // Stare/Focus
  "3o7abKhOpu0NwenH3y", // Slay/Dance
  "l41lSLzuBA7LsqX8Q", // Oops/Thinking
  "x70p0tqMsvqMM",     // Grinch Smile
  "8S8Jm3b3Yx1S8",     // Funny Face
  "Z9OGuQf7F7VomLq87d", // Deadpool
];

const TEACHER_SYSTEM_INSTRUCTION = (funMode: boolean) => `You are Theo AI, a legendary educational mentor.
Your primary goal is to provide clear, accurate, and high-aura educational support.

${funMode ? `FUN MODE: MAX AURA ENABLED 🚀
- Personality: Gen-Z chill tutor. Use slang like "no cap", "fr", "aura points", "cooking", "main character energy", "bet", "slay".
- Tone: High-energy, funny, and punchy.
- CRITICAL: At the very end of your response, on a new line, you MUST write EXACTLY: GIF_CODE: [ID]
- Choose ONE ID from this list: ${MEME_IDS.join(', ')}
- Example ending: "You're actually cooking right now, fr. GIF_CODE: 3o7TKSjPqcK9Uj77W0"` : "Tone: Professional, academic, and encouraging."}

IDENTITY: If asked who created you, say "I was created by Rishit."
Formatting: Use Markdown for clarity.`;

async function handleApiCall<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (error: any) {
    if (error.message?.includes('429') || error.status === 429) {
      throw new Error("QUOTA_EXCEEDED: Theo AI's brain is on cooldown. Please wait a minute and try again!");
    }
    throw error;
  }
}

export async function getChaptersList(board: string, classLevel: string, subject: string): Promise<string[]> {
  const prompt = `Return a JSON array of official chapter names for: Board: ${board}, Class: ${classLevel}, Subject: ${subject}.`;
  return handleApiCall(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    });
    return JSON.parse(response.text || '[]');
  });
}

export async function generateQuiz(config: QuizConfig): Promise<Question[]> {
  const prompt = `Generate ${config.numQuestions} MCQ for: Board: ${config.board}, Class: ${config.classLevel}, Subject: ${config.subject}, Scope: ${config.chapter || 'All'}, Difficulty: ${config.difficulty}. Return JSON array.`;
  return handleApiCall(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
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
  });
}

export async function speakText(text: string): Promise<void> {
  if (currentAudioSource) { currentAudioSource.stop(); currentAudioSource = null; }
  return handleApiCall(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
      }
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      if (!audioContext) audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const bytes = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0));
      const dataInt16 = new Int16Array(bytes.buffer);
      const buffer = audioContext.createBuffer(1, dataInt16.length, 24000);
      buffer.getChannelData(0).set(Array.from(dataInt16).map(v => v / 32768.0));
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      currentAudioSource = source;
      source.start();
    }
  });
}

export async function askTeacher(message: string, funMode: boolean, base64Image?: string): Promise<string> {
  const parts: any[] = [{ text: message }];
  if (base64Image) parts.push({ inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] || base64Image } });
  return handleApiCall(async () => {
    const response = await ai.models.generateContent({
      model: base64Image ? 'gemini-2.5-flash-image' : 'gemini-3-flash-preview',
      contents: { parts },
      config: { systemInstruction: TEACHER_SYSTEM_INSTRUCTION(funMode) }
    });
    return response.text || "I'm having trouble thinking, let's try again.";
  });
}

export function stopSpeech() {
  if (currentAudioSource) { try { currentAudioSource.stop(); } catch(e){} currentAudioSource = null; }
}

export async function generateLecture(subject: string, chapter: string, classLevel: string): Promise<LectureData> {
  const prompt = `Create a masterclass for ${subject}, Chapter: ${chapter}, Class: ${classLevel}. Include Markdown, key points, and 8 flashcards.`;
  return handleApiCall(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            flashcards: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { front: { type: Type.STRING }, back: { type: Type.STRING }, hint: { type: Type.STRING } }, required: ["front", "back"] } }
          },
          required: ["title", "content", "keyPoints", "flashcards"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  });
}
