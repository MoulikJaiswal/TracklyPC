
export interface MistakeCounts {
  concept?: number;
  formula?: number;
  calc?: number;
  read?: number;
  panic?: number;
  overthink?: number;
}

export interface Session {
  id: string;
  subject: string;
  topic: string;
  attempted: number;
  correct: number;
  mistakes: MistakeCounts;
  timestamp: number;
}

export interface QuestionLog {
  timestamp: number;
  duration: number; // in seconds
  result: 'correct' | keyof MistakeCounts;
  subject: string; // Added to track subject per question
}

export interface SubjectBreakdown {
  correct: number;
  incorrect: number;
  unattempted: number;
  calcErrors: number;
  otherErrors: number;
  mistakes?: MistakeCounts;
}

export interface TestResult {
  id: string;
  name: string;
  date: string;
  marks: number;
  total: number;
  temperament: 'Calm' | 'Anxious' | 'Focused' | 'Fatigued';
  analysis?: string; // Legacy field
  breakdown?: {
    Physics: SubjectBreakdown;
    Chemistry: SubjectBreakdown;
    Maths: SubjectBreakdown;
  };
  timestamp: number;
  attachment?: string; // Base64 string of the file
  attachmentType?: 'image' | 'pdf';
  fileName?: string;
}

export interface Target {
  id: string;
  date: string;
  text: string;
  completed: boolean;
  timestamp: number;
  type?: 'task' | 'test';
}

export type ViewType = 'daily' | 'planner' | 'focus' | 'tests' | 'analytics' | 'log';

export type ThemeId = 'midnight' | 'obsidian' | 'void' | 'forest' | 'morning' | 'earth' | 'default-dark' | 'default-light';
