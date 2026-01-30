
export type BoardType = 'CBSE' | 'ICSE' | 'NCERT' | 'State Board';
export type ClassLevel = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';
export type TestScope = 'Chapter' | 'Full Book';
export type Difficulty = 'Easy' | 'Intermediate' | 'Advanced' | 'Expert';

export interface QuizConfig {
  board: BoardType;
  classLevel: ClassLevel;
  subject: string;
  chapter?: string;
  scope: TestScope;
  numQuestions: number;
  useRefresher: boolean;
  difficulty: Difficulty;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
}

export interface UserAnswer {
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
}

export interface QuizResult {
  id: string;
  timestamp: number;
  score: number;
  total: number;
  answers: UserAnswer[];
  questions: Question[];
  subject: string;
  difficulty: Difficulty;
}

export interface Flashcard {
  front: string;
  back: string;
  hint?: string;
}

export interface CardMastery {
  id: string; // Hash of front text
  level: number; // 0 to 5
  nextReview: number; // Timestamp
  lastInterval: number; // Days
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: string;
}

export interface LectureData {
  title: string;
  content: string; // Markdown
  keyPoints: string[];
  flashcards: Flashcard[];
}

// Fixed missing UserAccount interface required by Dashboard, ProfileSetup, and dataService
export interface UserAccount {
  name: string;
  email: string;
  photo: string;
  grade: ClassLevel;
  board: BoardType;
  history: QuizResult[];
  streak: number;
  points: number;
  lastActive: number;
}
