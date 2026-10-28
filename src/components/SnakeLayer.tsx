import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { SnakeMachine, type SnakeState } from "../three/snakeMachine";
import { playHiss, primeAudio } from "../three/hiss";
import { AttackOverlay } from "./AttackOverlay";
import { SnakeControls } from "./SnakeControls";
import { WebGLFallback } from "./WebGLFallback";

const LazySnakeCanvas = lazy(() => import("../three/SnakeCanvas"));

function supportsWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    return Boolean(gl);
  } catch {
    return false;
  }
}

function readBoolean(key: string, fallback: boolean): boolean {
  try {
    const value = window.localStorage.getItem(key);
    if (value === "1") return true;
    if (value === "0") return false;
  } catch {
    /* storage unavailable */
  }
  return fallback;
}

function writeBoolean(key: string, value: boolean): void {
  try {
    window.localStorage.setItem(key, value ? "1" : "0");
  } catch {
    /* storage unavailable */
  }
}

const INTERACTION_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart"] as const;

export default function SnakeLayer() {
  const reduce = useReducedMotion();
  const [supported] = useState(supportsWebGL);
  const [rendererReady, setRendererReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [phase, setPhase] = useState<SnakeState>("IDLE");

  const [scares, setScares] = useState(() => readBoolean("serpent.scares", true));
  const [sound, setSound] = useState(() => readBoolean("serpent.sound", false));

  const soundRef = useRef(sound);
  soundRef.current = sound;

  const initialScares = useRef(scares);
  const machine = useMemo(() => new SnakeMachine(initialScares.current), []);

  useEffect(() => {
    const unsubscribe = machine.subscribe((next) => {
      setPhase(next);
      if (next === "STRIKE" && soundRef.current) playHiss();
    });
    return unsubscribe;
  }, [machine]);

  useEffect(() => {
    machine.setEnabled(scares);
  }, [machine, scares]);

  useEffect(() => {
    const onInteract = () => machine.registerInteraction();
    INTERACTION_EVENTS.forEach((event) =>
      window.addEventListener(event, onInteract as EventListener, {
        once: true,
        passive: true,
      }),
    );
    return () => {
      INTERACTION_EVENTS.forEach((event) =>
        window.removeEventListener(event, onInteract as EventListener),
      );
    };
  }, [machine]);

  useEffect(() => {
    const onVisibility = () => machine.handleVisibility(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [machine]);

  // Keep the heavy Three.js chunk off the critical path. The layer is
  // only mounted after the preloader is done; this adds one more idle
  // beat so the first interaction stays fast.
  useEffect(() => {
    if (!supported || failed || reduce) return;
    let timeoutId = 0;
    let idleId = 0;

    const mount = () => {
      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(() => setRendererReady(true), {
          timeout: 1400,
        });
      } else {
        setRendererReady(true);
      }
    };

    timeoutId = window.setTimeout(mount, 700);
    return () => {
      window.clearTimeout(timeoutId);
      if (idleId) window.cancelIdleCallback(idleId);
    };
  }, [supported, failed, reduce]);

  if (reduce) return null;

  if (!supported || failed) {
    return <WebGLFallback />;
  }

  const toggleScares = () => {
    const next = !scares;
    setScares(next);
    writeBoolean("serpent.scares", next);
    machine.setEnabled(next);
  };

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    writeBoolean("serpent.sound", next);
    if (next) primeAudio();
  };

  const foreground = phase === "STRIKE" || phase === "RETREAT";

  return (
    <>
      <div
        className={`snake-layer${foreground ? " is-attacking" : ""}`}
        aria-hidden="true"
      >
        {rendererReady && (
          <Suspense fallback={null}>
            <LazySnakeCanvas
              machine={machine}
              onContextLost={() => {
                setRendererReady(false);
                setFailed(true);
              }}
            />
          </Suspense>
        )}
      </div>

      {rendererReady && <AttackOverlay phase={phase} />}

      <SnakeControls
        scares={scares}
        sound={sound}
        onToggleScares={toggleScares}
        onToggleSound={toggleSound}
      />
    </>
  );
}
