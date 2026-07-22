export interface Word {
  id: string;
  word: string;
  meaning: string;
  created_at: string;
}

export interface QuizResult {
  id: string;
  score: number;
  total: number;
  created_at: string;
}

export type QuizQuestionType = 'fill_blank' | 'sentence_correction';

export interface QuizQuestion {
  type: QuizQuestionType;
  question: string;
  answer: string;
  explanation: string;
}

export interface Evaluation {
  correct: boolean;
  feedback: string;
}
