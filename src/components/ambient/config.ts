export type AmbientKind = "shooting-star" | "wanderer" | "anomaly";
export type WandererShape = "asteroid" | "moon" | "sphere" | "shard";
export type AnomalyShape = "orb" | "ring" | "cluster" | "distortion";
export type Tone = "accent" | "cold" | "violet" | "silver";

export type Range = [number, number];

export type ClusterParticle = {
  px: number;
  py: number;
  r: number;
  delay: number;
  tone: Tone;
};

type EventBase = { id: number; duration: number };

export type ShootingStarEvent = EventBase & {
  kind: "shooting-star";
  x: number;
  y: number;
  angle: number;
  distance: number;
  length: number;
  thickness: number;
  opacity: number;
  tone: Tone;
};

export type WandererEvent = EventBase & {
  kind: "wanderer";
  shape: WandererShape;
  x: number;
  y: number;
  size: number;
  driftX: number;
  driftY: number;
  spin: number;
  spinReverse: boolean;
  opacity: number;
};

export type AnomalyEvent = EventBase & {
  kind: "anomaly";
  shape: AnomalyShape;
  x: number;
  y: number;
  size: number;
  tone: Tone;
  opacity: number;
  particles: ClusterParticle[];
};

export type AmbientEvent = ShootingStarEvent | WandererEvent | AnomalyEvent;

export type DustParticle = {
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  dx: number;
  dy: number;
  accent: boolean;
};

export const TONE_RGB: Record<Tone, string> = {
  accent: "197, 255, 69",
  cold: "147, 164, 186",
  violet: "138, 127, 186",
  silver: "196, 203, 208",
};

export type AmbientConfig = {
  delay: Range;
  quietChance: number;
  quietMultiplier: Range;
  maxEvents: { desktop: number; mobile: number };
  maxLargeEvents: number;
  weights: {
    desktop: Record<AmbientKind, number>;
    mobile: Record<AmbientKind, number>;
  };
  duration: Record<AmbientKind, Range>;
  shootingStar: {
    length: Range;
    distance: Range;
    angle: Range;
    thickness: Range;
    opacity: Range;
    accentChance: number;
    rightwardChance: number;
  };
  wanderer: {
    size: Range;
    drift: Range;
    spin: Range;
    opacity: Range;
    shapes: Record<WandererShape, number>;
  };
  anomaly: {
    orbSize: Range;
    ringSize: Range;
    distortionSize: Range;
    opacity: Range;
    shapes: Record<AnomalyShape, number>;
    tones: Record<Tone, number>;
    clusterTones: Record<Tone, number>;
  };
  dust: {
    desktop: number;
    mobile: number;
    accentChance: number;
    size: Range;
    opacity: Range;
    duration: Range;
    drift: Range;
  };
  mobile: {
    delayMultiplier: number;
    sizeMultiplier: number;
  };
};

export const AMBIENT_CONFIG: AmbientConfig = {
  delay: [3200, 9000],
  quietChance: 0.16,
  quietMultiplier: [2.6, 4.2],
  maxEvents: { desktop: 3, mobile: 2 },
  maxLargeEvents: 1,
  weights: {
    desktop: { "shooting-star": 66, wanderer: 16, anomaly: 18 },
    mobile: { "shooting-star": 78, wanderer: 8, anomaly: 14 },
  },
  duration: {
    "shooting-star": [900, 1700],
    wanderer: [18000, 34000],
    anomaly: [7000, 13000],
  },
  shootingStar: {
    length: [56, 150],
    distance: [180, 420],
    angle: [16, 36],
    thickness: [1, 1.6],
    opacity: [0.4, 0.72],
    accentChance: 0.12,
    rightwardChance: 0.62,
  },
  wanderer: {
    size: [18, 52],
    drift: [70, 210],
    spin: [16000, 42000],
    opacity: [0.3, 0.56],
    shapes: { asteroid: 44, moon: 22, sphere: 22, shard: 12 },
  },
  anomaly: {
    orbSize: [5, 11],
    ringSize: [46, 120],
    distortionSize: [60, 140],
    opacity: [0.32, 0.55],
    shapes: { orb: 34, ring: 26, cluster: 22, distortion: 18 },
    tones: { accent: 52, cold: 20, violet: 16, silver: 12 },
    clusterTones: { accent: 42, cold: 32, violet: 16, silver: 10 },
  },
  dust: {
    desktop: 20,
    mobile: 9,
    accentChance: 0.08,
    size: [0.6, 1.8],
    opacity: [0.05, 0.2],
    duration: [28000, 72000],
    drift: [26, 34],
  },
  mobile: {
    delayMultiplier: 1.35,
    sizeMultiplier: 0.8,
  },
};
