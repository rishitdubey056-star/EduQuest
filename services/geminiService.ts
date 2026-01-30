
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { QuizConfig, Question, LectureData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let currentAudioSource: AudioBufferSourceNode | null = null;
let audioContext: AudioContext | null = null;

/**
 * These are highly stable, public domain Giphy IDs.
 * 3o7TKSjPqcK9Uj77W0: Genius/Dance
 * 26ufgSwMRcg9V01K8: Happy/Clap
 * vKHKDIdSW9OmI: Mind Blown
 * hEc4k5T8C96G4: Stare/Focus
 * 3o7abKhOpu0NwenH3y: Slay/Dance
 * l41lSLzuBA7LsqX8Q: Oops/Thinking
 */
const MEME_IDS = [
  "3o7TKSjPqcK9Uj77W0",
  "26ufgSwMRcg9V01K8",
  "vKHKDIdSW9OmI",
  "hEc4k5T8C96G4",
  "3o7abKhOpu0NwenH3y",
  "l41lSLzuBA7LsqX8Q"
];

const TEACHER_SYSTEM_INSTRUCTION = (funMode: boolean) => `You are Theo AI, a world-class educational mentor.
Your primary goal is to provide clear, accurate, and insightful educational support.

${funMode ? `FUN MODE: MAX AURA ENABLED 🚀
- Personality: Gen-Z chill tutor. Use slang like "no cap", "fr", "aura points", "cooking", "main character energy".
- Tone: Encouraging, hilarious, and punchy. Talk like a genius older sibling.
- CRITICAL: At the very end of your response, on a new line, you MUST write EXACTLY: GIF_CODE: [ID]
- Choose ONE ID from this list: ${MEME_IDS.join(', ')}
- Example ending: "You're actually cooking, fr. GIF_CODE: 3o7TKSjPqcK9Uj77W0"` : "Tone: Professional, academic, and encouraging."}

IDENTITY: If asked who created you, say "I was created by Rishit." otherwise don't mention it.
Formatting: Use Markdown. Keep it readable for mobile devices.`;

export async function getChaptersList(board: string, classLevel: string, subject: string): Promise<string[]> {
  const prompt = `Return a JSON array of official chapter names for: Board: ${board}, Class: ${classLevel}, Subject: ${subject}.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    return [];
  }
}

export async function generateQuiz(config: QuizConfig): Promise<Question[]> {
  const prompt = `Generate ${config.numQuestions} MCQ for: Board: ${config.board}, Class: ${config.classLevel}, Subject: ${config.subject}, Scope: ${config.chapter || 'All'}, Difficulty: ${config.difficulty}. Return JSON array.`;
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
}

export async function speakText(text: string): Promise<void> {
  if (currentAudioSource) { currentAudioSource.stop(); currentAudioSource = null; }
  try {
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
  } catch (e) {}
}

export async function askTeacher(message: string, funMode: boolean, base64Image?: string): Promise<string> {
  const parts: any[] = [{ text: message }];
  if (base64Image) parts.push({ inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] || base64Image } });
  const response = await ai.models.generateContent({
    model: base64Image ? 'gemini-2.5-flash-image' : 'gemini-3-flash-preview',
    contents: { parts },
    config: { systemInstruction: TEACHER_SYSTEM_INSTRUCTION(funMode) }
  });
  return response.text || "I'm having trouble thinking, let's try again.";
}

export function stopSpeech() {
  if (currentAudioSource) { try { currentAudioSource.stop(); } catch(e){} currentAudioSource = null; }
}

export async function generateLecture(subject: string, chapter: string, classLevel: string): Promise<LectureData> {
  const prompt = `Create a masterclass for ${subject}, Chapter: ${chapter}, Class: ${classLevel}. Include Markdown, key points, and 8 flashcards.`;
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
}
