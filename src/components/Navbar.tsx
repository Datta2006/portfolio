import { useEffect, useState } from "react";
import { motion, useMotionValueEvent, useScroll, AnimatePresence, useReducedMotion } from "framer-motion";
import { Magnetic } from "./motion-primitives";

const LINKS = [
  { label: "Work", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

/* ------------------------------------------------------------
   Navbar: floating pill. Purpose: spatial consistency (where am I).
   useScroll-driven shrink (no scroll listeners), IntersectionObserver
   for active section, staggered full-screen mobile menu.
   ------------------------------------------------------------ */
export function Navbar({ ready }: { ready: boolean }) {
  const { scrollY } = useScroll();
  const [condensed, setCondensed] = useState(false);
  const [active, setActive] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);
  const reduce = useReducedMotion();

  useMotionValueEvent(scrollY, "change", (v) => {
    setCondensed(v > 80);
  });

  useEffect(() => {
    const ids = LINKS.map((l) => l.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ready]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
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
        className={`nav ${condensed ? "nav-condensed" : ""}`}
        initial={reduce ? false : { y: -80, opacity: 0 }}
        animate={ready ? { y: 0, opacity: 1 } : undefined}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      >
        <div className="nav-inner">
          <a href="#top" className="nav-logo" aria-label="Home">
            <span className="nav-logo-mark">D</span>
            <span className="nav-logo-text">Datta L</span>
          </a>

          <nav className="nav-links" aria-label="Primary">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`nav-link ${active === link.href.slice(1) ? "is-active" : ""}`}
              >
                {link.label}
              </a>
            ))}
            <Magnetic strength={0.25}>
              <a href="#contact" className="nav-cta">
                Say hello
              </a>
            </Magnetic>
          </nav>

          <button
            type="button"
            className="nav-burger"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-haspopup="dialog"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {LINKS.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                className="mobile-link"
                onClick={() => setMenuOpen(false)}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                {link.label}
              </motion.a>
            ))}
            <motion.a
              href={`mailto:ldatta01.dl@gmail.com`}
              className="mobile-link mobile-link-accent"
              onClick={() => setMenuOpen(false)}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + LINKS.length * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              Say hello
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
