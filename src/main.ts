import './style.css';
import type { Difficulty, GameState } from './types';
import { createGameState, flipCard, flipBack, saveBestScore } from './game';
import type { FlipResult } from './game';
import { Renderer } from './renderer';
import { Timer } from './timer';

class MemoryGame {
  private state: GameState;
  private renderer: Renderer;
  private timer: Timer;

  constructor() {
    const app = document.getElementById('app')!;

    this.timer = new Timer((ms) => this.renderer.updateTimer(ms));

    this.renderer = new Renderer(app, {
      onCardClick: (cardId) => this.handleCardClick(cardId),
      onDifficultyChange: (d) => this.changeDifficulty(d),
      onNewGame: () => this.newGame(),
    });

    this.state = createGameState('easy');
    this.renderer.renderGrid(this.state);
  }

  private handleCardClick(cardId: number): void {
    const result: FlipResult | null = flipCard(this.state, cardId);
    if (!result) return;

    this.state = result.state;
    this.renderer.flipCard(cardId);
    this.renderer.updateStats(this.state.moves, this.timer.getElapsed());

    if (this.state.timerRunning) {
      this.timer.start();
    }

    if (result.isMatch && result.matchedCardIds) {
      setTimeout(() => {
        this.renderer.markMatched(result.matchedCardIds!);
      }, 300);

      if (result.gameWon) {
        this.timer.stop();
        const elapsed = this.timer.getElapsed();
        const isNewBest = saveBestScore(this.state.difficulty, this.state.moves, elapsed) !== null;
        setTimeout(() => {
          this.renderer.showWinScreen(this.state.moves, elapsed, isNewBest);
        }, 600);
      }
    } else if (result.isMatch === false && result.unmatchedCardIds) {
      setTimeout(() => {
        this.state = flipBack(this.state, result.unmatchedCardIds!);
        this.renderer.unflipCards(result.unmatchedCardIds!);
      }, 1000);
    }
  }

  private changeDifficulty(difficulty: Difficulty): void {
    if (difficulty === this.state.difficulty) return;
    this.timer.reset();
    this.state = createGameState(difficulty);
    this.renderer.renderGrid(this.state);
    this.renderer.updateStats(0, 0);
  }

  private newGame(): void {
    this.timer.reset();
    this.state = createGameState(this.state.difficulty);
    this.renderer.renderGrid(this.state);
    this.renderer.updateStats(0, 0);
  }
}

new MemoryGame();
