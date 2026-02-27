import type { Card, CharacterPair, Difficulty, DifficultyConfig, GameState, BestScore, BestScores } from './types';

const CHARACTER_PAIRS: CharacterPair[] = [
  { character: '龙', meaning: 'lóng' },
  { character: '凤', meaning: 'fèng' },
  { character: '山', meaning: 'shān' },
  { character: '水', meaning: 'shuǐ' },
  { character: '火', meaning: 'huǒ' },
  { character: '月', meaning: 'yuè' },
  { character: '风', meaning: 'fēng' },
  { character: '花', meaning: 'huā' },
  { character: '雪', meaning: 'xuě' },
  { character: '云', meaning: 'yún' },
  { character: '星', meaning: 'xīng' },
  { character: '雷', meaning: 'léi' },
];

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: { cols: 4, rows: 3, pairs: 6, label: 'Easy' },
  medium: { cols: 4, rows: 4, pairs: 8, label: 'Medium' },
  hard: { cols: 6, rows: 4, pairs: 12, label: 'Hard' },
};

const STORAGE_KEY = 'memory-game-best-scores';

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createCards(difficulty: Difficulty): Card[] {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const selected = shuffle(CHARACTER_PAIRS).slice(0, config.pairs);

  const cards: Card[] = [];
  selected.forEach((pair, pairIndex) => {
    for (let i = 0; i < 2; i++) {
      cards.push({
        id: cards.length,
        pairIndex,
        character: pair.character,
        meaning: pair.meaning,
        isFlipped: false,
        isMatched: false,
      });
    }
  });

  return shuffle(cards).map((card, index) => ({ ...card, id: index }));
}

export function createGameState(difficulty: Difficulty): GameState {
  const cards = createCards(difficulty);
  return {
    cards,
    difficulty,
    moves: 0,
    flippedCards: [],
    isLocked: false,
    matchedPairs: 0,
    totalPairs: DIFFICULTY_CONFIGS[difficulty].pairs,
    timerRunning: false,
    gameWon: false,
  };
}

export interface FlipResult {
  state: GameState;
  isMatch?: boolean;
  matchedCardIds?: number[];
  unmatchedCardIds?: number[];
  gameWon?: boolean;
}

export function flipCard(state: GameState, cardId: number): FlipResult | null {
  if (state.isLocked || state.gameWon) return null;

  const card = state.cards[cardId];
  if (!card || card.isFlipped || card.isMatched) return null;

  const newCards = state.cards.map((c) =>
    c.id === cardId ? { ...c, isFlipped: true } : c
  );

  const newFlipped = [...state.flippedCards, cardId];

  if (newFlipped.length === 1) {
    return {
      state: {
        ...state,
        cards: newCards,
        flippedCards: newFlipped,
        timerRunning: true,
      },
    };
  }

  // Two cards flipped
  const [firstId, secondId] = newFlipped;
  const firstCard = newCards[firstId];
  const secondCard = newCards[secondId];
  const isMatch = firstCard.pairIndex === secondCard.pairIndex;
  const newMoves = state.moves + 1;

  if (isMatch) {
    const matchedCards = newCards.map((c) =>
      c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
    );
    const newMatchedPairs = state.matchedPairs + 1;
    const gameWon = newMatchedPairs === state.totalPairs;

    return {
      state: {
        ...state,
        cards: matchedCards,
        flippedCards: [],
        moves: newMoves,
        matchedPairs: newMatchedPairs,
        isLocked: false,
        timerRunning: !gameWon,
        gameWon,
      },
      isMatch: true,
      matchedCardIds: [firstId, secondId],
      gameWon,
    };
  }

  // Not a match — lock board, will flip back after delay
  return {
    state: {
      ...state,
      cards: newCards,
      flippedCards: newFlipped,
      moves: newMoves,
      isLocked: true,
    },
    isMatch: false,
    unmatchedCardIds: [firstId, secondId],
  };
}

export function flipBack(state: GameState, cardIds: number[]): GameState {
  const newCards = state.cards.map((c) =>
    cardIds.includes(c.id) ? { ...c, isFlipped: false } : c
  );
  return {
    ...state,
    cards: newCards,
    flippedCards: [],
    isLocked: false,
  };
}

export function loadBestScores(): BestScores {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveBestScore(difficulty: Difficulty, moves: number, time: number): BestScore | null {
  const scores = loadBestScores();
  const existing = scores[difficulty];

  if (!existing || moves < existing.moves || (moves === existing.moves && time < existing.time)) {
    const newScore: BestScore = { moves, time };
    scores[difficulty] = newScore;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
    return newScore;
  }

  return null;
}
