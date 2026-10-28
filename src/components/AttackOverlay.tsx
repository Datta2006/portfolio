import type { SnakeState } from "../three/snakeMachine";

/* A DOM vignette, deliberately separate from the 3D canvas. It has
   no pointer events and never opens a dialog, steals focus, or
   moves the document. Under reduced motion this layer is never
   mounted. */
export function AttackOverlay({ phase }: { phase: SnakeState }) {
  return <div className="attack-overlay" data-phase={phase} aria-hidden="true" />;
}
