import type { GameState, Difficulty } from './types';
import { DIFFICULTY_CONFIGS } from './game';
import { Timer } from './timer';

export class Renderer {
  private app: HTMLElement;
  private gridEl!: HTMLElement;
  private movesEl!: HTMLElement;
  private timerEl!: HTMLElement;
  private winOverlay!: HTMLElement;
  private onCardClick: (cardId: number) => void;
  private onDifficultyChange: (difficulty: Difficulty) => void;
  private onNewGame: () => void;


  constructor(
    app: HTMLElement,
    callbacks: {
      onCardClick: (cardId: number) => void;
      onDifficultyChange: (difficulty: Difficulty) => void;
      onNewGame: () => void;
    }
  ) {
    this.app = app;
    this.onCardClick = callbacks.onCardClick;
    this.onDifficultyChange = callbacks.onDifficultyChange;
    this.onNewGame = callbacks.onNewGame;
    this.buildLayout();
  }

  private buildLayout(): void {
    this.app.innerHTML = `
      <div class="game-container">
        <header class="game-header">
          <h1 class="game-title">记忆<span class="title-sub">Memory</span></h1>
          <div class="game-stats">
            <div class="stat">
              <span class="stat-label">Moves</span>
              <span class="stat-value" id="moves">0</span>
            </div>
            <div class="stat">
              <span class="stat-label">Time</span>
              <span class="stat-value" id="timer">0:00</span>
            </div>
          </div>
        </header>
        <div class="card-grid" id="grid"></div>
        <footer class="game-footer">
          <div class="difficulty-buttons" id="difficulty-buttons">
            <button class="diff-btn active" data-difficulty="easy">Easy</button>
            <button class="diff-btn" data-difficulty="medium">Medium</button>
            <button class="diff-btn" data-difficulty="hard">Hard</button>
          </div>
          <button class="new-game-btn" id="new-game">New Game</button>
        </footer>
        <div class="win-overlay hidden" id="win-overlay">
          <div class="win-modal">
            <h2 class="win-title">恭喜!</h2>
            <p class="win-subtitle">Congratulations!</p>
            <div class="win-stats">
              <div class="win-stat">
                <span class="win-stat-label">Moves</span>
                <span class="win-stat-value" id="win-moves"></span>
              </div>
              <div class="win-stat">
                <span class="win-stat-label">Time</span>
                <span class="win-stat-value" id="win-time"></span>
              </div>
            </div>
            <div class="win-best hidden" id="win-best">
              <span class="win-best-text">★ New Best Score! ★</span>
            </div>
            <button class="play-again-btn" id="play-again">Play Again</button>
          </div>
        </div>
      </div>
    `;

    this.gridEl = document.getElementById('grid')!;
    this.movesEl = document.getElementById('moves')!;
    this.timerEl = document.getElementById('timer')!;
    this.winOverlay = document.getElementById('win-overlay')!;

    // Difficulty buttons
    const diffButtons = document.getElementById('difficulty-buttons')!;
    diffButtons.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.dataset.difficulty) {
        this.onDifficultyChange(target.dataset.difficulty as Difficulty);
      }
    });

    // New game button
    document.getElementById('new-game')!.addEventListener('click', () => this.onNewGame());

    // Play again button
    document.getElementById('play-again')!.addEventListener('click', () => {
      this.hideWinScreen();
      this.onNewGame();
    });
  }

  renderGrid(state: GameState): void {
    const config = DIFFICULTY_CONFIGS[state.difficulty];

    this.gridEl.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;
    this.gridEl.className = `card-grid difficulty-${state.difficulty}`;
    this.gridEl.innerHTML = '';

    state.cards.forEach((card) => {
      const cardEl = document.createElement('button');
      cardEl.className = 'card';
      cardEl.dataset.cardId = String(card.id);
      cardEl.setAttribute('aria-label', `Card ${card.id + 1}`);
      cardEl.innerHTML = `
        <div class="card-inner">
          <div class="card-front">
            <div class="pokeball"></div>
          </div>
          <div class="card-back">
            <span class="card-character">${card.character}</span>
            <span class="card-meaning">${card.meaning}</span>
          </div>
        </div>
      `;

      cardEl.addEventListener('click', () => this.onCardClick(card.id));
      this.gridEl.appendChild(cardEl);
    });

    // Update difficulty buttons
    document.querySelectorAll('.diff-btn').forEach((btn) => {
      btn.classList.toggle('active', (btn as HTMLElement).dataset.difficulty === state.difficulty);
    });
  }

  updateStats(moves: number, timeMs: number): void {
    this.movesEl.textContent = String(moves);
    this.timerEl.textContent = Timer.format(timeMs);
  }

  flipCard(cardId: number): void {
    const cardEl = this.gridEl.querySelector(`[data-card-id="${cardId}"]`);
    if (cardEl) {
      cardEl.classList.add('flipped');
    }
  }

  unflipCards(cardIds: number[]): void {
    cardIds.forEach((id) => {
      const cardEl = this.gridEl.querySelector(`[data-card-id="${id}"]`);
      if (cardEl) {
        cardEl.classList.remove('flipped');
      }
    });
  }

  markMatched(cardIds: number[]): void {
    cardIds.forEach((id) => {
      const cardEl = this.gridEl.querySelector(`[data-card-id="${id}"]`);
      if (cardEl) {
        cardEl.classList.add('matched');
      }
    });
  }

  showWinScreen(moves: number, timeMs: number, isNewBest: boolean): void {
    document.getElementById('win-moves')!.textContent = String(moves);
    document.getElementById('win-time')!.textContent = Timer.format(timeMs);

    const bestEl = document.getElementById('win-best')!;
    bestEl.classList.toggle('hidden', !isNewBest);

    this.winOverlay.classList.remove('hidden');
  }

  hideWinScreen(): void {
    this.winOverlay.classList.add('hidden');
  }

  updateTimer(ms: number): void {
    this.timerEl.textContent = Timer.format(ms);
  }
}
