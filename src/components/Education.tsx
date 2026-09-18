import { Reveal } from "./motion-primitives";
import { education } from "../data";

/* Education: compact two-entry strip, no card grid. */
export function Education() {
  return (
    <section className="section education" id="education">
      <div className="container">
        <Reveal>
          <h2 className="display-lg">Education</h2>
        </Reveal>
        <div className="edu-list">
          {education.map((e, i) => (
            <Reveal key={e.school} delay={0.08 * i}>
              <div className="edu-row">
                <div className="edu-main">
                  <h3 className="edu-school">{e.school}</h3>
                  <p className="edu-degree">{e.degree}</p>
                </div>
                <div className="edu-meta">
                  <span className="edu-metric">{e.metric}</span>
                  <span className="edu-period mono-label">{e.period}</span>
                </div>
              </div>
              <div className="edu-divider" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
