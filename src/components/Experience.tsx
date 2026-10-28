import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "./motion-primitives";
import { SectionHeader } from "./SectionHeader";
import { experience } from "../data";

/* ------------------------------------------------------------
   Experience: one internship presented as a system log. Date,
   role, organisation and deliverables are separate visual layers
   connected by a vertical rule. Deliverables tick in once, with
   no continuous motion.
   ------------------------------------------------------------ */
export function Experience() {
  const reduce = useReducedMotion();

  return (
    <section className="section experience" id="experience">
      <div className="shell">
        <SectionHeader
          index="02"
          label="SYSTEM JOURNAL"
          meta="01 ENTRY / 04 DELIVERABLES"
        >
          ENGINEERING
          <br />
          <span className="outline">LOG</span>
        </SectionHeader>

        <div className="log">
          <aside className="log-meta">
            <div className="log-meta-block">
              <span className="mono">TIMESTAMP</span>
              <span className="log-period">{experience.period}</span>
            </div>
            <div className="log-meta-block">
              <span className="mono">ORGANIZATION</span>
              <span className="log-org">{experience.company}</span>
            </div>
            <div className="log-meta-block">
              <span className="mono">ROLE CLASS</span>
              <span className="log-value">INTERNSHIP / SDE</span>
            </div>
            <div className="log-meta-block">
              <span className="mono">ENTRIES</span>
              <span className="log-value">04 RECORDS</span>
            </div>
            <span className="mono log-id">LOG_001</span>
            <span className="log-orbit" aria-hidden="true">
              <span />
            </span>
          </aside>

          <div className="log-main">
            <Reveal>
              <div className="log-title">
                <span className="mono log-title-kicker">LOG ENTRY — 001</span>
                <h3>{experience.title}</h3>
                <p className="log-company">
                  {experience.company}
                  <span className="mono"> / {experience.period}</span>
                </p>
              </div>
            </Reveal>

            <ol className="log-bullets">
              {experience.bullets.map((bullet, index) => (
                <motion.li
                  key={bullet}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.06 * index,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <span className="mono log-bullet-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p>{bullet}</p>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>

        <div className="log-foot mono">
          <span>ENTRY_001 — END OF LOG</span>
          <span>04 / 04 RECORDS</span>
        </div>
      </div>
    </section>
  );
}
