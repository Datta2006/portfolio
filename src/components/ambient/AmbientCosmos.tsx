import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type AnimationEvent as ReactAnimationEvent,
  type CSSProperties,
} from "react";
import { useReducedMotion } from "framer-motion";
import { AMBIENT_CONFIG, TONE_RGB, type AmbientEvent, type Tone } from "./config";
import { AmbientScheduler, buildDust } from "./scheduler";

type CSSVars = CSSProperties & Record<string, string | number>;

const COMPACT_QUERY = "(max-width: 760px), (pointer: coarse)";

function useCompactViewport() {
  const [compact, setCompact] = useState(
    () => typeof window !== "undefined" && window.matchMedia(COMPACT_QUERY).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(COMPACT_QUERY);
    const update = () => setCompact(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return compact;
}

function toneVar(tone: Tone): string {
  return TONE_RGB[tone];
}

export function AmbientCosmos() {
  const reduce = useReducedMotion();
  const compact = useCompactViewport();
  const [events, setEvents] = useState<AmbientEvent[]>([]);
  const schedulerRef = useRef<AmbientScheduler | null>(null);

  const dust = useMemo(
    () =>
      buildDust(
        compact ? AMBIENT_CONFIG.dust.mobile : AMBIENT_CONFIG.dust.desktop,
      ),
    [compact],
  );

  useEffect(() => {
    if (reduce) {
      setEvents([]);
      return;
    }

    const scheduler = new AmbientScheduler(compact, setEvents);
    schedulerRef.current = scheduler;
    scheduler.start();

    return () => {
      scheduler.stop();
      schedulerRef.current = null;
    };
  }, [compact, reduce]);

  const handleDone = useCallback((id: number) => {
    schedulerRef.current?.remove(id);
  }, []);

  return (
    <div className="ambient-cosmos" aria-hidden="true">
      <div className="ambient-dust-field">
        {dust.map((particle, index) => (
          <span
            key={index}
            className={`ambient-dust${particle.accent ? " is-accent" : ""}`}
            style={
              {
                "--x": `${particle.x}%`,
                "--y": `${particle.y}%`,
                "--size": `${particle.size}px`,
                "--o": particle.opacity,
                "--dur": `${particle.duration}ms`,
                "--delay": `${particle.delay}ms`,
                "--dx": `${particle.dx}px`,
                "--dy": `${particle.dy}px`,
              } as CSSVars
            }
          />
        ))}
      </div>

      {!reduce &&
        events.map((event) => (
          <EventView key={event.id} event={event} onDone={handleDone} />
        ))}
    </div>
  );
}

function EventView({
  event,
  onDone,
}: {
  event: AmbientEvent;
  onDone: (id: number) => void;
}) {
  const handleEnd = (e: ReactAnimationEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onDone(event.id);
  };

  if (event.kind === "shooting-star") {
    return (
      <div
        className="ambient-event ambient-shoot"
        style={
          {
            "--x": `${event.x}%`,
            "--y": `${event.y}%`,
            "--len": `${event.length}px`,
            "--th": `${event.thickness}px`,
            "--angle": `${event.angle}deg`,
            "--dist": `${event.distance}px`,
            "--dur": `${event.duration}ms`,
            "--o": event.opacity,
            "--tone-rgb": toneVar(event.tone),
          } as CSSVars
        }
        onAnimationEnd={handleEnd}
      />
    );
  }

  if (event.kind === "wanderer") {
    return (
      <div
        className="ambient-event ambient-wanderer"
        style={
          {
            "--x": `${event.x}%`,
            "--y": `${event.y}%`,
            "--size": `${event.size}px`,
            "--dx": `${event.driftX}px`,
            "--dy": `${event.driftY}px`,
            "--dur": `${event.duration}ms`,
            "--o": event.opacity,
          } as CSSVars
        }
        onAnimationEnd={handleEnd}
      >
        <span
          className={`ambient-wanderer-body shape-${event.shape}`}
          style={
            {
              "--spin": `${event.spin}ms`,
              "--spin-dir": event.spinReverse ? "reverse" : "normal",
            } as CSSVars
          }
        />
      </div>
    );
  }

  return (
    <div
      className="ambient-event ambient-anomaly"
      style={
        {
          "--x": `${event.x}%`,
          "--y": `${event.y}%`,
          "--size": `${event.size}px`,
          "--dur": `${event.duration}ms`,
          "--o": event.opacity,
          "--tone-rgb": toneVar(event.tone),
        } as CSSVars
      }
      onAnimationEnd={handleEnd}
    >
      {event.shape === "orb" && <span className="anomaly-orb" />}
      {event.shape === "ring" && <span className="anomaly-ring" />}
      {event.shape === "distortion" && <span className="anomaly-distortion" />}
      {event.shape === "cluster" &&
        event.particles.map((particle, index) => (
          <span
            key={index}
            className="anomaly-particle"
            style={
              {
                "--px": `${particle.px}px`,
                "--py": `${particle.py}px`,
                "--r": `${particle.r}px`,
                "--delay": `${particle.delay}s`,
                "--tone-rgb": toneVar(particle.tone),
              } as CSSVars
            }
          />
        ))}
    </div>
  );
}
