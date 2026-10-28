import {
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

/* Enter-on-scroll fade + rise. Purpose: sequence the editorial page
   without running anything per frame. One-shot, transform/opacity only. */
export function Reveal({
  children,
  delay = 0,
  y = 22,
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
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* Display type rises from behind a clip. `active` lets the hero hold
   until the preloader has cleared. */
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
        paddingBottom: "0.06em",
        marginBottom: "-0.06em",
      }}
    >
      <motion.span
        style={{ display: "block" }}
        initial={reduce ? false : { y: "112%" }}
        animate={reduce ? undefined : { y: active ? "0%" : "112%" }}
        transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/* Oversized outlined section indices drift at a different rate than
   the page. Scroll-linked motion value, no state, no listeners. */
export function ScrollGhost({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [36, -36]);

  return (
    <motion.span
      ref={ref}
      className={className}
      aria-hidden="true"
      style={reduce ? undefined : { y }}
    >
      {children}
    </motion.span>
  );
}

/* Clipboard write with timed confirmation. */
export function useCopy(timeout = 1800) {
  const [copied, setCopied] = useState(false);

  const copy = async (value: string) => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(value);
      ok = true;
    } catch {
      const field = document.createElement("textarea");
      field.value = value;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      document.body.removeChild(field);
    }
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), timeout);
    }
  };

  return { copied, copy };
}
