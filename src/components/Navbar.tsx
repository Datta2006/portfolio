import { useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";

const LINKS = [
  { index: "01", label: "Work", href: "#projects" },
  { index: "02", label: "Log", href: "#experience" },
  { index: "03", label: "Skills", href: "#skills" },
  { index: "04", label: "Education", href: "#education" },
  { index: "05", label: "Contact", href: "#contact" },
];

/* ------------------------------------------------------------
   Navigation: a compact editorial masthead, not a floating pill.
   Active section via IntersectionObserver, a scroll-progress
   hairline driven by a motion value, and a full-screen mobile
   index with oversized links.
   ------------------------------------------------------------ */
export function Navbar({ ready }: { ready: boolean }) {
  const { scrollY, scrollYProgress } = useScroll();
  const [condensed, setCondensed] = useState(false);
  const [active, setActive] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const reduce = useReducedMotion();

  useMotionValueEvent(scrollY, "change", (value) => {
    setCondensed(value > 40);
  });

  useEffect(() => {
    const ids = LINKS.map((link) => link.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-42% 0px -52% 0px" },
    );
    ids.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [ready]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <motion.header
        className={`nav ${condensed ? "nav-condensed" : ""}`.trim()}
        initial={reduce ? false : { y: -24, opacity: 0 }}
        animate={ready ? { y: 0, opacity: 1 } : undefined}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
      >
        <div className="shell nav-inner">
          <a href="#top" className="nav-logo" aria-label="Datta L — back to top">
            <span className="nav-mark" aria-hidden="true">
              D
            </span>
            <span className="nav-wordmark">
              DATTA L
              <span className="mono nav-role">SOFTWARE ENGINEER</span>
            </span>
          </a>

          <nav className="nav-links" aria-label="Primary">
            {LINKS.map((link) => {
              const id = link.href.slice(1);
              const isActive = active === id;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${isActive ? "is-active" : ""}`.trim()}
                  aria-current={isActive ? "location" : undefined}
                >
                  <span className="mono nav-index">{link.index}</span>
                  <span>{link.label}</span>
                </a>
              );
            })}
          </nav>

          <div className="nav-meta">
            <span className="nav-status mono">
              <span className="status-dot" aria-hidden="true" />
              OPEN
            </span>
            <button
              type="button"
              className="nav-burger"
              aria-label={menuOpen ? "Close index" : "Open index"}
              aria-expanded={menuOpen}
              aria-haspopup="dialog"
              onClick={() => setMenuOpen((value) => !value)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
        <motion.span
          className="nav-progress"
          aria-hidden="true"
          style={{ scaleX: reduce ? 1 : scrollYProgress }}
        />
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site index"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="shell mobile-menu-inner">
              <span className="mono mobile-menu-label">INDEX / 05 CHAPTERS</span>
              <nav className="mobile-links" aria-label="Mobile primary">
                {LINKS.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    className="mobile-link"
                    onClick={() => setMenuOpen(false)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.06 + i * 0.05,
                      duration: 0.4,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <span className="mono">{link.index}</span>
                    {link.label}
                  </motion.a>
                ))}
              </nav>
              <div className="mobile-menu-foot mono">
                <span>BENGALURU, IN</span>
                <span>12.9716° N / 77.5946° E</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
