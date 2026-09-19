import { useRef } from "react";
import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";
import { Reveal } from "./motion-primitives";
import { experience } from "../data";

/* ------------------------------------------------------------
   Experience: vertical timeline. Purpose: storytelling - the line
   draws itself with scroll, bullets tick in sequence. scaleY from
   scroll progress, spring-smoothed, no listeners.
   ------------------------------------------------------------ */
export function Experience() {
  const reduce = useReducedMotion();
  const lineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: lineRef,
    offset: ["start 0.75", "end 0.35"],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 25 });

  return (
    <section className="section section-line experience" id="experience">
      <div className="container">
        <Reveal>
          <p className="mono-label">Experience</p>
          <h2 className="display-lg">Where I have worked</h2>
        </Reveal>

        <div className="timeline" ref={lineRef}>
          <div className="timeline-track">
            <motion.div
              className="timeline-fill"
              style={reduce ? undefined : { scaleY, transformOrigin: "top" }}
            />
          </div>

          <div className="timeline-item">
            <Reveal>
              <div className="timeline-card">
                <p className="timeline-period mono-label">{experience.period}</p>
                <h3 className="display-md">{experience.title}</h3>
                <p className="timeline-company">{experience.company}</p>
                <ul className="timeline-bullets">
                  {experience.bullets.map((b, i) => (
                    <motion.li
                      key={b}
                      initial={reduce ? false : { opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{ duration: 0.5, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {b}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
