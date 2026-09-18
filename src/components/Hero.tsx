import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, GithubLogo, LinkedinLogo, EnvelopeSimple } from "@phosphor-icons/react";
import { Magnetic, MaskedLine, useScramble } from "./motion-primitives";
import { profile, socials } from "../data";

const SOCIAL_ICONS = {
  github: GithubLogo,
  linkedin: LinkedinLogo,
  mail: EnvelopeSimple,
} as const;

export function Hero({ ready }: { ready: boolean }) {
  const reduce = useReducedMotion();
  const role = useScramble("Full Stack Developer", ready);

  return (
    <section className="hero" id="top">
      <div className="hero-grid-bg" aria-hidden="true" />
      <div className="glow hero-glow" aria-hidden="true" />

      <div className="container hero-inner">
        <motion.p
          className="hero-eyebrow mono-label"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          {profile.location} - {profile.availability}
        </motion.p>

        <h1 className="hero-title display-xl">
          <MaskedLine delay={ready ? 0.2 : 0}>{profile.name}</MaskedLine>
          <span className="hero-title-accent">
            <MaskedLine delay={ready ? 0.32 : 0}>
              {role || "\u00A0"}
              {ready && !reduce && (
                <motion.span
                  aria-hidden="true"
                  className="hero-caret"
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.7, repeatType: "mirror" }}
                />
              )}
              <span className="visually-hidden">{profile.role}</span>
            </MaskedLine>
          </span>
        </h1>

        <motion.p
          className="hero-tagline lead"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.7, delay: 0.55 }}
        >
          {profile.tagline}
        </motion.p>

        <motion.div
          className="hero-ctas"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.7, delay: 0.7 }}
        >
          <Magnetic strength={0.3}>
            <a href="#projects" className="btn btn-primary">
              View projects
              <ArrowRight size={16} weight="bold" />
            </a>
          </Magnetic>
          <Magnetic strength={0.3}>
            <a href="#contact" className="btn btn-ghost">
              Get in touch
              <ArrowUpRight size={16} weight="bold" />
            </a>
          </Magnetic>
        </motion.div>

        <motion.div
          className="hero-social"
          initial={reduce ? false : { opacity: 0 }}
          animate={ready ? { opacity: 1 } : undefined}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          {socials.map((s) => {
            const Icon = SOCIAL_ICONS[s.icon as keyof typeof SOCIAL_ICONS];
            return (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="social-link"
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
              >
                <Icon size={20} weight="regular" />
              </a>
            );
          })}
          <span className="hero-social-line" aria-hidden="true" />
        </motion.div>
      </div>
    </section>
  );
}
