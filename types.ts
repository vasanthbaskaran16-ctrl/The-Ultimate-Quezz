
export enum GameMode {
  CLASSIC = 'Classic',
  TIMED = 'Timed',
  SURVIVAL = 'Survival',
  PRACTICE = 'Practice'
}

export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard'
}

export enum Category {
  HISTORY = 'History',
  GEOGRAPHY = 'Geography',
  SCIENCE = 'Science',
  TECHNOLOGY = 'Technology',
  SPORTS = 'Sports',
  ENTERTAINMENT = 'Entertainment',
  LITERATURE = 'Literature',
  CURRENT_AFFAIRS = 'Current Affairs',
  LOGICAL_REASONING = 'Logical Reasoning'
}

export interface Question {
  id: string;
  category: Category;
  difficulty: Difficulty;
  type: 'multiple-choice' | 'true-false' | 'fill-in-blank';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  hint: string;
}

export interface GameState {
  currentScreen: 'HOME' | 'LOBBY' | 'LOADING' | 'GAME' | 'RESULTS';
  mode: GameMode;
  difficulty: Difficulty;
  categories: Category[];
  score: number;
  currentQuestionIndex: number;
  lives: number;
  streak: number;
  questions: Question[];
  startTime: number;
  totalTimeTaken: number;
  bestStreak: number;
  history: {
    questionId: string;
    wasCorrect: boolean;
    timeTaken: number;
  }[];
  lifelines: {
    fiftyFifty: number;
    skip: number;
    timeFreeze: number;
    hint: number;
  };
}

export const INITIAL_STATE: GameState = {
  currentScreen: 'HOME',
  mode: GameMode.CLASSIC,
  difficulty: Difficulty.EASY,
  categories: [Category.HISTORY],
  score: 0,
  currentQuestionIndex: 0,
  lives: 3,
  streak: 0,
  questions: [],
  startTime: 0,
  totalTimeTaken: 0,
  bestStreak: 0,
  history: [],
  lifelines: {
    fiftyFifty: 1,
    skip: 1,
    timeFreeze: 1,
    hint: 2
  }
};
