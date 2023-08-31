export default class Timer {
  private _enabled: boolean;
  private _tickCount: number;
  private _lastTick: number;
  private _running: boolean;
  private _delay: number;
  private _repeats: boolean;
  private _runnable: () => void;

  constructor(runnable: () => void) {
    this._enabled = true;
    this._tickCount = 0;
    this._lastTick = 0;
    this._running = false;
    this._delay = 1000;
    this._repeats = true;
    this._runnable = runnable;
  }

  private _tick(timeStamp: number): void {
    if (this.disabled || !this.isRunning) {
      return;
    }

    if (this._lastTick <= 0) {
      this._lastTick = timeStamp;
    }

    const elapsedTime = timeStamp - this._lastTick;

    if (elapsedTime >= this._delay) {
      this._lastTick += this._delay;
      this._tickCount++;
      this._runnable();
    }

    if (this._repeats || this._tickCount < 1) {
      requestAnimationFrame(this._tick.bind(this));
      return;
    }

    this.stop();
  }

  get enabled() {
    return this._enabled;
  }

  get disabled() {
    return !this._enabled;
  }

  get isRunning() {
    return this._running;
  }

  get delay() {
    return this._delay;
  }

  set delay(delayMs: number) {
    if (delayMs < 0) {
      throw new Error('delay must be non-negative');
    }

    this._delay = delayMs;
  }

  enable(): void {
    this._enabled = true;
  }

  disable(): void {
    this._enabled = false;
  }

  resetTickDelay(): void {
    this._lastTick = performance.now() || Date.now();
  }

  stop(): void {
    this._running = false;
  }

  start(initialDelayMs: number = 0, delayMs: number = this._delay, repeats: boolean = true): void {
    console.log(`Timer.start(${initialDelayMs}, ${delayMs}, ${repeats})`);


    if (initialDelayMs < 0) {
      throw new Error('initialDelay must be non-negative');
    }

    if (this.disabled || this.isRunning) {
      return;
    }

    this._delay = delayMs;
    this._repeats = repeats;
    this._tickCount = 0;
    this._lastTick = 0;
    this._running = true;
    this._tick((performance.now() || Date.now()) + initialDelayMs);
  }
}
