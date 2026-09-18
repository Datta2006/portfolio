import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Reveal } from "./motion-primitives";
import { experience } from "../data";

/* ------------------------------------------------------------
   Experience: vertical timeline. Purpose: storytelling - the line
   draws itself with scroll, bullets tick in sequence. scaleY from
   scroll progress, spring-smoothed, no listeners.
   ------------------------------------------------------------ */
export function Experience() {
  const lineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: lineRef,
    offset: ["start 0.75", "end 0.35"],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 25 });

  return (
    <section className="section experience" id="experience">
      <div className="container">
        <Reveal>
          <p className="mono-label">Experience</p>
          <h2 className="display-lg">Where I have worked</h2>
        </Reveal>

        <div className="timeline" ref={lineRef}>
          <div className="timeline-track">
            <motion.div className="timeline-fill" style={{ scaleY, transformOrigin: "top" }} />
          </div>

          <div className="timeline-item">
            <Reveal>
              <div className="timeline-card">
                <p className="timeline-period mono-label">{experience.period}</p>
                <h3 className="display-md">{experience.title}</h3>
                <p className="timeline-company">{experience.company}</p>
                <ul className="timeline-bullets">
                  {experience.bullets.map((b, i) => (
                    <Reveal key={b} delay={0.08 * i}>
                      <li>{b}</li>
                    </Reveal>
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
