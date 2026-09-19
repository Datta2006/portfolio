import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { profile } from "../data";

/* ------------------------------------------------------------
   Preloader: branded intro curtain. Purpose: delight at the
   rare/first-time tier. Runs once per load (a completed-run ref
   guards against StrictMode remounts restarting it), ~1.4s total:
   name mask reveal + counter, then exits upward. Skips entirely
   under prefers-reduced-motion. Body scroll stays locked until
   the exit animation completes.
   ------------------------------------------------------------ */
export function Preloader({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(0);
  const [exiting, setExiting] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    if (doneRef.current) return;
    if (reduce) {
      doneRef.current = true;
      onDone();
      return;
    }
    document.body.style.overflow = "hidden";

    const start = performance.now();
    const DURATION = 900;
    let raf = 0;

    const tick = (now: number) => {
      const p = Math.min((now - start) / DURATION, 1);
      setCount(Math.round(p * 100));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setExiting(true);
        window.setTimeout(() => {
          document.body.style.overflow = "";
          doneRef.current = true;
          onDone();
        }, 500);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
  }, [reduce, onDone]);

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="preloader"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.55, ease: [0.77, 0, 0.175, 1] }}
        >
          <div className="preloader-inner">
            <span
              style={{
                display: "block",
                overflow: "hidden",
                paddingBottom: "0.1em",
              }}
            >
              <motion.span
                className="preloader-name"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                {profile.name}
              </motion.span>
            </span>
            <motion.span
              className="preloader-role mono-label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              {profile.role}
            </motion.span>
          </div>
          <span className="preloader-count" aria-hidden="true">
            {String(count).padStart(3, "0")}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
