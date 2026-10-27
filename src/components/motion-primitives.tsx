import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent,
} from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";

/* ------------------------------------------------------------
   Magnetic: pulls its child toward the cursor with spring physics.
   Motion values only, zero re-renders. Hover-capable pointers only;
   static under prefers-reduced-motion.
   ------------------------------------------------------------ */
export function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 14, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 180, damping: 14, mass: 0.4 });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: sx, y: sy, display: "inline-block" }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------
   CursorGlow: the hero background itself shifts warmth with the
   pointer. Purpose: delight (marketing tier). One oversized,
   pre-rasterised gradient moved with transform only - no canvas,
   no per-frame paint, no React re-renders. Oversized and soft so
   it reads as ambient light, not a blob stuck to the cursor.
   Desktop hover pointers only; absent under reduced motion.
   ------------------------------------------------------------ */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const blob = el.firstElementChild as HTMLElement | null;
    if (!blob) return;

    let rect = el.getBoundingClientRect();
    let targetX = rect.width / 2;
    let targetY = rect.height * 0.4;
    let x = targetX;
    let y = targetY;
    let tracked = false;
    let visible = false;
    let raf = 0;

    const measure = () => {
      rect = el.getBoundingClientRect();
    };

    const render = () => {
      const dx = targetX - x;
      const dy = targetY - y;
      x += dx * 0.07;
      y += dy * 0.07;
      blob.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(3.4)`;

      raf = Math.abs(dx) > 0.15 || Math.abs(dy) > 0.15 ? requestAnimationFrame(render) : 0;
    };

    const onMove = (event: PointerEvent) => {
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (inside !== visible) {
        visible = inside;
        el.classList.toggle("is-visible", visible);
      }
      if (!inside) return;

      targetX = event.clientX - rect.left;
      targetY = event.clientY - rect.top;

      if (!tracked) {
        tracked = true;
        x = targetX;
        y = targetY;
      }

      if (!raf) raf = requestAnimationFrame(render);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="cursor-glow" aria-hidden="true">
      <span className="cursor-glow-blob" />
    </div>
  );
}

/* ------------------------------------------------------------
   Reveal: enter-on-scroll fade + rise. Purpose: storytelling
   (content arrives as you reach it). once-only, no scroll listeners.
   ------------------------------------------------------------ */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* Masked line reveal for display type: text rises from behind a clip.
   `active=false` holds the line hidden (used to sync with the preloader). */
export function MaskedLine({
  children,
  delay = 0,
  className,
  active = true,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  active?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <span
      className={className}
      style={{
        display: "block",
        overflow: "hidden",
        paddingBottom: "0.08em",
        marginBottom: "-0.08em",
      }}
    >
      <motion.span
        style={{ display: "block" }}
        initial={reduce ? false : { y: "110%" }}
        animate={reduce ? undefined : { y: active ? "0%" : "110%" }}
        transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/* ------------------------------------------------------------
   useScramble: decode-style text reveal on mount. Purpose:
   first-impression delight, hero only (rare/first-time tier).
   ------------------------------------------------------------ */
const GLYPHS = "!<>-_\\/[]{}=+*^?#";

export function useScramble(target: string, active: boolean, speed = 28) {
  const reduce = useReducedMotion();
  const [text, setText] = useState(reduce ? target : "");

  useEffect(() => {
    if (reduce || !active) return;
    let frame = 0;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      if (now - last >= speed) {
        last = now;
        frame += 1;
        const settled = Math.floor(frame / 2);
        let out = "";
        for (let i = 0; i < target.length; i += 1) {
          if (target[i] === " ") {
            out += " ";
          } else if (i < settled) {
            out += target[i];
          } else {
            out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          }
        }
        setText(out);
        if (settled >= target.length) return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, speed, reduce]);

  return text;
}

/* ------------------------------------------------------------
   useCopy: clipboard with timed confirmation. Purpose: feedback.
   ------------------------------------------------------------ */
export function useCopy(timeout = 1600) {
  const [copied, setCopied] = useState(false);

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), timeout);
    } catch {
      /* clipboard unavailable: no-op */
    }
  };

  return { copied, copy };
}

