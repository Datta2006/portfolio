/* ------------------------------------------------------------
   The snake's route through the document.

   Waypoints live in document-progress space (0 = top, 1 = bottom)
   and in normalized viewport space (x/y 0..1). The scroll driver
   rebuilds them whenever the measured layout changes. Sampling is
   intentionally pure and allocation-free so it can run every frame.
   ------------------------------------------------------------ */

export type Waypoint = {
  id: string;
  /** Document scroll progress, 0..1. */
  p: number;
  /** Normalized viewport position of the head, 0..1. */
  x: number;
  y: number;
  /** World-space depth in scene units, negative is further away. */
  z: number;
  /** Body scale multiplier. */
  scale: number;
  /** Creature opacity at this waypoint, 0..1. */
  alpha: number;
};

export type PathSample = {
  x: number;
  y: number;
  z: number;
  scale: number;
  alpha: number;
};

const FALLBACK: PathSample = {
  x: 0.9,
  y: 0.5,
  z: 0,
  scale: 1,
  alpha: 0,
};

const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);

const smooth = (t: number) => t * t * (3 - 2 * t);

export function samplePath(
  waypoints: readonly Waypoint[],
  progress: number,
  out: PathSample = { ...FALLBACK },
): PathSample {
  if (waypoints.length === 0) {
    out.x = FALLBACK.x;
    out.y = FALLBACK.y;
    out.z = FALLBACK.z;
    out.scale = FALLBACK.scale;
    out.alpha = FALLBACK.alpha;
    return out;
  }

  const p = clamp01(progress);
  const first = waypoints[0]!;
  const last = waypoints[waypoints.length - 1]!;

  if (p <= first.p) {
    out.x = first.x;
    out.y = first.y;
    out.z = first.z;
    out.scale = first.scale;
    out.alpha = first.alpha;
    return out;
  }
  if (p >= last.p) {
    out.x = last.x;
    out.y = last.y;
    out.z = last.z;
    out.scale = last.scale;
    out.alpha = last.alpha;
    return out;
  }

  for (let i = 1; i < waypoints.length; i += 1) {
    const b = waypoints[i]!;
    if (b.p < p) continue;

    const a = waypoints[i - 1]!;
    const span = b.p - a.p;
    const raw = span <= 1e-6 ? 1 : (p - a.p) / span;
    const t = smooth(clamp01(raw));

    out.x = a.x + (b.x - a.x) * t;
    out.y = a.y + (b.y - a.y) * t;
    out.z = a.z + (b.z - a.z) * t;
    out.scale = a.scale + (b.scale - a.scale) * t;
    out.alpha = a.alpha + (b.alpha - a.alpha) * t;
    return out;
  }

  out.x = last.x;
  out.y = last.y;
  out.z = last.z;
  out.scale = last.scale;
  out.alpha = last.alpha;
  return out;
}
