export interface CharacterPair {
  character: string;
  meaning: string;
}

export interface Card {
  id: number;
  pairIndex: number;
  character: string;
  meaning: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface DifficultyConfig {
  cols: number;
  rows: number;
  pairs: number;
  label: string;
}

export interface GameState {
  cards: Card[];
  difficulty: Difficulty;
  moves: number;
  flippedCards: number[];
  isLocked: boolean;
  matchedPairs: number;
  totalPairs: number;
  timerRunning: boolean;
  gameWon: boolean;
}

export interface BestScore {
  moves: number;
  time: number;
}

export type BestScores = Partial<Record<Difficulty, BestScore>>;
