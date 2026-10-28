import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "@phosphor-icons/react";
import { MaskedLine } from "./motion-primitives";
import { profile, socials } from "../data";

/* ------------------------------------------------------------
   Hero: an asymmetric editorial opening. Oversized name as the
   typographic anchor, a cropped orbital body off-centre, metadata
   in the margins, and the real introduction set as a column rather
   than a centred paragraph. All animation is additive decoration.
   ------------------------------------------------------------ */
export function Hero({ ready }: { ready: boolean }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const planetY = useTransform(scrollYProgress, [0, 1], [0, 130]);

  return (
    <section className="hero" id="top" ref={ref}>
      <div className="shell hero-shell">
        <div className="hero-top">
          <span className="mono">[ 00 ] — PORTFOLIO / INDEX</span>
          <span className="mono hero-top-mid">AN ENGINEER&apos;S UNIVERSE</span>
          <span className="mono">2026 / BENGALURU, IN</span>
        </div>

        <div className="hero-stage">
          <motion.div
            className="hero-planet"
            aria-hidden="true"
            style={reduce ? undefined : { y: planetY }}
          >
            <span className="hero-planet-body" />
            <span className="hero-planet-ring" />
            <span className="hero-planet-orbit" />
            <span className="hero-planet-glint" />
          </motion.div>
          <span className="hero-figure mono" aria-hidden="true">
            FIG. 001 / ORBITAL BODY
          </span>

          <div className="hero-name-wrap">
            <h1 className="hero-name" aria-label={profile.name}>
              <MaskedLine active={ready} delay={0.08}>
                <span aria-hidden="true">
                  DATTA<span className="hero-initial">L</span>
                </span>
              </MaskedLine>
            </h1>
            <motion.div
              className="hero-role-line"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={ready ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="mono">SOFTWARE ENGINEER</span>
              <span className="mono">BACKEND / DISTRIBUTED SYSTEMS</span>
              <span className="mono">AI + LLM APPLICATIONS</span>
            </motion.div>
          </div>

          <span className="hero-vertical mono" aria-hidden="true">
            VOID — AN ENGINEER&apos;S UNIVERSE
          </span>
        </div>

        <motion.div
          className="hero-lower"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="hero-statement">
            <p className="hero-availability mono">
              <span className="status-dot" aria-hidden="true" />
              {profile.availability}
            </p>
            <p className="hero-tagline">{profile.tagline}</p>
          </div>

          <div className="hero-actions">
            <a href="#projects" className="btn btn-primary">
              VIEW PROJECT INDEX
              <ArrowUpRight size={15} weight="bold" aria-hidden="true" />
            </a>
            <a href="#contact" className="btn btn-ghost">
              INITIATE CONTACT
              <ArrowUpRight size={15} weight="bold" aria-hidden="true" />
            </a>
          </div>

          <div className="hero-social">
            <span className="mono hero-social-label">CHANNELS</span>
            {socials.map((social, i) => (
              <a
                key={social.label}
                href={social.href}
                className="hero-social-link"
                target={social.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
              >
                <span className="mono hero-social-index">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {social.label}
              </a>
            ))}
          </div>
        </motion.div>

        <div className="hero-foot">
          <a href="#projects" className="scroll-cue">
            <span className="mono">SCROLL TO EXPLORE</span>
            <span className="scroll-line" aria-hidden="true" />
          </a>
          <span className="mono hero-coords">12.9716° N / 77.5946° E</span>
        </div>
      </div>
    </section>
  );
}
