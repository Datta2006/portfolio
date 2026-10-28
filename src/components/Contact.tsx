import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Check, Copy } from "@phosphor-icons/react";
import { useCopy } from "./motion-primitives";
import { profile, socials } from "../data";

/* ------------------------------------------------------------
   Contact: the closing spread. One oversized invitation, a
   cropped celestial body, and two deliberate actions. The email
   keeps its mailto behaviour and gains a clipboard fallback with
   confirmation. Parallax is decorative only.
   ------------------------------------------------------------ */
export function Contact() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });
  const orbitY = useTransform(scrollYProgress, [0, 1], [90, 0]);
  const { copied, copy } = useCopy();

  return (
    <section className="section contact" id="contact" ref={ref}>
      <motion.div
        className="contact-orbit"
        aria-hidden="true"
        style={reduce ? undefined : { y: orbitY }}
      >
        <span className="contact-orbit-body" />
        <span className="contact-orbit-ring" />
        <span className="contact-orbit-glint" />
      </motion.div>

      <div className="shell contact-shell">
        <div className="contact-top">
          <span className="mono">[ 05 ] — FINAL SIGNAL</span>
          <span className="mono">
            <span className="status-dot" aria-hidden="true" /> CHANNEL OPEN
          </span>
        </div>

        <h2 className="contact-title">
          <span>LET&apos;S BUILD</span>
          <span className="outline">SOMETHING</span>
          <span>
            WORTH SHIPPING<span className="accent">.</span>
          </span>
        </h2>

        <div className="contact-grid">
          <div className="contact-statement">
            <span className="mono">OPEN CHANNEL</span>
            <p>
              I&apos;m currently open to full-time roles and interesting
              collaborations. Email is the fastest way to reach me.
            </p>
            <div className="contact-meta">
              <span className="mono">{profile.phone}</span>
              <span className="mono">{profile.location}</span>
            </div>
          </div>

          <div className="contact-actions">
            <a href={`mailto:${profile.email}`} className="contact-email">
              <span className="mono">EMAIL</span>
              <span className="contact-email-value">
                {profile.email}
                <ArrowUpRight size={22} weight="bold" aria-hidden="true" />
              </span>
            </a>

            <button
              type="button"
              className="contact-copy mono"
              onClick={() => copy(profile.email)}
            >
              {copied ? (
                <Check size={14} weight="bold" aria-hidden="true" />
              ) : (
                <Copy size={14} weight="bold" aria-hidden="true" />
              )}
              {copied ? "COPIED TO CLIPBOARD" : "COPY ADDRESS"}
            </button>

            <div className="contact-socials">
              {socials.map((social, index) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="contact-social"
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                >
                  <span className="mono">{String(index + 1).padStart(2, "0")}</span>
                  {social.label}
                  <ArrowUpRight size={13} weight="bold" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="contact-foot mono">
          <span>SIGNAL / 05 — END OF TRANSMISSION</span>
          <span>12.9716° N / 77.5946° E</span>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="shell footer-grid">
        <div className="footer-id">
          <span className="footer-name">DATTA L</span>
          <span className="mono">SOFTWARE ENGINEER</span>
        </div>

        <div className="footer-socials">
          {socials.map((social, index) => (
            <a
              key={social.label}
              href={social.href}
              className="footer-link"
              target={social.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
            >
              <span className="mono">{String(index + 1).padStart(2, "0")}</span>
              {social.label}
            </a>
          ))}
        </div>

        <div className="footer-meta mono">
          <span>{profile.location}</span>
          <span>© {year}</span>
        </div>

        <span className="mono footer-built">
          VOID / 01 — REACT · TYPESCRIPT · FRAMER MOTION
        </span>
      </div>
    </footer>
  );
}
