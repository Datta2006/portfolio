import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Copy, Check } from "@phosphor-icons/react";
import { Magnetic, Reveal, useCopy, CopyFeedback } from "./motion-primitives";
import { profile, socials } from "../data";

/* ------------------------------------------------------------
   Contact: full-height closing section. Purpose: hierarchy -
   one giant headline, one primary action. Email CTA + clipboard
   fallback with animated confirmation. Parallax exit on scroll.
   ------------------------------------------------------------ */
export function Contact() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [60, 0]);

  const { copied, copy } = useCopy();

  return (
    <section className="section contact" id="contact" ref={ref}>
      <div className="glow contact-glow" aria-hidden="true" />
      <motion.div
        className="container contact-inner"
        style={reduce ? undefined : { y }}
      >
        <Reveal>
          <p className="mono-label">Contact</p>
          <h2 className="display-xl contact-title">
            Let's build something
            <span className="contact-title-accent"> worth shipping.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="lead contact-lead">
            I'm currently open to full-time roles and interesting collaborations. The fastest way to reach me is email.
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="contact-actions">
            <Magnetic strength={0.3}>
              <a href={`mailto:${profile.email}`} className="btn btn-primary btn-lg">
                {profile.email}
                <ArrowUpRight size={18} weight="bold" />
              </a>
            </Magnetic>
            <Magnetic strength={0.3}>
              <button type="button" className="btn btn-ghost" onClick={() => copy(profile.email)}>
                {copied ? <Check size={16} weight="bold" /> : <Copy size={16} weight="bold" />}
                {copied ? "Copied" : "Copy email"}
              </button>
            </Magnetic>
          </div>
        </Reveal>

        <Reveal delay={0.28}>
          <div className="contact-meta">
            <span className="mono-label">{profile.phone}</span>
            <span className="mono-label">{profile.location}</span>
            <CopyFeedback show={copied} />
          </div>
        </Reveal>
      </motion.div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span className="footer-name">Datta L</span>
        <div className="footer-links">
          {socials.map((s) => (
            <a key={s.label} href={s.href} target={s.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="footer-link">
              {s.label}
            </a>
            ))}
        </div>
        <span className="footer-copy mono-label">Built with React and framer-motion</span>
      </div>
    </footer>
  );
}
