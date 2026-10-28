/* ------------------------------------------------------------
   Explicit attack state machine.

   IDLE -> STALKING -> WINDUP -> STRIKE -> RETREAT -> COOLDOWN

   It is independent from every portfolio animation. It never
   touches scroll position or focus, never overlaps two attacks,
   waits for a first visitor interaction, respects a hard disable,
   and aborts if the visitor is reading the contact section.
   ------------------------------------------------------------ */

export type SnakeState =
  | "IDLE"
  | "STALKING"
  | "WINDUP"
  | "STRIKE"
  | "RETREAT"
  | "COOLDOWN";

export type MachineGuards = {
  /** True while the contact composition is the active section. */
  contactActive: boolean;
  /** False while the browser tab is hidden. */
  tabVisible: boolean;
  /** False when the creature has dissolved into darkness. */
  snakeVisible: boolean;
};

export type AttackFrame = {
  state: SnakeState;
  /** 0..1 progress through the current phase. */
  phase: number;
  /** True when the normal scroll path should be overridden. */
  active: boolean;
  /** True when the canvas should temporarily sit above page content. */
  foreground: boolean;
  /** 0..1 blend toward the strike pose. */
  lunge: number;
  /** 0..1 jaw opening. */
  jaw: number;
  /** 0..1 how strongly the head turns toward the camera. */
  stare: number;
  /** Subtle camera dolly toward the creature. */
  cameraPush: number;
  /** Very restrained camera displacement, never a violent shake. */
  shake: number;
};

const DURATION: Record<Exclude<SnakeState, "IDLE">, number> = {
  STALKING: 2600,
  WINDUP: 640,
  STRIKE: 380,
  RETREAT: 900,
  COOLDOWN: 2200,
};

const MIN_INTERVAL = 20000;
const MAX_INTERVAL = 45000;

const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smooth = (t: number) => t * t * (3 - 2 * t);

const EMPTY_FRAME: AttackFrame = {
  state: "IDLE",
  phase: 0,
  active: false,
  foreground: false,
  lunge: 0,
  jaw: 0,
  stare: 0,
  cameraPush: 0,
  shake: 0,
};

export class SnakeMachine {
  private state: SnakeState = "IDLE";
  private stateStarted = 0;
  private nextStalkAt = Number.POSITIVE_INFINITY;
  private interacted = false;
  private enabled = true;
  private hiddenAt = 0;
  private listeners = new Set<(state: SnakeState) => void>();

  constructor(enabled = true) {
    this.enabled = enabled;
    this.stateStarted = performance.now();
  }

  getState(): SnakeState {
    return this.state;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  subscribe(listener: (state: SnakeState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  registerInteraction(): void {
    if (this.interacted) return;
    this.interacted = true;
    if (this.enabled) this.scheduleNext(performance.now());
  }

  setEnabled(enabled: boolean): void {
    if (this.enabled === enabled) return;
    this.enabled = enabled;
    this.reset(performance.now());
    if (enabled && this.interacted) this.scheduleNext(performance.now());
  }

  handleVisibility(hidden: boolean, now = performance.now()): void {
    if (hidden) {
      this.hiddenAt = now;
      return;
    }
    if (!this.hiddenAt) return;
    const delta = now - this.hiddenAt;
    this.stateStarted += delta;
    this.nextStalkAt += delta;
    this.hiddenAt = 0;
  }

  reset(now = performance.now()): void {
    this.state = "IDLE";
    this.stateStarted = now;
    this.nextStalkAt = Number.POSITIVE_INFINITY;
    this.emit();
  }

  update(now: number, guards: MachineGuards): void {
    if (this.hiddenAt) return;

    if (!this.enabled || !this.interacted || !guards.tabVisible) {
      if (this.state !== "IDLE") this.setState("IDLE", now);
      return;
    }

    const elapsed = now - this.stateStarted;

    switch (this.state) {
      case "IDLE": {
        if (!guards.snakeVisible) {
          if (now >= this.nextStalkAt) this.scheduleNext(now);
          return;
        }
        if (now >= this.nextStalkAt) {
          this.setState("STALKING", now);
        }
        return;
      }
      case "STALKING": {
        if (guards.contactActive) {
          this.setState("IDLE", now);
          this.scheduleNext(now);
          return;
        }
        if (elapsed >= DURATION.STALKING) this.setState("WINDUP", now);
        return;
      }
      case "WINDUP": {
        if (guards.contactActive) {
          this.setState("IDLE", now);
          this.scheduleNext(now);
          return;
        }
        if (elapsed >= DURATION.WINDUP) this.setState("STRIKE", now);
        return;
      }
      case "STRIKE": {
        if (elapsed >= DURATION.STRIKE) this.setState("RETREAT", now);
        return;
      }
      case "RETREAT": {
        if (elapsed >= DURATION.RETREAT) this.setState("COOLDOWN", now);
        return;
      }
      case "COOLDOWN": {
        if (elapsed >= DURATION.COOLDOWN) {
          this.setState("IDLE", now);
          this.scheduleNext(now);
        }
        return;
      }
    }
  }

  getAttackFrame(now: number): AttackFrame {
    if (this.hiddenAt) {
      return { ...EMPTY_FRAME, state: this.state, stare: 0, cameraPush: 0, shake: 0 };
    }

    const elapsed = Math.max(0, now - this.stateStarted);
    const state = this.state;

    if (state === "IDLE" || state === "COOLDOWN") {
      return { ...EMPTY_FRAME, state };
    }

    const phase = clamp01(elapsed / DURATION[state]);

    if (state === "STALKING") {
      return {
        ...EMPTY_FRAME,
        state,
        phase,
        stare: smooth(phase),
        cameraPush: 0.04 * smooth(phase),
      };
    }

    if (state === "WINDUP") {
      return {
        ...EMPTY_FRAME,
        state,
        phase,
        active: true,
        lunge: 0,
        jaw: 0.35 * smooth(phase),
        stare: 0.75 + 0.25 * smooth(phase),
        cameraPush: 0.1 * smooth(phase),
        shake: 0.06 * phase,
      };
    }

    if (state === "STRIKE") {
      const e = easeOutCubic(phase);
      return {
        state,
        phase,
        active: true,
        foreground: true,
        lunge: e,
        jaw: Math.min(1, 0.5 + e * 0.5),
        stare: 1,
        cameraPush: 0.12 + 0.62 * e,
        shake: 0.72 * (1 - phase * 0.55),
      };
    }

    // RETREAT
    const e = easeInOut(phase);
    return {
      state,
      phase,
      active: true,
      foreground: phase < 0.3,
      lunge: 1 - e,
      jaw: (1 - e) * 0.55,
      stare: 1 - e,
      cameraPush: 0.74 * (1 - e),
      shake: 0.32 * (1 - e),
    };
  }

  private scheduleNext(now: number): void {
    const interval = MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);
    this.nextStalkAt = now + interval;
  }

  private setState(state: SnakeState, now: number): void {
    if (this.state === state) return;
    this.state = state;
    this.stateStarted = now;
    this.emit();
  }

  private emit(): void {
    for (const listener of this.listeners) listener(this.state);
  }
}
