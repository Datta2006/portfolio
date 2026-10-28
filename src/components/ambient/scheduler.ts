import {
  AMBIENT_CONFIG,
  type AmbientEvent,
  type AmbientKind,
  type AnomalyShape,
  type ClusterParticle,
  type DustParticle,
  type Tone,
  type WandererShape,
  type Range,
} from "./config";

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const randRange = (range: Range) => rand(range[0], range[1]);

function pickWeighted<T extends string>(weights: Record<T, number>): T {
  const entries = Object.entries(weights) as [T, number][];
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = Math.random() * total;
  for (const [key, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return key;
  }
  const fallback = entries[entries.length - 1];
  return fallback ? fallback[0] : (Object.keys(weights)[0] as T);
}

function pickTone(weights: Record<Tone, number>): Tone {
  return pickWeighted(weights);
}

function createShootingStar(id: number, mobile: boolean): AmbientEvent {
  const cfg = AMBIENT_CONFIG.shootingStar;
  const scale = mobile ? AMBIENT_CONFIG.mobile.sizeMultiplier : 1;
  const rightward = Math.random() < cfg.rightwardChance;
  const baseAngle = randRange(cfg.angle);

  return {
    id,
    kind: "shooting-star",
    x: rightward ? rand(2, 56) : rand(44, 98),
    y: rand(8, 78),
    angle: rightward ? baseAngle : 180 - baseAngle,
    distance: Math.round(randRange(cfg.distance) * scale),
    length: Math.round(randRange(cfg.length) * scale),
    thickness: randRange(cfg.thickness),
    opacity: randRange(cfg.opacity),
    duration: Math.round(randRange(AMBIENT_CONFIG.duration["shooting-star"])),
    tone: Math.random() < cfg.accentChance ? "accent" : "silver",
  };
}

function createWanderer(id: number, mobile: boolean): AmbientEvent {
  const cfg = AMBIENT_CONFIG.wanderer;
  const scale = mobile ? AMBIENT_CONFIG.mobile.sizeMultiplier : 1;
  const edge = Math.random();
  const x = edge < 0.4 ? rand(2, 17) : edge < 0.8 ? rand(83, 98) : rand(28, 72);
  const drift = randRange(cfg.drift) * scale;

  return {
    id,
    kind: "wanderer",
    shape: pickWeighted<WandererShape>(cfg.shapes),
    x,
    y: rand(10, 86),
    size: randRange(cfg.size) * scale,
    driftX: x < 50 ? drift : -drift,
    driftY: rand(-0.5, 0.5) * drift,
    spin: randRange(cfg.spin),
    spinReverse: Math.random() < 0.5,
    opacity: randRange(cfg.opacity),
    duration: Math.round(randRange(AMBIENT_CONFIG.duration.wanderer)),
  };
}

function buildClusterParticles(): ClusterParticle[] {
  const cfg = AMBIENT_CONFIG.anomaly;
  const count = Math.round(rand(5, 8));
  return Array.from({ length: count }, () => ({
    px: rand(-22, 22),
    py: rand(-22, 22),
    r: rand(0.8, 2.4),
    delay: rand(0, 1.8),
    tone: pickTone(cfg.clusterTones),
  }));
}

function createAnomaly(id: number, mobile: boolean): AmbientEvent {
  const cfg = AMBIENT_CONFIG.anomaly;
  const shape = pickWeighted<AnomalyShape>(cfg.shapes);
  const scale = mobile ? AMBIENT_CONFIG.mobile.sizeMultiplier : 1;
  const edge = Math.random();

  const size =
    shape === "ring"
      ? randRange(cfg.ringSize) * scale
      : shape === "distortion"
        ? randRange(cfg.distortionSize) * scale
        : shape === "orb"
          ? randRange(cfg.orbSize) * scale
          : 2;

  return {
    id,
    kind: "anomaly",
    shape,
    x: edge < 0.36 ? rand(4, 20) : edge < 0.72 ? rand(80, 96) : rand(26, 74),
    y: rand(12, 88),
    size,
    tone: pickTone(cfg.tones),
    opacity: randRange(cfg.opacity),
    duration: Math.round(randRange(AMBIENT_CONFIG.duration.anomaly)),
    particles: shape === "cluster" ? buildClusterParticles() : [],
  };
}

export function createEvent(id: number, kind: AmbientKind, mobile: boolean): AmbientEvent {
  if (kind === "shooting-star") return createShootingStar(id, mobile);
  if (kind === "wanderer") return createWanderer(id, mobile);
  return createAnomaly(id, mobile);
}

export function pickKind(mobile: boolean, largeActive: boolean): AmbientKind {
  if (largeActive) return "shooting-star";
  return pickWeighted(mobile ? AMBIENT_CONFIG.weights.mobile : AMBIENT_CONFIG.weights.desktop);
}

export function nextDelay(mobile: boolean): number {
  const cfg = AMBIENT_CONFIG;
  let delay = randRange(cfg.delay);
  if (Math.random() < cfg.quietChance) delay *= randRange(cfg.quietMultiplier);
  if (mobile) delay *= cfg.mobile.delayMultiplier;
  return Math.round(delay);
}

export function buildDust(count: number): DustParticle[] {
  const cfg = AMBIENT_CONFIG.dust;
  return Array.from({ length: count }, () => {
    const duration = randRange(cfg.duration);
    const drift = randRange(cfg.drift);
    return {
      x: rand(2, 98),
      y: rand(4, 96),
      size: randRange(cfg.size),
      opacity: randRange(cfg.opacity),
      duration,
      delay: -rand(0, duration),
      dx: rand(-drift, drift),
      dy: rand(-drift, drift),
      accent: Math.random() < cfg.accentChance,
    };
  });
}

type TrackedEvent = {
  event: AmbientEvent;
  expiresAt: number;
};

export class AmbientScheduler {
  private active: TrackedEvent[] = [];
  private timer: number | null = null;
  private nextId = 1;
  private stopped = false;
  private readonly mobile: boolean;
  private readonly onEvents: (events: AmbientEvent[]) => void;

  constructor(mobile: boolean, onEvents: (events: AmbientEvent[]) => void) {
    this.mobile = mobile;
    this.onEvents = onEvents;
    document.addEventListener("visibilitychange", this.onVisibility);
  }

  start() {
    this.schedule();
  }

  stop() {
    this.stopped = true;
    if (this.timer !== null) window.clearTimeout(this.timer);
    this.timer = null;
    this.active = [];
    document.removeEventListener("visibilitychange", this.onVisibility);
  }

  remove = (id: number) => {
    const next = this.active.filter((tracked) => tracked.event.id !== id);
    if (next.length === this.active.length) return;
    this.active = next;
    this.emit();
  };

  private onVisibility = () => {
    if (this.stopped) return;
    if (document.hidden) {
      if (this.timer !== null) window.clearTimeout(this.timer);
      this.timer = null;
      return;
    }
    if (this.timer === null) this.schedule();
  };

  private emit() {
    if (!this.stopped) this.onEvents(this.active.map((tracked) => tracked.event));
  }

  private schedule() {
    if (this.stopped || document.hidden) return;
    this.timer = window.setTimeout(() => {
      this.timer = null;
      this.tick();
      this.schedule();
    }, nextDelay(this.mobile));
  }

  private tick() {
    const now = performance.now();
    const before = this.active.length;
    this.active = this.active.filter((tracked) => tracked.expiresAt > now);

    const max = this.mobile
      ? AMBIENT_CONFIG.maxEvents.mobile
      : AMBIENT_CONFIG.maxEvents.desktop;

    let spawned = false;
    if (this.active.length < max) {
      const largeActive =
        this.active.filter((tracked) => tracked.event.kind !== "shooting-star").length >=
        AMBIENT_CONFIG.maxLargeEvents;
      const event = createEvent(this.nextId++, pickKind(this.mobile, largeActive), this.mobile);
      this.active.push({ event, expiresAt: now + event.duration + 600 });
      spawned = true;
    }

    if (spawned || this.active.length !== before) this.emit();
  }
}
