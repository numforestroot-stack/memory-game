export class Timer {
  private startTime = 0;
  private elapsed = 0;
  private rafId = 0;
  private running = false;
  private onTick: (elapsed: number) => void;

  constructor(onTick: (elapsed: number) => void) {
    this.onTick = onTick;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.startTime = performance.now() - this.elapsed;
    this.tick();
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  reset(): void {
    this.stop();
    this.elapsed = 0;
    this.onTick(0);
  }

  getElapsed(): number {
    return this.elapsed;
  }

  private tick = (): void => {
    if (!this.running) return;
    this.elapsed = performance.now() - this.startTime;
    this.onTick(this.elapsed);
    this.rafId = requestAnimationFrame(this.tick);
  };

  static format(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
