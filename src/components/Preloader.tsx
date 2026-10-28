import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { profile } from "../data";

/* ------------------------------------------------------------
   Preloader: a brief masthead. One identity line, a counter and
   an accent rule, gone in under a second. It skips entirely for
   reduced motion and never keeps the page locked after exiting.
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
    const DURATION = 700;
    let raf = 0;
    let lastPaint = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / DURATION, 1);
      if (now - lastPaint > 45) {
        setCount(Math.round(progress * 100));
        lastPaint = now;
      }
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        doneRef.current = true;
        setExiting(true);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
  }, [reduce, onDone]);

  if (reduce) return null;

  return (
    <AnimatePresence
      onExitComplete={() => {
        document.body.style.overflow = "";
        onDone();
      }}
    >
      {!exiting && (
        <motion.div
          className="preloader"
          aria-hidden="true"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.45, ease: [0.77, 0, 0.175, 1] }}
        >
          <div className="shell preloader-shell">
            <div className="preloader-top mono">
              <span>VOID / 01</span>
              <span>AN ENGINEER&apos;S UNIVERSE</span>
            </div>

            <div className="preloader-mid">
              <span className="preloader-name">VOID</span>
              <span className="preloader-sat" />
              <span className="preloader-sub mono">
                {profile.name} — {profile.role}
              </span>
            </div>

            <div className="preloader-bottom">
              <span className="mono">INITIALIZING SIGNAL</span>
              <span className="preloader-bar-track">
                <motion.span
                  className="preloader-bar"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: count / 100 }}
                  transition={{ ease: "linear", duration: 0.08 }}
                />
              </span>
              <span className="mono preloader-count">
                {String(count).padStart(3, "0")}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
